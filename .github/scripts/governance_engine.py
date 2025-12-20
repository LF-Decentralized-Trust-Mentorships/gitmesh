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
LEDGER_PATH = "governance/history/ledger.yaml"

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

def get_now_ist_str():
    """Returns current IST time in ISO format."""
    return datetime.now(IST).strftime("%Y-%m-%dT%H:%M:%S+05:30")

def get_all_merged_prs(per_page=100, max_pages=None):
    """Fetches all merged PRs from the repository (paginated).
    
    Args:
        per_page: Number of PRs per page (max 100)
        max_pages: Maximum number of pages to fetch (None = fetch all)
    """
    all_prs = []
    page = 1
    
    while True:
        if max_pages and page > max_pages:
            print(f"Reached max_pages limit: {max_pages}")
            break
            
        url = f"https://api.github.com/repos/{REPO}/pulls?state=closed&per_page={per_page}&page={page}"
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            pulls = response.json()
            
            if not pulls:
                print(f"No more PRs found at page {page}")
                break
                
            merged_prs = [
                {
                    'username': pr['user']['login'],
                    'merged_at': pr['merged_at'],
                    'url': pr['html_url'],
                    'title': pr['title'],
                    'number': pr['number']
                }
                for pr in pulls if pr.get('merged_at')
            ]
            all_prs.extend(merged_prs)
            
            print(f"Fetched page {page}: {len(merged_prs)} merged PRs")
            page += 1
            
        except Exception as e:
            print(f"Error fetching PRs page {page}: {e}")
            break
    
    return all_prs

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

def get_pr_reviews(pr_number):
    """Fetches reviews for a specific PR."""
    url = f"https://api.github.com/repos/{REPO}/pulls/{pr_number}/reviews"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching reviews for PR #{pr_number}: {e}")
    return []

def get_issue_comments(since_days=365):
    """Fetches recent issue comments from the repository."""
    since = (datetime.now() - timedelta(days=since_days)).isoformat()
    url = f"https://api.github.com/repos/{REPO}/issues/comments?since={since}&per_page=100"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching issue comments: {e}")
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

def update_ledger(event_type, username, details):
    """Maintains a global ledger of all governance events."""
    os.makedirs(os.path.dirname(LEDGER_PATH), exist_ok=True)
    
    data = {"events": []}
    if os.path.exists(LEDGER_PATH) and os.path.getsize(LEDGER_PATH) > 0:
        with open(LEDGER_PATH, 'r') as f:
            existing_data = yaml.safe_load(f)
            if existing_data and 'events' in existing_data:
                data = existing_data
    
    data['events'].append({
        "timestamp": get_now_ist_str(),
        "type": event_type,
        "username": username,
        "details": details
    })
    
    with open(LEDGER_PATH, 'w') as f:
        yaml.dump(data, f, sort_keys=False, default_flow_style=False)

