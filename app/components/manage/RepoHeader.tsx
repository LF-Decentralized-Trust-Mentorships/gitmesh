import React from 'react';
import { Button } from '~/components/ui/Button';
import { Badge } from '~/components/ui/Badge';
import { ExternalLink, Star, GitFork, Code, Calendar } from 'lucide-react';
import type { GitHubRepoInfo } from '~/types/GitHub';
import type { GitLabProjectInfo } from '~/types/GitLab';
import { formatDistanceToNow } from 'date-fns';

interface RepoHeaderProps {
  repo: GitHubRepoInfo | GitLabProjectInfo;
  provider: 'github' | 'gitlab';
  onOpenInGitMesh?: () => void;
}

export function RepoHeader({ repo, provider, onOpenInGitMesh }: RepoHeaderProps) {
  const repoUrl =
    provider === 'github' ? (repo as GitHubRepoInfo).html_url : (repo as GitLabProjectInfo).http_url_to_repo;
  const stars =
    provider === 'github' ? (repo as GitHubRepoInfo).stargazers_count : (repo as GitLabProjectInfo).star_count;
  const forks = provider === 'github' ? (repo as GitHubRepoInfo).forks_count : (repo as GitLabProjectInfo).forks_count;
  const language = provider === 'github' ? (repo as GitHubRepoInfo).language : undefined;
  const topics = provider === 'github' ? (repo as GitHubRepoInfo).topics : undefined;

  const handleOpenInGitMesh = () => {
    if (onOpenInGitMesh) {
      onOpenInGitMesh();
    } else {
      const repoUrl =
        provider === 'github'
          ? `${(repo as GitHubRepoInfo).html_url}.git`
          : (repo as GitLabProjectInfo).http_url_to_repo;
      const fullName =
        provider === 'github' ? (repo as GitHubRepoInfo).full_name : (repo as GitLabProjectInfo).path_with_namespace;
      const chatUrl = `/chat?clone=${encodeURIComponent(repoUrl)}&repo=${encodeURIComponent(repo.name)}&fullName=${encodeURIComponent(fullName)}&provider=${provider}&from=hub`;
      window.location.href = chatUrl;
    }
  };

  return (
    <div className="border-b border-gitmesh-elements-borderColor pb-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gitmesh-elements-textPrimary">{repo.name}</h1>
            {provider === 'github' && (repo as GitHubRepoInfo).private && (
              <Badge variant="outline" size="sm">
                Private
              </Badge>
            )}
            {provider === 'gitlab' && (repo as GitLabProjectInfo).visibility === 'private' && (
              <Badge variant="outline" size="sm">
                Private
              </Badge>
            )}
          </div>
          {repo.description && <p className="text-gitmesh-elements-textSecondary mb-4 max-w-3xl">{repo.description}</p>}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-gitmesh-elements-textSecondary text-sm">
              <Star className="w-4 h-4" />
              <span>{stars}</span>
            </div>
            <div className="flex items-center gap-1 text-gitmesh-elements-textSecondary text-sm">
              <GitFork className="w-4 h-4" />
              <span>{forks}</span>
            </div>
            {language && (
              <div className="flex items-center gap-1 text-gitmesh-elements-textSecondary text-sm">
                <Code className="w-4 h-4" />
                <span>{language}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-gitmesh-elements-textSecondary text-sm">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</span>
            </div>
          </div>
          {topics && topics.length > 0 && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              {topics.slice(0, 5).map((topic) => (
                <Badge key={topic} variant="subtle" size="sm">
                  {topic}
                </Badge>
              ))}
              {topics.length > 5 && (
                <Badge variant="subtle" size="sm">
                  +{topics.length - 5} more
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open(repoUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on {provider === 'github' ? 'GitHub' : 'GitLab'}
          </Button>
          <button
            onClick={handleOpenInGitMesh}
            className="px-4 py-2 bg-gitmesh-elements-button-primary-background text-gitmesh-elements-button-primary-text rounded-md hover:bg-gitmesh-elements-button-primary-backgroundHover text-sm font-medium transition-colors flex items-center gap-2"
          >
            Open in GitMesh
          </button>
        </div>
      </div>
    </div>
  );
}
