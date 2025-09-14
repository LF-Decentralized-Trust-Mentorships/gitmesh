from typing import Optional
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from models.api.auth_models import User
from utils.auth_utils import security_utils, jwt_handler
from .sessions import user_sessions, load_sessions
from config.key_manager import key_manager

logger = structlog.get_logger(__name__)
security = HTTPBearer(auto_error=False)

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[User]:
    """Get current authenticated user."""
    load_sessions()
    if not credentials:
        return None
    
    token = credentials.credentials
    
    # Handle demo token
    if token == 'demo-token':
        from utils.auth_utils import get_demo_user
        return User(**get_demo_user())
    
    try:
        payload = jwt_handler.verify_token(token)
        session_id = payload.get('session_id')
        
        if session_id in user_sessions:
            session = user_sessions[session_id]
            return User(**session)
        
        return None
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return None

def get_github_token(user: Optional[User] = Depends(get_current_user)) -> str:
    """
    Dependency to get the authenticated user's GitHub access token from the KeyManager.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")

    if user.login == 'demo-user':
        return 'demo-github-token'

    try:
        # Retrieve the token from Vault/Redis via the KeyManager
        token = key_manager.get_github_token(username=user.login)
        if not token:
            raise HTTPException(status_code=404, detail="GitHub token not found for user.")
        return token
    except Exception as e:
        logger.error(f"Failed to decrypt token for user {user.login}: {e}")
        raise HTTPException(status_code=500, detail="Token decryption error")


def get_optional_github_token(user: Optional[User] = Depends(get_current_user)) -> Optional[str]:
    """
    Dependency to get the authenticated user's GitHub access token optionally.
    Returns None if no authentication is available, allowing public repository access.
    """
    if not user:
        return None

    if user.login == 'demo-user':
        return 'demo-github-token'

    if not hasattr(user, 'access_token') or not user.access_token:
        return None

    try:
        token = security_utils.decrypt_token(user.access_token)
        return token if token else None
    except Exception as e:
        logger.warning(f"Failed to decrypt token for user {user.login}: {e}")
        return None


def require_auth(token: Optional[str] = Depends(get_github_token)) -> str:
    """Require authentication for protected endpoints."""
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    return token


def optional_auth(token: Optional[str] = Depends(get_optional_github_token)) -> Optional[str]:
    """Optional authentication for public endpoints."""
    return token
