import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { Button } from '~/components/ui/Button';
import { Link, useSearchParams } from '@remix-run/react';
import { useGitHubConnection, useGitHubStats, useGitLabConnection } from '~/lib/hooks';
import {
  isGitHubConnected,
  isGitHubLoadingStats,
  githubConnectionAtom,
  githubStatsUpdateTrigger,
} from '~/lib/stores/githubConnection';
import { isGitLabConnected } from '~/lib/stores/gitlabConnection';

export default function HubOverview() {
  const [searchParams] = useSearchParams();
  const urlTimestamp = searchParams.get('t');

  const isGithubConnected = useStore(isGitHubConnected);
  const isGitlabConnected = useStore(isGitLabConnected);
  const isGithubLoadingStatsStore = useStore(isGitHubLoadingStats);
  const githubConnectionFromStore = useStore(githubConnectionAtom);
  const statsUpdateTrigger = useStore(githubStatsUpdateTrigger);

  const [forceUpdate, setForceUpdate] = useState(0);

  const { connection: githubConnection } = useGitHubConnection();
  const { connection: gitlabConnection } = useGitLabConnection();

  // Use the stats from store if available, otherwise use hook
  const {
    stats: githubStatsFromHook,
    isLoading: isGithubLoadingFromHook,
    refreshStats: refreshGithubStats,
  } = useGitHubStats(githubConnection, { autoFetch: false }); // Disable auto-fetch to prevent conflicts

  // Prioritize stats from store connection, fallback to hook
  const githubStats = githubConnectionFromStore?.stats || githubStatsFromHook;
  const isGithubLoading = isGithubLoadingStatsStore || isGithubLoadingFromHook;

  // Force re-render when GitHub connection stats change or URL timestamp changes
  useEffect(() => {
    setForceUpdate((prev) => prev + 1);
  }, [githubConnectionFromStore?.stats, githubStats, urlTimestamp, statsUpdateTrigger]);

  // Auto-refresh stats if connected but no stats available
  useEffect(() => {
    if (isGithubConnected && !githubStats && !isGithubLoading) {
      // Small delay to prevent immediate fetch on component mount
      const timer = setTimeout(() => {
        (async () => {
          try {
            // Try to fetch from store first
            const { githubConnectionStore } = await import('~/lib/stores/githubConnection');
            await githubConnectionStore.fetchStats();
          } catch (error) {
            console.error('Failed to fetch stats from store, trying hook:', error);

            // Fallback to hook
            await refreshGithubStats();
          }
        })();
      }, 500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [isGithubConnected, githubStats, isGithubLoading, refreshGithubStats]);

  // Also refresh stats when coming from setup (URL timestamp indicates fresh navigation)
  useEffect(() => {
    if (urlTimestamp && isGithubConnected && !isGithubLoading) {
      const timestamp = parseInt(urlTimestamp);
      const now = Date.now();

      // If the timestamp is recent (within 30 seconds), force refresh
      if (now - timestamp < 30000) {
        const timer = setTimeout(() => {
          (async () => {
            try {
              const { githubConnectionStore } = await import('~/lib/stores/githubConnection');
              await githubConnectionStore.fetchStats();
            } catch (error) {
              console.error('Failed to refresh stats after setup navigation:', error);
            }
          })();
        }, 1000);
        return () => clearTimeout(timer);
      }
    }

    return undefined;
  }, [urlTimestamp, isGithubConnected, isGithubLoading]);

  // Aggregate stats from both GitHub and GitLab
  const aggregatedStats = useMemo(() => {
    let totalRepos = 0;
    let totalStars = 0;
    let totalForks = 0;
    let totalIssues = 0;
    let totalPRs = 0;
    let totalBranches = 0;
    const totalLanguages = new Set<string>();
    let totalOrganizations = 0;
    let recentRepos: any[] = [];

    // GitHub Stats
    if (githubStats) {
      totalRepos += (githubStats.publicRepos || 0) + (githubStats.privateRepos || 0);
      totalIssues += githubStats.totalIssues || 0;
      totalPRs += githubStats.totalPullRequests || 0;
      totalBranches += githubStats.totalBranches || 0;
      totalOrganizations += githubStats.organizations?.length || 0;

      if (githubStats.repos) {
        githubStats.repos.forEach((repo) => {
          totalStars += repo.stargazers_count || 0;
          totalForks += repo.forks_count || 0;

          if (repo.language) {
            totalLanguages.add(repo.language);
          }
        });

        recentRepos = [
          ...recentRepos,
          ...githubStats.repos
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 3)
            .map((repo) => ({ ...repo, provider: 'github' })),
        ];
      }

      Object.keys(githubStats.languages).forEach((lang) => totalLanguages.add(lang));
    }

    // GitLab Stats
    if (gitlabConnection?.stats) {
      totalRepos += (gitlabConnection.stats.publicProjects || 0) + (gitlabConnection.stats.privateProjects || 0);
      totalStars += gitlabConnection.stats.stars || 0;
      totalForks += gitlabConnection.stats.forks || 0;

      if (gitlabConnection.stats.projects) {
        gitlabConnection.stats.projects.forEach((project) => {
          if (project.star_count) {
            totalStars += project.star_count;
          }

          if (project.forks_count) {
            totalForks += project.forks_count;
          }
        });

        recentRepos = [
          ...recentRepos,
          ...gitlabConnection.stats.projects
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 3)
            .map((project) => ({ ...project, provider: 'gitlab' })),
        ];
      }
    }

    return {
      totalRepos,
      totalStars,
      totalForks,
      totalIssues,
      totalPRs,
      totalBranches,
      totalLanguages: totalLanguages.size,
      totalOrganizations,
      recentRepos: recentRepos.slice(0, 6),
    };
  }, [githubStats, gitlabConnection?.stats]);

  const hasAnyConnection = isGithubConnected || isGitlabConnected;
  const hasAnyStats = githubStats || gitlabConnection?.stats;
  const isLoadingAnyStats = isGithubLoading;
  const shouldShowLoading = hasAnyConnection && isLoadingAnyStats && !hasAnyStats;

  return (
    <div className="p-8" key={`overview-${forceUpdate}-${githubStats?.lastUpdated || 'no-stats'}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gitmesh-elements-textPrimary">Hub Overview</h1>
          {hasAnyStats && (
            <Button
              onClick={async () => {
                try {
                  if (isGithubConnected) {
                    // Force refresh from store first
                    const { githubConnectionStore } = await import('~/lib/stores/githubConnection');
                    await githubConnectionStore.fetchStats();

                    // Also refresh from hook as backup
                    await refreshGithubStats();
                  }

                  // Add GitLab refresh if needed
                } catch (error) {
                  console.error('Failed to refresh stats:', error);
                }
              }}
              variant="outline"
              size="sm"
              disabled={isGithubLoading}
            >
              {isGithubLoading ? (
                <>
                  <div className="i-ph:spinner-gap animate-spin w-4 h-4 mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <div className="i-ph:arrows-clockwise w-4 h-4 mr-2" />
                  Refresh Stats
                </>
              )}
            </Button>
          )}
        </div>
        <p className="text-gitmesh-elements-textSecondary">
          {hasAnyConnection
            ? 'Your repository statistics and activity across all connected platforms.'
            : 'Welcome to GitMesh Hub! Connect your accounts to see your repository statistics and activity.'}
        </p>
      </motion.div>

      {!hasAnyConnection ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gitmesh-elements-button-primary-background/10 flex items-center justify-center">
            <div className="i-ph:plugs w-8 h-8 text-gitmesh-elements-button-primary-background" />
          </div>
          <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-2">No Integrations Connected</h2>
          <p className="text-gitmesh-elements-textSecondary mb-6">
            To get started with GitMesh Hub, you need to connect at least one integration (GitHub or GitLab).
          </p>
          <Link to="/hub/settings/integrations">
            <Button>
              <div className="i-ph:plug w-4 h-4 mr-2" />
              Connect Integrations
            </Button>
          </Link>
        </motion.div>
      ) : shouldShowLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="w-16 h-16 border-4 border-gitmesh-elements-borderColor border-t-gitmesh-elements-button-primary-background rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-2">Loading Your Data</h2>
          <p className="text-gitmesh-elements-textSecondary">
            We're fetching your repository statistics and activity. This should only take a few moments.
          </p>
        </motion.div>
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary mb-1">Total Repositories</p>
                  <p className="text-2xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalRepos.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500">
                  <div className="i-ph:folder w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary mb-1">Total Stars</p>
                  <p className="text-2xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalStars.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500">
                  <div className="i-ph:star w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary mb-1">Pull Requests</p>
                  <p className="text-2xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalPRs.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-500">
                  <div className="i-ph:git-pull-request w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary mb-1">Active Issues</p>
                  <p className="text-2xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalIssues.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500">
                  <div className="i-ph:warning w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500">
                  <div className="i-ph:git-branch w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary">Total Branches</p>
                  <p className="text-xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalBranches.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500">
                  <div className="i-ph:code w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary">Languages</p>
                  <p className="text-xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalLanguages}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500">
                  <div className="i-ph:buildings w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gitmesh-elements-textSecondary">Organizations</p>
                  <p className="text-xl font-bold text-gitmesh-elements-textPrimary">
                    {aggregatedStats.totalOrganizations}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Connected Platforms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          >
            {isGithubConnected && (
              <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                      <path
                        fill="currentColor"
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gitmesh-elements-textPrimary">GitHub</h3>
                    <p className="text-sm text-gitmesh-elements-textSecondary">Connected</p>
                  </div>
                </div>
                {githubConnection?.user && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gitmesh-elements-textSecondary">User:</span>{' '}
                      <span className="text-gitmesh-elements-textPrimary">{githubConnection.user.login}</span>
                    </p>
                    {githubStats && (
                      <div className="text-sm grid grid-cols-2 gap-2">
                        <span className="text-gitmesh-elements-textSecondary">
                          Repos: {(githubStats.publicRepos || 0) + (githubStats.privateRepos || 0)}
                        </span>
                        <span className="text-gitmesh-elements-textSecondary">
                          Languages: {Object.keys(githubStats.languages).length}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isGitlabConnected && (
              <div className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
                      <path
                        fill="currentColor"
                        d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gitmesh-elements-textPrimary">GitLab</h3>
                    <p className="text-sm text-gitmesh-elements-textSecondary">Connected</p>
                  </div>
                </div>
                {gitlabConnection?.user && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gitmesh-elements-textSecondary">User:</span>{' '}
                      <span className="text-gitmesh-elements-textPrimary">{gitlabConnection.user.username}</span>
                    </p>
                    {gitlabConnection.stats && (
                      <div className="text-sm grid grid-cols-2 gap-2">
                        <span className="text-gitmesh-elements-textSecondary">
                          Projects:{' '}
                          {(gitlabConnection.stats.publicProjects || 0) + (gitlabConnection.stats.privateProjects || 0)}
                        </span>
                        <span className="text-gitmesh-elements-textSecondary">
                          Stars: {gitlabConnection.stats.stars || 0}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Recent Repositories */}
          {aggregatedStats.recentRepos.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6"
            >
              <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-4">Recent Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aggregatedStats.recentRepos.map((repo) => (
                  <div
                    key={`${repo.provider}-${repo.id || repo.full_name}`}
                    className="p-4 rounded-lg bg-gitmesh-elements-background-depth-1 border border-gitmesh-elements-borderColor hover:border-gitmesh-elements-borderColorActive transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-4 h-4 ${repo.provider === 'github' ? 'text-gray-900' : 'text-orange-500'}`}>
                        {repo.provider === 'github' ? (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                            <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
                          </svg>
                        )}
                      </div>
                      <h3 className="font-medium text-gitmesh-elements-textPrimary text-sm truncate">
                        {repo.name || repo.path}
                      </h3>
                    </div>
                    <p className="text-xs text-gitmesh-elements-textSecondary mb-3 truncate">
                      {repo.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gitmesh-elements-textSecondary">
                      <div className="flex items-center gap-3">
                        {(repo.language || repo.main_language) && (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-gitmesh-elements-button-primary-background" />
                            {repo.language || repo.main_language}
                          </span>
                        )}
                        {(repo.stargazers_count !== undefined || repo.star_count !== undefined) && (
                          <span className="flex items-center gap-1">
                            <div className="i-ph:star w-3 h-3" />
                            {repo.stargazers_count || repo.star_count || 0}
                          </span>
                        )}
                      </div>
                      <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Control Panel Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6"
          >
            <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-4">Control Panel</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { to: '/hub/settings/profile', icon: 'i-ph:user', label: 'Profile' },
                { to: '/hub/settings/general', icon: 'i-ph:gear', label: 'Settings' },
                { to: '/hub/settings/features', icon: 'i-ph:star', label: 'Features' },
                { to: '/hub/settings/data', icon: 'i-ph:database', label: 'Data' },
                { to: '/hub/settings/cloud-providers', icon: 'i-ph:cloud', label: 'Cloud' },
                { to: '/hub/settings/local-providers', icon: 'i-ph:desktop', label: 'Local' },
                { to: '/hub/settings/github', icon: 'i-ph:github-logo', label: 'GitHub' },
                { to: '/hub/settings/gitlab', icon: 'i-ph:gitlab-logo-simple', label: 'GitLab' },
                { to: '/hub/settings/netlify', icon: 'i-ph:globe', label: 'Netlify' },
                { to: '/hub/settings/vercel', icon: 'i-ph:triangle', label: 'Vercel' },
                { to: '/hub/settings/supabase', icon: 'i-ph:cylinder', label: 'Supabase' },
                { to: '/hub/settings/event-logs', icon: 'i-ph:list-bullets', label: 'Logs' },
                { to: '/hub/settings/mcp', icon: 'i-ph:wrench', label: 'MCP' },
              ].map((item) => (
                <Link key={item.to} to={item.to}>
                  <div className="p-3 rounded-lg border border-gitmesh-elements-borderColor hover:border-gitmesh-elements-borderColorActive hover:bg-gitmesh-elements-background-depth-1 transition-colors text-center group">
                    <div
                      className={`${item.icon} w-6 h-6 mx-auto mb-2 text-gitmesh-elements-textSecondary group-hover:text-gitmesh-elements-textPrimary`}
                    />
                    <p className="text-xs text-gitmesh-elements-textSecondary group-hover:text-gitmesh-elements-textPrimary">
                      {item.label}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gitmesh-elements-background-depth-1 rounded-lg border border-gitmesh-elements-borderColor p-6"
          >
            <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/hub/projects">
                <Button variant="outline" className="w-full justify-start">
                  <div className="i-ph:folder w-4 h-4 mr-2" />
                  View All Projects
                </Button>
              </Link>
              <Link to="/hub/settings/integrations">
                <Button variant="outline" className="w-full justify-start">
                  <div className="i-ph:gear w-4 h-4 mr-2" />
                  Manage Integrations
                </Button>
              </Link>
              <Link to="/hub/settings">
                <Button variant="outline" className="w-full justify-start">
                  <div className="i-ph:sliders w-4 h-4 mr-2" />
                  All Settings
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
