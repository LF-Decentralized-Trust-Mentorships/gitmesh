import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@remix-run/react';
import { Button } from '~/components/ui/Button';
import { GitHubRepositoryCard } from '~/components/@settings/tabs/github/components/GitHubRepositoryCard';
import { RepositoryCard } from '~/components/@settings/tabs/gitlab/components/RepositoryCard';
import type { GitHubRepoInfo } from '~/types/GitHub';
import type { GitLabProjectInfo } from '~/types/GitLab';
import { useGitHubConnection, useGitHubStats, useGitLabConnection } from '~/lib/hooks';
import { classNames } from '~/utils/classNames';
import { Search, RefreshCw, GitBranch, Calendar, Filter, Settings, Plus } from 'lucide-react';
import { CreateNewProjectDialog } from '~/components/hub/CreateNewProjectDialog';

type Repository = (GitHubRepoInfo & { provider: 'github' }) | (GitLabProjectInfo & { provider: 'gitlab' });
type SortOption = 'updated' | 'stars' | 'name' | 'created';
type FilterOption = 'all' | 'github' | 'gitlab';

export function HubProjectsView() {
  const navigate = useNavigate();
  const [isCreateProjectDialogOpen, setCreateProjectDialogOpen] = useState(false);
  const { connection: githubConnection, isConnected: isGitHubConnected } = useGitHubConnection();
  const { connection: gitlabConnection, isConnected: isGitLabConnected } = useGitLabConnection();

  const {
    stats: githubStats,
    isLoading: isGitHubLoading,
    refreshStats: refreshGitHubStats,
  } = useGitHubStats(githubConnection, {
    autoFetch: true,
    cacheTimeout: 30 * 60 * 1000, // 30 minutes
  });

  const [gitlabRepositories, setGitlabRepositories] = useState<GitLabProjectInfo[]>([]);
  const [isGitLabLoading, setIsGitLabLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [publicGithubRepositories, setPublicGithubRepositories] = useState<GitHubRepoInfo[]>([]);
  const [publicGitlabProjects, setPublicGitlabProjects] = useState<GitLabProjectInfo[]>([]);

  const REPOS_PER_PAGE = 12;

  // Fetch GitLab repositories
  const fetchGitLabRepositories = async (refresh = false) => {
    if (!isGitLabConnected || !gitlabConnection?.token) {
      return;
    }

    const loadingState = refresh ? setIsRefreshing : setIsGitLabLoading;
    loadingState(true);
    setError(null);

    try {
      const response = await fetch('/api/gitlab-projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: gitlabConnection.token,
          gitlabUrl: gitlabConnection.gitlabUrl || 'https://gitlab.com',
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({ error: 'Failed to fetch repositories' }));
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data: any = await response.json();
      setGitlabRepositories(data.projects || []);
    } catch (err) {
      console.error('Failed to fetch GitLab repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      loadingState(false);
    }
  };

  const fetchPublicGitHubRepositories = async (query?: string) => {
    if (!query || query.trim().length < 3) {
      setPublicGithubRepositories([]);
      setError(null);

      return;
    }

    try {
      const response = await fetch('/api/public-github-repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubConnection?.token,
          githubUrl: 'https://api.github.com',
          query: query.trim(),
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({ error: 'Failed to fetch repositories' }));
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data: any = await response.json();
      setPublicGithubRepositories(data.repositories?.slice(0, 50) || []); // only top 50
    } catch (err) {
      console.error('Failed to fetch public repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      if (isRefreshing) {
        setIsRefreshing(false);
      }
    }
  };

  const fetchPublicGitLabProjects = async (query?: string) => {
    if (!query || query.trim().length < 3) {
      setPublicGitlabProjects([]);
      setError(null);

      return;
    }

    try {
      const response = await fetch('/api/public-gitlab-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: gitlabConnection?.token,
          gitlabUrl: 'https://gitlab.com',
          query: query.trim(),
        }),
      });

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({ error: 'Failed to fetch repositories' }));
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }

      const data: any = await response.json();
      setPublicGitlabProjects(data.projects?.slice(0, 50) || []); // only top 50
    } catch (err) {
      console.error('Failed to fetch public repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
    } finally {
      if (isRefreshing) {
        setIsRefreshing(false);
      }
    }
  };

  const allRepositories: Repository[] = useMemo(() => {
    const repos: Repository[] = [];

    if (githubStats?.repos) {
      repos.push(...githubStats.repos.map((r) => ({ ...r, provider: 'github' as const })));
    }

    if (gitlabRepositories) {
      repos.push(...gitlabRepositories.map((r) => ({ ...r, provider: 'gitlab' as const })));
    }

    if (publicGithubRepositories.length > 0) {
      repos.push(
        ...publicGithubRepositories.map((r) => ({ ...r, provider: 'github' as const, source_public: true as const })),
      );
    }

    if (publicGitlabProjects.length > 0) {
      repos.push(
        ...publicGitlabProjects.map((r) => ({ ...r, provider: 'gitlab' as const, source_public: true as const })),
      );
    }

    return repos;
  }, [githubStats?.repos, gitlabRepositories, publicGithubRepositories, publicGitlabProjects]);

  // Filter and search repositories
  const filteredRepositories = useMemo(() => {
    if (!allRepositories) {
      return [];
    }

    const filtered = allRepositories.filter((repo: Repository) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.provider === 'github' ? repo.full_name : repo.path_with_namespace)
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Provider filter
      let matchesFilter = true;

      switch (filterBy) {
        case 'github':
          matchesFilter = repo.provider === 'github';
          break;
        case 'gitlab':
          matchesFilter = repo.provider === 'gitlab';
          break;
        case 'all':
        default:
          matchesFilter = true;
          break;
      }

      return matchesSearch && matchesFilter;
    });

    // Sort repositories
    filtered.sort((a: Repository, b: Repository) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'stars': {
          const aStars = a.provider === 'github' ? a.stargazers_count : a.star_count;
          const bStars = b.provider === 'github' ? b.stargazers_count : b.star_count;

          return bStars - aStars;
        }
        case 'created':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); // Using updated_at as proxy
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [allRepositories, searchQuery, sortBy, filterBy]);

  // Pagination
  const totalPages = Math.ceil(filteredRepositories.length / REPOS_PER_PAGE);
  const startIndex = (currentPage - 1) * REPOS_PER_PAGE;
  const currentRepositories = filteredRepositories.slice(startIndex, startIndex + REPOS_PER_PAGE);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const promises = [];

      if (isGitHubConnected) {
        promises.push(refreshGitHubStats());
      }

      if (isGitLabConnected) {
        promises.push(fetchGitLabRepositories(true));
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to refresh repositories:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh repositories');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCloneRepository = (repo: Repository) => {
    const repoUrl = repo.provider === 'github' ? `${repo.html_url}.git` : repo.http_url_to_repo;

    const fullName = repo.provider === 'github' ? repo.full_name : repo.path_with_namespace;

    /*
     * Force a hard navigation to ensure clean state
     * This creates a new chat with fresh workspace instead of reusing existing one
     */
    const chatUrl = `/chat?clone=${encodeURIComponent(repoUrl)}&repo=${encodeURIComponent(repo.name)}&fullName=${encodeURIComponent(fullName)}&provider=${repo.provider}&from=hub`;

    // Use window.location.href for hard navigation to ensure clean workspace
    window.location.href = chatUrl;
  };

  // Reset to first page when filters change
  useEffect(() => {
    const needsRefresh = sessionStorage.getItem('projects-need-refresh');

    if (needsRefresh === 'true') {
      sessionStorage.removeItem('projects-need-refresh');
      handleRefresh();
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, filterBy]);

  // Fetch GitLab repositories when connection is ready
  useEffect(() => {
    if (isGitLabConnected && gitlabConnection?.token) {
      fetchGitLabRepositories();
    }
  }, [isGitLabConnected, gitlabConnection?.token]);

  // Fetch Public Repositories using Debounce
  useEffect(() => {
    if (isGitHubConnected) {
      fetchPublicGitHubRepositories(searchQuery);
    }

    if (isGitLabConnected) {
      fetchPublicGitLabProjects(searchQuery);
    }
  }, [searchQuery]);

  const hasAnyConnection = isGitHubConnected || isGitLabConnected;
  const isLoading = isGitHubLoading || isGitLabLoading;

  if (!hasAnyConnection) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-gitmesh-elements-background-depth-1 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gitmesh-elements-textSecondary" />
        </div>
        <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-2">No Integrations Connected</h2>
        <p className="text-gitmesh-elements-textSecondary mb-4">
          Connect GitHub or GitLab in the Settings to view your repositories here.
        </p>
        <Button variant="outline" onClick={() => navigate('/hub/settings')}>
          Go to Settings
        </Button>
      </div>
    );
  }

  if (isLoading && !allRepositories.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin w-8 h-8 border-2 border-gitmesh-elements-borderColorActive border-t-transparent rounded-full" />
        <p className="text-sm text-gitmesh-elements-textSecondary">Loading repositories...</p>
      </div>
    );
  }

  if (!allRepositories.length && !isLoading) {
    return (
      <div className="text-center p-8">
        <GitBranch className="w-12 h-12 text-gitmesh-elements-textTertiary mx-auto mb-4" />
        <p className="text-gitmesh-elements-textSecondary mb-4">No repositories found</p>
        <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={classNames('w-4 h-4 mr-2', { 'animate-spin': isRefreshing })} />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreateNewProjectDialog isOpen={isCreateProjectDialogOpen} onClose={() => setCreateProjectDialogOpen(false)} />
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gitmesh-elements-textPrimary">All Repositories</h3>
          <p className="text-sm text-gitmesh-elements-textSecondary">
            {filteredRepositories.length} of {allRepositories.length} repositories
            {isGitHubConnected && isGitLabConnected && (
              <span className="ml-2">
                • {githubStats?.repos?.length || 0} from GitHub • {gitlabRepositories.length} from GitLab
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCreateProjectDialogOpen(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Project
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={classNames('w-4 h-4', { 'animate-spin': isRefreshing })} />
            Refresh
          </Button>
        </div>
      </div>

      {error && allRepositories.length > 0 && (
        <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">Warning: {error}. Showing cached data.</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gitmesh-elements-textTertiary" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gitmesh-elements-background-depth-1 border border-gitmesh-elements-borderColor text-gitmesh-elements-textPrimary placeholder-gitmesh-elements-textTertiary focus:outline-none focus:ring-1 focus:ring-gitmesh-elements-borderColorActive"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gitmesh-elements-textTertiary" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 rounded-lg bg-gitmesh-elements-background-depth-1 border border-gitmesh-elements-borderColor text-gitmesh-elements-textPrimary text-sm focus:outline-none focus:ring-1 focus:ring-gitmesh-elements-borderColorActive"
          >
            <option value="updated">Recently updated</option>
            <option value="stars">Most starred</option>
            <option value="name">Name (A-Z)</option>
            <option value="created">Recently created</option>
          </select>
        </div>

        {/* Filter */}
        {isGitHubConnected && isGitLabConnected && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gitmesh-elements-textTertiary" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="px-3 py-2 rounded-lg bg-gitmesh-elements-background-depth-1 border border-gitmesh-elements-borderColor text-gitmesh-elements-textPrimary text-sm focus:outline-none focus:ring-1 focus:ring-gitmesh-elements-borderColorActive"
            >
              <option value="all">All providers</option>
              <option value="github">GitHub only</option>
              <option value="gitlab">GitLab only</option>
            </select>
          </div>
        )}
      </div>

      {/* Repository Grid */}
      {currentRepositories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentRepositories.map((repo) => (
              <div key={`${repo.provider}-${repo.id}`} className="h-full min-h-[280px]">
                {repo.provider === 'github' ? (
                  <GitHubRepositoryCard repo={repo as GitHubRepoInfo} onClone={() => handleCloneRepository(repo)} />
                ) : (
                  <RepositoryCard repo={repo as GitLabProjectInfo} onClone={() => handleCloneRepository(repo)} />
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-gitmesh-elements-borderColor">
              <div className="text-sm text-gitmesh-elements-textSecondary">
                Showing {Math.min(startIndex + 1, filteredRepositories.length)} to{' '}
                {Math.min(startIndex + REPOS_PER_PAGE, filteredRepositories.length)} of {filteredRepositories.length}{' '}
                repositories
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="text-sm text-gitmesh-elements-textSecondary px-3">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gitmesh-elements-textSecondary">No repositories found matching your search criteria.</p>
        </div>
      )}
    </div>
  );
}