def initial_history_sync(contributors, existing_usernames):
    """Performs initial historical sync for existing contributors."""
    print("\n=== INITIAL HISTORICAL SYNC ===")
    
    # Check if initial sync has been completed by looking for a marker file
    sync_marker_path = os.path.join(os.path.dirname(HISTORY_DIR), ".initial_sync_completed")
    
    if os.path.exists(sync_marker_path):
        print("Initial sync already completed (marker file found). Skipping.")
        return
    
    # Also check if user history files exist for all current contributors
    os.makedirs(HISTORY_DIR, exist_ok=True)
    existing_history_files = {f.replace('.yaml', '') for f in os.listdir(HISTORY_DIR) if f.endswith('.yaml')}
    current_usernames = {c['username'] for c in contributors}
    
    if current_usernames.issubset(existing_history_files):
        print(f"Found history files for all {len(contributors)} contributors. Marking sync as complete.")
        # Create marker file
        with open(sync_marker_path, 'w') as f:
            f.write(f"Initial sync completed at: {get_now_ist_str()}\n")
        return
    
    print("No user history files found. Performing initial historical sync...")
    
    # Fetch all merged PRs
    all_prs = get_all_merged_prs()
    print(f"Total merged PRs found: {len(all_prs)}")
    
    # Group PRs by username
    pr_by_user = {}
    for pr in all_prs:
        username = pr['username']
        if username not in pr_by_user:
            pr_by_user[username] = []
        pr_by_user[username].append(pr)
    
    # Sync historical data for existing contributors
    for contributor in contributors:
        username = contributor['username']
        print(f"Syncing history for {username}...")
        
        # Create initial role assignment event
        update_user_history(
            username, 
            "ROLE_ASSIGNMENT",
            f"Assigned role: {contributor['role']} by {contributor.get('assigned_by', 'unknown')}"
        )
        update_ledger(
            "ROLE_ASSIGNMENT",
            username,
            f"Role: {contributor['role']}, Assigned by: {contributor.get('assigned_by', 'unknown')}"
        )
        
        # Log all their merged PRs
        user_prs = pr_by_user.get(username, [])
        for pr in user_prs:
            update_user_history(
                username,
                "PR_MERGED",
                f"Merged PR #{pr['number']}: {pr['title']} ({pr['url']})"
            )
            update_ledger(
                "PR_MERGED",
                username,
                f"PR #{pr['number']}: {pr['title']}"
            )
        
        if user_prs:
            print(f"  - Logged {len(user_prs)} merged PRs")
    
    # Also capture any PRs from users not yet in the registry
    for username, prs in pr_by_user.items():
        if username not in existing_usernames:
            print(f"Found historical contributor not in registry: {username} ({len(prs)} PRs)")
            for pr in prs:
                update_ledger(
                    "PR_MERGED",
                    username,
                    f"PR #{pr['number']}: {pr['title']} (Historical - before registry)"
                )
    
    print("Initial historical sync completed.")
    print(f"Created history files for {len(contributors)} contributors.")
    print(f"Logged {len(all_prs)} total merged PRs to ledger.")
    
    # Create marker file to indicate sync is complete
    with open(sync_marker_path, 'w') as f:
        f.write(f"Initial sync completed at: {get_now_ist_str()}\n")
        f.write(f"Contributors synced: {len(contributors)}\n")
        f.write(f"Total PRs logged: {len(all_prs)}\n")

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
    
    # 0. INITIAL HISTORICAL SYNC (runs once)
    initial_history_sync(contributors, existing_usernames)
    
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
            update_ledger("ONBOARDING", username, f"First merged PR: {pr_url}")

    # 2. ACTIVITY & STATUS SYNC
    for entry in contributors:
        username = entry['username']
        last_act = get_last_activity_date(username)
        
        if last_act:
            old_activity = entry.get('last_activity')
            entry['last_activity'] = last_act
            
            # Log activity update if it changed
            if old_activity != last_act:
                update_user_history(username, "ACTIVITY_UPDATE", f"Last activity updated to {last_act}")
            
            # Logic for Inactivity Flag (90 Days)
            last_act_dt = datetime.strptime(last_act, "%Y-%m-%d")
            # Convert current time to naive for comparison
            now_naive = datetime.now()
            diff = now_naive - last_act_dt
            
            if diff > timedelta(days=90):
                if entry.get('status') != "inactive":
                    entry['status'] = "inactive"
                    update_user_history(username, "STATUS_CHANGE", "Flagged as inactive due to 90 days of no activity.")
                    update_ledger("STATUS_CHANGE", username, "Marked as inactive (90+ days)")
            else:
                if entry.get('status') == "inactive":
                    entry['status'] = "active"
                    update_user_history(username, "STATUS_CHANGE", "Reactivated status due to new activity.")
                    update_ledger("STATUS_CHANGE", username, "Reactivated due to new activity")
    
    # 3. SYNC RECENT CONTRIBUTIONS (PRs, Reviews, Comments)
    print("\n=== SYNCING RECENT CONTRIBUTIONS ===")
    
    # Build a set of already logged PR URLs from ledger to avoid duplicates
    logged_pr_urls = set()
    if os.path.exists(LEDGER_PATH) and os.path.getsize(LEDGER_PATH) > 0:
        with open(LEDGER_PATH, 'r') as f:
            ledger_data = yaml.safe_load(f)
            if ledger_data and 'events' in ledger_data:
                for event in ledger_data['events']:
                    if event.get('type') in ['PR_MERGED', 'ONBOARDING']:
                        details = event.get('details', '')
                        # Extract URL from details string if present
                        # Use regex to match GitHub PR URLs more precisely
                        parts = details.split()
                        for part in parts:
                            # Ensure URL is actually from github.com with proper format
                            # Expected format: https://github.com/owner/repo/pull/number
                            if part.startswith('https://github.com/') and '/pull/' in part:
                                logged_pr_urls.add(part.rstrip('.,)'))
    
    print(f"Found {len(logged_pr_urls)} already logged PRs")
    
    # Track recent merged PRs for all contributors
    for username, merged_at, pr_url in recent_merges:
        if username in existing_usernames and pr_url not in logged_pr_urls:
            update_user_history(username, "PR_MERGED", f"Merged PR: {pr_url}")
            update_ledger("PR_MERGED", username, f"Recent PR: {pr_url}")
            logged_pr_urls.add(pr_url)
            print(f"Logged new PR for {username}: {pr_url}")
    
    # Track issue comments (last 365 days)
    comments = get_issue_comments(since_days=365)
    comment_count = {}
    for comment in comments:
        username = comment['user']['login']
        if username in existing_usernames:
            comment_count[username] = comment_count.get(username, 0) + 1
    
    for username, count in comment_count.items():
        print(f"Found {count} recent comments from {username}")

    # Update Global Metadata
    if 'metadata' not in registry:
        registry['metadata'] = {}
    registry['metadata']['last_sync'] = get_now_ist_str()
    registry['metadata']['total_contributors'] = len(contributors)
    registry['metadata']['active_contributors'] = sum(1 for c in contributors if c.get('status') == 'active')

    # Save Registry
    with open(REGISTRY_PATH, 'w') as f:
        yaml.dump(registry, f, sort_keys=False, default_flow_style=False)
    print("\nGovernance sync completed successfully.")
    print(f"Total contributors: {len(contributors)}")
    print(f"Active contributors: {registry['metadata']['active_contributors']}")

if __name__ == "__main__":
    main()