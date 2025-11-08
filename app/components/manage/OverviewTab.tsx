import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { GitBranch, Users, AlertCircle, GitPullRequest } from 'lucide-react';
import { useGitLabConnection } from '~/lib/hooks';
import type { GitHubRepoInfo } from '~/types/GitHub';
import type { GitLabProjectInfo } from '~/types/GitLab';
import { formatDistanceToNow } from 'date-fns';

interface OverviewTabProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
  defaultBranch?: string;
}

export function OverviewTab({ provider, owner, repo, projectId, defaultBranch }: OverviewTabProps) {
  const { connection: gitlabConnection } = useGitLabConnection();
  const [loading, setLoading] = useState(true);
  const [repoDetails, setRepoDetails] = useState<GitHubRepoInfo | GitLabProjectInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const response = await fetch(
            `/api/github-repo-details?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch repository details');
          }

          const data = (await response.json()) as { repo: GitHubRepoInfo | GitLabProjectInfo };
          setRepoDetails(data.repo);
        } else if (provider === 'gitlab' && projectId) {
          if (!gitlabConnection?.token) {
            throw new Error('GitLab token not found');
          }

          const response = await fetch('/api/gitlab-repo-details', {
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
            throw new Error('Failed to fetch repository details');
          }

          const data = (await response.json()) as { repo: GitHubRepoInfo | GitLabProjectInfo };
          setRepoDetails(data.repo);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repository details');
      } finally {
        setLoading(false);
      }
    };

    fetchRepoDetails();
  }, [provider, owner, repo, projectId, gitlabConnection?.token, gitlabConnection?.gitlabUrl]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gitmesh-elements-textSecondary">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!repoDetails) {
    return null;
  }

  const stats = {
    branches: provider === 'github' ? (repoDetails as GitHubRepoInfo).branches_count : undefined,
    contributors: provider === 'github' ? (repoDetails as GitHubRepoInfo).contributors_count : undefined,
    issues: provider === 'github' ? (repoDetails as GitHubRepoInfo).issues_count : undefined,
    prs: provider === 'github' ? (repoDetails as GitHubRepoInfo).pull_requests_count : undefined,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.branches !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gitmesh-elements-textSecondary flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gitmesh-elements-textPrimary">{stats.branches}</div>
            </CardContent>
          </Card>
        )}
        {stats.contributors !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gitmesh-elements-textSecondary flex items-center gap-2">
                <Users className="w-4 h-4" />
                Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gitmesh-elements-textPrimary">{stats.contributors}</div>
            </CardContent>
          </Card>
        )}
        {stats.issues !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gitmesh-elements-textSecondary flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gitmesh-elements-textPrimary">{stats.issues}</div>
            </CardContent>
          </Card>
        )}
        {stats.prs !== undefined && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gitmesh-elements-textSecondary flex items-center gap-2">
                <GitPullRequest className="w-4 h-4" />
                {provider === 'github' ? 'Pull Requests' : 'Merge Requests'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gitmesh-elements-textPrimary">{stats.prs}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gitmesh-elements-textSecondary">Default Branch</span>
            <Badge variant="outline">{defaultBranch || repoDetails.default_branch}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gitmesh-elements-textSecondary">Last Updated</span>
            <span className="text-gitmesh-elements-textPrimary">
              {formatDistanceToNow(new Date(repoDetails.updated_at), { addSuffix: true })}
            </span>
          </div>
          {provider === 'github' && (repoDetails as GitHubRepoInfo).language && (
            <div className="flex items-center justify-between">
              <span className="text-gitmesh-elements-textSecondary">Primary Language</span>
              <Badge variant="primary">{(repoDetails as GitHubRepoInfo).language}</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
