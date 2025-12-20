import os
import yaml
import requests
from datetime import datetime, timedelta, timezone

# --- CONFIGURATION ---
# IST Offset (UTC+5:30)
IST = timezone(timedelta(hours=5, minutes=30))

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
REPO = os.getenv("GITHUB_REPOSITORY")  # Format: "owner/repo"
CANONICAL_REPO = "LF-Decentralized-Trust-labs/gitmesh" # Fork protection target

REGISTRY_PATH = "governance/contributors.yaml"
HISTORY_DIR = "governance/history/users/"

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def get_now_ist_str():
    """Returns current IST time in ISO format."""
    return datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")

def get_recent_merged_prs():
    """Fetches the last 20 closed PRs to identify newly merged contributors."""
    url = f"https://api.github.com/repos/{REPO}/pulls?state=closed&per_page=20"
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        pulls = response.json()
        # Filter for merged PRs only
        return [(pr['user']['login'], pr['merged_at'], pr['html_url']) for pr in pulls if pr.get('merged_at')]
    except Exception as e:
        print(f"Error fetching PRs: {e}")
        return []

def get_last_activity_date(username):
    """Queries GitHub Events API to find the user's latest public action."""
    url = f"https://api.github.com/users/{username}/events/public"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            events = response.json()
            if events and isinstance(events, list):
                # Return date portion only: YYYY-MM-DD
                return events[0]['created_at'].split('T')[0]
    except Exception as e:
        print(f"Error fetching activity for {username}: {e}")
    return None

def update_user_history(username, event_type, details):
    """Maintains an append-only audit log for each contributor."""
    os.makedirs(HISTORY_DIR, exist_ok=True)
    path = os.path.join(HISTORY_DIR, f"{username}.yaml")
    
    data = {"username": username, "events": []}
    if os.path.exists(path):
        with open(path, 'r') as f:
            existing_data = yaml.safe_load(f)
            if existing_data:
                data = existing_data

    data['events'].append({
        "timestamp": get_now_ist_str(),
        "type": event_type,
        "details": details
    })

    with open(path, 'w') as f:
        yaml.dump(data, f, sort_keys=False, default_flow_style=False)

def main():
    # --- FORK PROTECTION CHECK ---
    if REPO != CANONICAL_REPO:
        print(f"Skipping governance sync: Current repo '{REPO}' is a fork or doesn't match '{CANONICAL_REPO}'.")
        return

    if not os.path.exists(REGISTRY_PATH):
        print(f"Registry not found at {REGISTRY_PATH}")
        return

    with open(REGISTRY_PATH, 'r') as f:
        registry = yaml.safe_load(f)

    # Use a dictionary for fast lookup
    contributors = registry.get('contributors', [])
    existing_usernames = {c['username'] for c in contributors}
    
    # 1. NEWBIE AUTO-ONBOARDING
    recent_merges = get_recent_merged_prs()
    for username, merged_at, pr_url in recent_merges:
        if username not in existing_usernames:
            print(f"New contributor detected: {username}")
            new_contributor = {
                "username": username,
                "role": "Newbie Contributor",
                "team": "CE",
                "status": "active",
                "assigned_by": "GitMesh-Gov-Bot",
                "assigned_at": merged_at,
                "last_activity": merged_at.split('T')[0],
                "notes": "Automatically onboarded after first merged PR."
            }
            contributors.append(new_contributor)
            existing_usernames.add(username)
            update_user_history(username, "ONBOARDING", f"Achieved Newbie status via merged PR: {pr_url}")

    # 2. ACTIVITY & STATUS SYNC
    for entry in contributors:
        username = entry['username']
        last_act = get_last_activity_date(username)
        
        if last_act:
            entry['last_activity'] = last_act
            
            # Logic for Inactivity Flag (90 Days)
            last_act_dt = datetime.strptime(last_act, "%Y-%m-%d")
            # Convert current time to naive for comparison
            now_naive = datetime.now()
            diff = now_naive - last_act_dt
            
            if diff > timedelta(days=90):
                if entry.get('status') != "inactive":
                    entry['status'] = "inactive"
                    update_user_history(username, "STATUS_CHANGE", "Flagged as inactive due to 90 days of no activity.")
            else:
                if entry.get('status') == "inactive":
                    entry['status'] = "active"
                    update_user_history(username, "STATUS_CHANGE", "Reactivated status due to new activity.")

    # Update Global Metadata
    if 'metadata' not in registry:
        registry['metadata'] = {}
    registry['metadata']['last_sync'] = get_now_ist_str()

    # Save Registry
    with open(REGISTRY_PATH, 'w') as f:
        yaml.dump(registry, f, sort_keys=False, default_flow_style=False)
    print("Governance sync completed successfully.")

if __name__ == "__main__":
    main()