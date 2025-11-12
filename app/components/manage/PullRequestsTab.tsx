import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { ExternalLink, GitMerge, MessageSquare, Calendar, User } from 'lucide-react';
import { useGitLabConnection } from '~/lib/hooks';
import type { GitHubPullRequest } from '~/types/GitHub';
import type { GitLabMergeRequest } from '~/types/GitLab';
import { formatDistanceToNow } from 'date-fns';

interface PullRequestsTabProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
}

export function PullRequestsTab({ provider, owner, repo, projectId }: PullRequestsTabProps) {
  const { connection: gitlabConnection } = useGitLabConnection();
  const [loading, setLoading] = useState(true);
  const [prs, setPrs] = useState<(GitHubPullRequest | GitLabMergeRequest)[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed' | 'merged'>('all');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPRs = async () => {
      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const state = filter === 'merged' ? 'closed' : filter;
          const response = await fetch(
            `/api/github-repo-prs?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&state=${state}&page=${page}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch pull requests');
          }

          const data = (await response.json()) as { prs: GitHubPullRequest[]; pagination: { hasNextPage: boolean } };
          let filteredPRs = data.prs;

          if (filter === 'merged') {
            filteredPRs = filteredPRs.filter((pr: GitHubPullRequest) => pr.merged_at !== null);
          }

          setPrs(filteredPRs);
          setHasNextPage(data.pagination.hasNextPage);
        } else if (provider === 'gitlab' && projectId) {
          if (!gitlabConnection?.token) {
            throw new Error('GitLab token not found');
          }

          const state = filter === 'merged' ? 'merged' : filter === 'all' ? 'all' : filter;
          const response = await fetch('/api/gitlab-repo-mrs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: gitlabConnection.token,
              projectId,
              gitlabUrl: gitlabConnection.gitlabUrl || 'https://gitlab.com',
              state,
              page,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch merge requests');
          }

          const data = (await response.json()) as { mrs: GitLabMergeRequest[]; pagination: { hasNextPage: boolean } };
          setPrs(data.mrs);
          setHasNextPage(data.pagination.hasNextPage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch pull requests');
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [provider, owner, repo, projectId, filter, page, gitlabConnection?.token, gitlabConnection?.gitlabUrl]);

  const getPRState = (pr: GitHubPullRequest | GitLabMergeRequest) => {
    if (provider === 'github') {
      const ghPr = pr as GitHubPullRequest;

      if (ghPr.merged_at) {
        return 'merged';
      }

      if (ghPr.state === 'closed') {
        return 'closed';
      }

      return 'open';
    } else {
      const glMr = pr as GitLabMergeRequest;
      return glMr.state;
    }
  };

  const getPRStateBadge = (pr: GitHubPullRequest | GitLabMergeRequest) => {
    const state = getPRState(pr);

    if (state === 'merged') {
      return <Badge variant="success">Merged</Badge>;
    }

    if (state === 'closed' || state === 'locked') {
      return <Badge variant="danger">Closed</Badge>;
    }

    return <Badge variant="primary">Open</Badge>;
  };

  if (loading && prs.length === 0) {
    return <LoadingOverlay />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className={filter === 'all' ? 'border-blue-500' : ''}
          onClick={() => {
            setFilter('all');
            setPage(1);
          }}
        >
          All
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === 'open' ? 'border-blue-500' : ''}
          onClick={() => {
            setFilter('open');
            setPage(1);
          }}
        >
          Open
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={filter === 'closed' ? 'border-blue-500' : ''}
          onClick={() => {
            setFilter('closed');
            setPage(1);
          }}
        >
          Closed
        </Button>
        {provider === 'github' && (
          <Button
            variant="outline"
            size="sm"
            className={filter === 'merged' ? 'border-blue-500' : ''}
            onClick={() => {
              setFilter('merged');
              setPage(1);
            }}
          >
            Merged
          </Button>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {prs.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gitmesh-elements-textSecondary">
              No {provider === 'github' ? 'pull requests' : 'merge requests'} found
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {prs.map((pr) => {
            const prNumber = provider === 'github' ? (pr as GitHubPullRequest).number : (pr as GitLabMergeRequest).iid;
            const prUrl =
              provider === 'github' ? (pr as GitHubPullRequest).html_url : (pr as GitLabMergeRequest).web_url;
            const prTitle = pr.title;
            const prAuthor = provider === 'github' ? (pr as GitHubPullRequest).user : (pr as GitLabMergeRequest).author;
            const prCreated = pr.created_at;
            const prUpdated = pr.updated_at;

            return (
              <Card key={prNumber} className="hover:bg-gitmesh-elements-background-depth-2 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getPRStateBadge(pr)}
                        <a
                          href={prUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gitmesh-elements-textPrimary hover:text-gitmesh-elements-textPrimary/80 flex items-center gap-1"
                        >
                          #{prNumber} {prTitle}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gitmesh-elements-textSecondary flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            {provider === 'github'
                              ? (prAuthor as GitHubPullRequest['user']).login
                              : (prAuthor as GitLabMergeRequest['author']).username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {formatDistanceToNow(new Date(prCreated), { addSuffix: true })}</span>
                        </div>
                        {prUpdated !== prCreated && (
                          <div className="flex items-center gap-1">
                            <span>Updated {formatDistanceToNow(new Date(prUpdated), { addSuffix: true })}</span>
                          </div>
                        )}
                        {provider === 'github' && (pr as GitHubPullRequest).comments !== undefined && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{(pr as GitHubPullRequest).comments || 0} comments</span>
                          </div>
                        )}
                      </div>
                      {provider === 'github' && (pr as GitHubPullRequest).head && (
                        <div className="mt-2 text-xs text-gitmesh-elements-textSecondary">
                          <GitMerge className="w-3 h-3 inline mr-1" />
                          {(pr as GitHubPullRequest).head.ref} → {(pr as GitHubPullRequest).base.ref}
                        </div>
                      )}
                      {provider === 'gitlab' && (pr as GitLabMergeRequest).source_branch && (
                        <div className="mt-2 text-xs text-gitmesh-elements-textSecondary">
                          <GitMerge className="w-3 h-3 inline mr-1" />
                          {(pr as GitLabMergeRequest).source_branch} → {(pr as GitLabMergeRequest).target_branch}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </Button>
        <span className="text-sm text-gitmesh-elements-textSecondary">Page {page}</span>
        <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
