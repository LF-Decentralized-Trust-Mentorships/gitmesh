import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLoaderData } from '@remix-run/react';
import { RepoHeader } from './RepoHeader';
import { RepoTabs } from './RepoTabs';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { Card, CardContent } from '~/components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { useGitHubConnection, useGitLabConnection } from '~/lib/hooks';
import type { GitHubRepoInfo } from '~/types/GitHub';
import type { GitLabProjectInfo } from '~/types/GitLab';

export function ManageRepoPage() {
  const params = useParams();
  const loaderData = useLoaderData<{ provider: string; identifier: string }>();
  const navigate = useNavigate();
  const provider = (loaderData?.provider || params.provider) as 'github' | 'gitlab';
  // Use splat parameter from loader or fallback to params
  const identifier = loaderData?.identifier || params['*'] || '';

  const { isConnected: isGitHubConnected } = useGitHubConnection();
  const { connection: gitlabConnection, isConnected: isGitLabConnected } = useGitLabConnection();

  const [loading, setLoading] = useState(true);
  const [repo, setRepo] = useState<GitHubRepoInfo | GitLabProjectInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepoDetails = async () => {
      if (!provider || !identifier) {
        setError('Invalid repository identifier');
        setLoading(false);

        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (provider === 'github') {
          if (!isGitHubConnected) {
            setError('GitHub connection not available. Please connect your GitHub account in settings.');
            setLoading(false);

            return;
          }

          // Parse owner/repo from identifier
          const [owner, repo] = identifier.split('/');

          if (!owner || !repo) {
            setError('Invalid GitHub repository identifier. Expected format: owner/repo');
            setLoading(false);

            return;
          }

          const response = await fetch(
            `/api/github-repo-details?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
          );

          if (!response.ok) {
            const errorData = (await response
              .json()
              .catch(() => ({ error: 'Failed to fetch repository details' }))) as { error?: string };
            throw new Error(errorData.error || 'Failed to fetch repository details');
          }

          const data = (await response.json()) as { repo: GitHubRepoInfo };
          setRepo(data.repo);
        } else if (provider === 'gitlab') {
          if (!isGitLabConnected || !gitlabConnection?.token) {
            setError('GitLab connection not available. Please connect your GitLab account in settings.');
            setLoading(false);

            return;
          }

          // For GitLab, identifier can be projectId or path_with_namespace
          const projectId = identifier;

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
            const errorData = (await response
              .json()
              .catch(() => ({ error: 'Failed to fetch repository details' }))) as { error?: string };
            throw new Error(errorData.error || 'Failed to fetch repository details');
          }

          const data = (await response.json()) as { repo: GitLabProjectInfo };
          setRepo(data.repo);
        } else {
          setError(`Unsupported provider: ${provider}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch repository details');
      } finally {
        setLoading(false);
      }
    };

    fetchRepoDetails();
  }, [provider, identifier, isGitHubConnected, isGitLabConnected, gitlabConnection?.token]);

  const handleOpenInGitMesh = () => {
    if (!repo) {
      return;
    }

    const repoUrl =
      provider === 'github' ? `${(repo as GitHubRepoInfo).html_url}.git` : (repo as GitLabProjectInfo).http_url_to_repo;
    const fullName =
      provider === 'github' ? (repo as GitHubRepoInfo).full_name : (repo as GitLabProjectInfo).path_with_namespace;
    const chatUrl = `/chat?clone=${encodeURIComponent(repoUrl)}&repo=${encodeURIComponent(repo.name)}&fullName=${encodeURIComponent(fullName)}&provider=${provider}&from=hub`;
    window.location.href = chatUrl;
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h2 className="text-xl font-semibold text-gitmesh-elements-textPrimary mb-2">Error</h2>
              <p className="text-gitmesh-elements-textSecondary mb-4">{error}</p>
              <button
                onClick={() => navigate('/hub/projects')}
                className="px-4 py-2 bg-gitmesh-elements-button-primary-background text-gitmesh-elements-button-primary-text rounded-md hover:bg-gitmesh-elements-button-primary-backgroundHover"
              >
                Back to Projects
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!repo) {
    return null;
  }

  const owner = provider === 'github' ? (repo as GitHubRepoInfo).full_name.split('/')[0] : undefined;
  const repoName = provider === 'github' ? (repo as GitHubRepoInfo).full_name.split('/')[1] : undefined;
  const projectId = provider === 'gitlab' ? (repo as GitLabProjectInfo).id : undefined;

  return (
    <div className="p-8">
      <RepoHeader repo={repo} provider={provider} onOpenInGitMesh={handleOpenInGitMesh} />
      <RepoTabs
        provider={provider}
        owner={owner}
        repo={repoName}
        projectId={projectId}
        defaultBranch={repo.default_branch}
      />
    </div>
  );
}
