import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { ExternalLink, GitCommit, User, Calendar, Plus, Minus } from 'lucide-react';
import { useGitLabConnection } from '~/lib/hooks';
import type { GitHubContributor } from '~/types/GitHub';
import type { GitLabContributor } from '~/types/GitLab';
import type { GitHubCommit } from '~/types/GitHub';
import type { GitLabCommit } from '~/types/GitLab';
import { formatDistanceToNow } from 'date-fns';

interface ContributionsTabProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
  defaultBranch?: string;
}

export function ContributionsTab({ provider, owner, repo, projectId, defaultBranch }: ContributionsTabProps) {
  const { connection: gitlabConnection } = useGitLabConnection();
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<(GitHubContributor | GitLabContributor)[]>([]);
  const [commits, setCommits] = useState<(GitHubCommit | GitLabCommit)[]>([]);
  const [activeTab, setActiveTab] = useState<'contributors' | 'commits'>('contributors');
  const [commitsPage, setCommitsPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributors = async () => {
      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const response = await fetch(
            `/api/github-repo-contributors?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch contributors');
          }

          const data = (await response.json()) as { contributors: (GitHubContributor | GitLabContributor)[] };
          setContributors(data.contributors);
        } else if (provider === 'gitlab' && projectId) {
          if (!gitlabConnection?.token) {
            throw new Error('GitLab token not found');
          }

          const response = await fetch('/api/gitlab-repo-contributors', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: gitlabConnection.token,
              projectId,
              gitlabUrl: gitlabConnection.gitlabUrl || 'https://gitlab.com',
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch contributors');
          }

          const data = (await response.json()) as { contributors: (GitHubContributor | GitLabContributor)[] };
          setContributors(data.contributors);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contributors');
      } finally {
        setLoading(false);
      }
    };

    fetchContributors();
  }, [provider, owner, repo, projectId, gitlabConnection?.token, gitlabConnection?.gitlabUrl]);

  useEffect(() => {
    const fetchCommits = async () => {
      if (activeTab !== 'commits') {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const response = await fetch(
            `/api/github-repo-commits?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${defaultBranch || ''}&page=${commitsPage}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch commits');
          }

          const data = (await response.json()) as {
            commits: (GitHubCommit | GitLabCommit)[];
            pagination: { hasNextPage: boolean };
          };
          setCommits(data.commits);
          setHasNextPage(data.pagination.hasNextPage);
        } else if (provider === 'gitlab' && projectId) {
          if (!gitlabConnection?.token) {
            throw new Error('GitLab token not found');
          }

          const response = await fetch('/api/gitlab-repo-commits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: gitlabConnection.token,
              projectId,
              gitlabUrl: gitlabConnection.gitlabUrl || 'https://gitlab.com',
              branch: defaultBranch || '',
              page: commitsPage,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch commits');
          }

          const data = (await response.json()) as {
            commits: (GitHubCommit | GitLabCommit)[];
            pagination: { hasNextPage: boolean };
          };
          setCommits(data.commits);
          setHasNextPage(data.pagination.hasNextPage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch commits');
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [
    provider,
    owner,
    repo,
    projectId,
    defaultBranch,
    activeTab,
    commitsPage,
    gitlabConnection?.token,
    gitlabConnection?.gitlabUrl,
  ]);

  if (loading && (contributors.length === 0 || (activeTab === 'commits' && commits.length === 0))) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant={activeTab === 'contributors' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('contributors')}
        >
          Contributors
        </Button>
        <Button
          variant={activeTab === 'commits' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('commits')}
        >
          Commits
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'contributors' && (
        <div className="space-y-3">
          {contributors.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gitmesh-elements-textSecondary">No contributors found</div>
              </CardContent>
            </Card>
          ) : (
            contributors.map((contributor, idx) => {
              const contributions =
                provider === 'github'
                  ? (contributor as GitHubContributor).contributions
                  : (contributor as GitLabContributor).commits;
              const avatarUrl = provider === 'github' ? (contributor as GitHubContributor).avatar_url : undefined;
              const login =
                provider === 'github'
                  ? (contributor as GitHubContributor).login
                  : (contributor as GitLabContributor).name;
              const htmlUrl = provider === 'github' ? (contributor as GitHubContributor).html_url : undefined;

              return (
                <Card key={idx} className="hover:bg-gitmesh-elements-background-depth-2 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {avatarUrl && <img src={avatarUrl} alt={login} className="w-10 h-10 rounded-full" />}
                        <div>
                          {htmlUrl ? (
                            <a
                              href={htmlUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-gitmesh-elements-textPrimary hover:text-gitmesh-elements-textPrimary/80 flex items-center gap-1"
                            >
                              {login}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="font-semibold text-gitmesh-elements-textPrimary">{login}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant="primary">
                        {contributions} {provider === 'github' ? 'contributions' : 'commits'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'commits' && (
        <div className="space-y-3">
          {commits.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gitmesh-elements-textSecondary">No commits found</div>
              </CardContent>
            </Card>
          ) : (
            commits.map((commit) => {
              const commitSha =
                provider === 'github' ? (commit as GitHubCommit).sha : (commit as GitLabCommit).short_id;
              const commitMessage =
                provider === 'github'
                  ? (commit as GitHubCommit).commit.message.split('\n')[0]
                  : (commit as GitLabCommit).title;
              const commitAuthor = provider === 'github' ? (commit as GitHubCommit).author : undefined;
              const commitDate =
                provider === 'github'
                  ? (commit as GitHubCommit).commit.author.date
                  : (commit as GitLabCommit).authored_date;
              const commitUrl =
                provider === 'github' ? (commit as GitHubCommit).html_url : (commit as GitLabCommit).web_url;
              const commitStats =
                provider === 'github' ? (commit as GitHubCommit).stats : (commit as GitLabCommit).stats;

              return (
                <Card key={commitSha} className="hover:bg-gitmesh-elements-background-depth-2 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <a
                          href={commitUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gitmesh-elements-textPrimary hover:text-gitmesh-elements-textPrimary/80 flex items-center gap-1 mb-1"
                        >
                          {commitMessage}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex items-center gap-4 text-sm text-gitmesh-elements-textSecondary flex-wrap">
                          <div className="flex items-center gap-1">
                            <GitCommit className="w-3 h-3" />
                            <code className="text-xs">{commitSha.substring(0, 7)}</code>
                          </div>
                          {commitAuthor && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{commitAuthor.login}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDistanceToNow(new Date(commitDate), { addSuffix: true })}</span>
                          </div>
                          {commitStats && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-green-600">
                                <Plus className="w-3 h-3" />
                                <span>{commitStats.additions}</span>
                              </div>
                              <div className="flex items-center gap-1 text-red-600">
                                <Minus className="w-3 h-3" />
                                <span>{commitStats.deletions}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={commitsPage === 1}
              onClick={() => setCommitsPage(commitsPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gitmesh-elements-textSecondary">Page {commitsPage}</span>
            <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setCommitsPage(commitsPage + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
