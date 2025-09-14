import os
import time
import hvac
import redis
import base64
import logging
from typing import Dict, Optional

# Import the central settings
from .settings import get_settings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def base64ify(bytes_or_str: bytes | str) -> str:
    """Helper method to perform base64 encoding."""
    if isinstance(bytes_or_str, str):
        input_bytes = bytes_or_str.encode('utf8')
    else:
        input_bytes = bytes_or_str
    output_bytes = base64.urlsafe_b64encode(input_bytes)
    return output_bytes.decode('ascii')

class KeyManager:
    def __init__(self):
        """Initialize KeyManager with Vault and Redis integration from central settings."""
        settings = get_settings()

        # Vault client setup
        self.vault_client = hvac.Client(url=settings.vault_addr, token=settings.vault_token)
        if not self.vault_client.is_authenticated():
            raise ValueError("Failed to authenticate with Vault")

        # Transit engine setup (assume enabled; enable if needed)
        self.transit_key_name = 'pat-encryption-key'
        try:
            self.vault_client.secrets.transit.read_key(name=self.transit_key_name)
        except hvac.exceptions.InvalidPath:
            self.vault_client.secrets.transit.create_key(name=self.transit_key_name, exportable=False)
            logger.info(f"Created transit key '{self.transit_key_name}'")

        # Redis client setup (use TLS in production: ssl=True, etc.)
        self.redis_client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            password=settings.redis_password
        )

        # Configuration
        self.cache_duration = 3600  # 1 hour TTL for cached tokens
        self.activity_threshold = 100  # Max requests before warning
        self.activity_window = 300  # 5 minutes for activity tracking
        self.kv_mount_point = 'secret'  # KV v2 mount point

    def set_key(self, username: str, key_name: str, key_value: str) -> None:
        """Store a key securely in Vault KV and invalidate any existing cache."""
        try:
            # Store in Vault KV v2
            self.vault_client.secrets.kv.v2.create_or_update_secret(
                path=f"{username}/{key_name}",
                secret=dict(value=key_value),
                mount_point=self.kv_mount_point
            )
            logger.info(f"Stored key '{key_name}' for user '{username}' in Vault KV")

            # Invalidate cache if exists
            self._delete_cache(username, key_name)
        except Exception as e:
            logger.error(f"Failed to store key for {username}: {str(e)}")
            raise

    def get_key(self, username: str, key_name: str) -> Optional[str]:
        """Retrieve a key from Redis cache (encrypted) or Vault, with activity tracking."""
        cache_key = f"{username}:{key_name}:token"
        activity_key = f"{username}:activity"

        # Track activity
        self._track_activity(activity_key)
        if self._detect_unusual_activity(activity_key):
            logger.warning(f"Unusual activity detected for {username}. Issuing warning.")
            self._issue_warning(username)
            if self._should_logout(activity_key):
                self.logout_user(username, key_name)
                logger.info(f"User {username} logged out due to unusual activity")
                return None

        # Check Redis cache
        encrypted_token = self.redis_client.get(cache_key)
        if encrypted_token:
            try:
                # Decrypt using Vault Transit
                decrypt_response = self.vault_client.secrets.transit.decrypt_data(
                    name=self.transit_key_name,
                    ciphertext=encrypted_token.decode('utf-8')
                )
                token = base64.urlsafe_b64decode(decrypt_response['data']['plaintext']).decode('utf-8')
                logger.info(f"Retrieved and decrypted cached key '{key_name}' for {username} from Redis")
                return token
            except Exception as e:
                logger.error(f"Failed to decrypt cached token for {username}: {str(e)}")
                self._delete_cache(username, key_name)  # Invalidate bad cache

        # Fetch from Vault KV if not in cache
        try:
            secret = self.vault_client.secrets.kv.v2.read_secret_version(
                path=f"{username}/{key_name}",
                mount_point=self.kv_mount_point
            )
            token = secret['data']['data']['value']

            # Encrypt using Vault Transit
            encrypt_response = self.vault_client.secrets.transit.encrypt_data(
                name=self.transit_key_name,
                plaintext=base64ify(token)
            )
            encrypted_token = encrypt_response['data']['ciphertext']

            # Cache in Redis with TTL
            self.redis_client.set(cache_key, encrypted_token, ex=self.cache_duration)
            logger.info(f"Fetched key '{key_name}' from Vault, encrypted, and cached in Redis for {username}")
            return token
        except Exception as e:
            logger.error(f"Failed to fetch key '{key_name}' for {username} from Vault: {str(e)}")
            return None

    def get_github_token(self, username: str) -> Optional[str]:
        """Retrieve GitHub token for a user, with environment fallback for initial setup."""
        github_token = os.environ.get("GTM_GITHUB_TOKEN")
        if github_token and not self._cache_exists(username, "github_token"):
            self.set_key(username, "github_token", github_token)
        return self.get_key(username, "github_token")

    def _cache_exists(self, username: str, key_name: str) -> bool:
        cache_key = f"{username}:{key_name}:token"
        return self.redis_client.exists(cache_key)

    def _delete_cache(self, username: str, key_name: str) -> None:
        cache_key = f"{username}:{key_name}:token"
        self.redis_client.delete(cache_key)
        logger.info(f"Deleted cache for {username}:{key_name}")

    def _track_activity(self, activity_key: str) -> None:
        """Track activity by incrementing a counter with TTL for the window."""
        pipe = self.redis_client.pipeline()
        pipe.incr(activity_key)
        pipe.expire(activity_key, self.activity_window)
        pipe.execute()

    def _detect_unusual_activity(self, activity_key: str) -> bool:
        """Detect if activity exceeds threshold."""
        count = self.redis_client.get(activity_key)
        return int(count or 0) > self.activity_threshold

    def _issue_warning(self, username: str) -> None:
        """Issue a warning (extendable to notifications)."""
        logger.warning(f"Warning: High activity for user {username}. Review usage.")

    def _should_logout(self, activity_key: str) -> bool:
        """Determine if logout is needed (e.g., exceeds 2x threshold)."""
        count = self.redis_client.get(activity_key)
        return int(count or 0) > self.activity_threshold * 2

    def logout_user(self, username: str, key_name: str) -> None:
        """Invalidate cached token."""
        self._delete_cache(username, key_name)
        activity_key = f"{username}:activity"
        self.redis_client.delete(activity_key)
        logger.info(f"Logged out user {username} for key {key_name}")

# Global instance for the application to use
key_manager = KeyManager()