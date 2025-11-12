// GitLab API Response Types
export interface GitLabUserResponse {
  id: number;
  username: string;
  name: string;
  avatar_url: string;
  web_url: string;
  created_at: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitLabProjectInfo {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string;
  http_url_to_repo: string;
  star_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  visibility: string;
  source_public?: boolean;
}

export interface GitLabGroupInfo {
  id: number;
  name: string;
  web_url: string;
  avatar_url: string;
}

export interface GitLabEvent {
  id: number;
  action_name: string;
  project_id: number;
  project: {
    name: string;
    path_with_namespace: string;
  };
  created_at: string;
}

export interface GitLabStats {
  projects: GitLabProjectInfo[];
  recentActivity: GitLabEvent[];
  totalSnippets: number;
  publicProjects: number;
  privateProjects: number;
  stars: number;
  forks: number;
  followers: number;
  snippets: number;
  groups: GitLabGroupInfo[];
  lastUpdated: string;
}

export interface GitLabConnection {
  user: GitLabUserResponse | null;
  token: string;
  tokenType: 'personal-access-token' | 'oauth';
  stats?: GitLabStats;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  gitlabUrl?: string;
}

export interface GitLabProjectResponse {
  id: number;
  name: string;
  path_with_namespace: string;
  description: string;
  web_url: string;
  http_url_to_repo: string;
  star_count: number;
  forks_count: number;
  updated_at: string;
  default_branch: string;
  visibility: string;
  owner: {
    id: number;
    username: string;
    name: string;
  };
}

export interface GitLabCommitAction {
  action: 'create' | 'update' | 'delete';
  file_path: string;
  content?: string;
  encoding?: 'text' | 'base64';
}

export interface GitLabCommitRequest {
  branch: string;
  commit_message: string;
  actions: GitLabCommitAction[];
}

export interface GitLabMergeRequest {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'closed' | 'locked' | 'merged';
  created_at: string;
  updated_at: string;
  merged_at: string | null;
  closed_at: string | null;
  author: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  };
  source_branch: string;
  target_branch: string;
  source_project_id: number;
  target_project_id: number;
  web_url: string;
  merge_status: 'can_be_merged' | 'cannot_be_merged' | 'unchecked';
  draft: boolean;
  work_in_progress: boolean;
  labels: string[];
  assignees: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  }>;
  reviewers: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  }>;
  changes_count?: string;
  user_notes_count?: number;
  upvotes?: number;
  downvotes?: number;
}

export interface GitLabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: 'opened' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author: {
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  };
  web_url: string;
  labels: string[];
  assignees: Array<{
    id: number;
    username: string;
    name: string;
    avatar_url: string;
    web_url: string;
  }>;
  user_notes_count: number;
  upvotes: number;
  downvotes: number;
  milestone: {
    id: number;
    title: string;
    state: string;
    web_url: string;
  } | null;
}

export interface GitLabContributor {
  name: string;
  email: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface GitLabCommit {
  id: string;
  short_id: string;
  title: string;
  message: string;
  author_name: string;
  author_email: string;
  authored_date: string;
  committer_name: string;
  committer_email: string;
  committed_date: string;
  created_at: string;
  parent_ids: string[];
  web_url: string;
  stats: {
    additions: number;
    deletions: number;
    total: number;
  } | null;
}
