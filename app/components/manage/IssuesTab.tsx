import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { ExternalLink, MessageSquare, Calendar, User } from 'lucide-react';
import { useGitLabConnection } from '~/lib/hooks';
import type { GitHubIssue } from '~/types/GitHub';
import type { GitLabIssue } from '~/types/GitLab';
import { formatDistanceToNow } from 'date-fns';

interface IssuesTabProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
}

export function IssuesTab({ provider, owner, repo, projectId }: IssuesTabProps) {
  const { connection: gitlabConnection } = useGitLabConnection();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<(GitHubIssue | GitLabIssue)[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const response = await fetch(
            `/api/github-repo-issues?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&state=${filter}&page=${page}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch issues');
          }

          const data = (await response.json()) as {
            issues: (GitHubIssue | GitLabIssue)[];
            pagination: { hasNextPage: boolean };
          };
          setIssues(data.issues);
          setHasNextPage(data.pagination.hasNextPage);
        } else if (provider === 'gitlab' && projectId) {
          if (!gitlabConnection?.token) {
            throw new Error('GitLab token not found');
          }

          const response = await fetch('/api/gitlab-repo-issues', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: gitlabConnection.token,
              projectId,
              gitlabUrl: gitlabConnection.gitlabUrl || 'https://gitlab.com',
              state: filter === 'all' ? 'all' : filter,
              page,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to fetch issues');
          }

          const data = (await response.json()) as {
            issues: (GitHubIssue | GitLabIssue)[];
            pagination: { hasNextPage: boolean };
          };
          setIssues(data.issues);
          setHasNextPage(data.pagination.hasNextPage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issues');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [provider, owner, repo, projectId, filter, page, gitlabConnection?.token, gitlabConnection?.gitlabUrl]);

  const getIssueStateBadge = (issue: GitHubIssue | GitLabIssue) => {
    if (issue.state === 'closed' || issue.state === 'opened') {
      return issue.state === 'opened' ? <Badge variant="primary">Open</Badge> : <Badge variant="danger">Closed</Badge>;
    }

    return <Badge variant="outline">{issue.state}</Badge>;
  };

  if (loading && issues.length === 0) {
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
      </div>

      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">{error}</div>
          </CardContent>
        </Card>
      )}

      {issues.length === 0 && !loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gitmesh-elements-textSecondary">No issues found</div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const issueNumber = provider === 'github' ? (issue as GitHubIssue).number : (issue as GitLabIssue).iid;
            const issueUrl = provider === 'github' ? (issue as GitHubIssue).html_url : (issue as GitLabIssue).web_url;
            const issueTitle = issue.title;
            const issueAuthor = provider === 'github' ? (issue as GitHubIssue).user : (issue as GitLabIssue).author;
            const issueCreated = issue.created_at;
            const issueLabels = provider === 'github' ? (issue as GitHubIssue).labels : (issue as GitLabIssue).labels;
            const issueComments =
              provider === 'github' ? (issue as GitHubIssue).comments : (issue as GitLabIssue).user_notes_count;

            return (
              <Card key={issueNumber} className="hover:bg-gitmesh-elements-background-depth-2 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {getIssueStateBadge(issue)}
                        <a
                          href={issueUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gitmesh-elements-textPrimary hover:text-gitmesh-elements-textPrimary/80 flex items-center gap-1"
                        >
                          #{issueNumber} {issueTitle}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      {issueLabels && issueLabels.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {issueLabels.slice(0, 5).map((label, idx) => {
                            const labelName = typeof label === 'string' ? label : label.name;
                            const labelColor = typeof label === 'string' ? undefined : label.color;

                            return (
                              <Badge
                                key={idx}
                                variant="subtle"
                                style={
                                  labelColor
                                    ? { backgroundColor: `#${labelColor}20`, color: `#${labelColor}` }
                                    : undefined
                                }
                              >
                                {labelName}
                              </Badge>
                            );
                          })}
                          {issueLabels.length > 5 && <Badge variant="subtle">+{issueLabels.length - 5} more</Badge>}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gitmesh-elements-textSecondary flex-wrap">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>
                            {provider === 'github'
                              ? (issueAuthor as GitHubIssue['user']).login
                              : (issueAuthor as GitLabIssue['author']).username}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Created {formatDistanceToNow(new Date(issueCreated), { addSuffix: true })}</span>
                        </div>
                        {issueComments !== undefined && issueComments > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            <span>{issueComments} comments</span>
                          </div>
                        )}
                      </div>
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
