import React from 'react';
import { useNavigate } from '@remix-run/react';
import type { GitLabProjectInfo } from '~/types/GitLab';

interface RepositoryCardProps {
  repo: GitLabProjectInfo;
  onClone?: (repo: GitLabProjectInfo) => void;
}

export function RepositoryCard({ repo, onClone }: RepositoryCardProps) {
  const navigate = useNavigate();

  const handleManage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/hub/manage/gitlab/${repo.id}`);
  };

  return (
    <a
      key={repo.name}
      href={repo.http_url_to_repo}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 rounded-lg bg-gitmesh-elements-background-depth-1 border border-gitmesh-elements-borderColor hover:border-blue-500 transition-all duration-200 h-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="i-ph:git-repository w-4 h-4 text-gitmesh-elements-icon-info" />
              <h5 className="text-sm font-medium text-gitmesh-elements-textPrimary group-hover:text-blue-500 transition-colors">
                {repo.name}
              </h5>
              {repo.visibility === 'private' && (
                <div className="i-ph:lock w-3 h-3 text-gitmesh-elements-textTertiary" title="Private repository" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gitmesh-elements-textSecondary">
              <span className="flex items-center gap-1" title="Stars (GitLab)">
                <div className="i-ph:star w-3.5 h-3.5 text-gitmesh-elements-icon-warning" />
                {repo.star_count.toLocaleString()}
                <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 ml-1">
                  GL
                </span>
              </span>
              <span className="flex items-center gap-1" title="Forks (GitLab)">
                <div className="i-ph:git-fork w-3.5 h-3.5 text-gitmesh-elements-icon-info" />
                {repo.forks_count.toLocaleString()}
                <span className="text-[10px] font-medium px-1 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 ml-1">
                  GL
                </span>
              </span>
            </div>
          </div>

          {repo.description && (
            <p className="text-xs text-gitmesh-elements-textSecondary line-clamp-2">{repo.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-gitmesh-elements-textSecondary">
            <span className="flex items-center gap-1" title="Default Branch">
              <div className="i-ph:git-branch w-3.5 h-3.5" />
              {repo.default_branch}
            </span>
            <span className="flex items-center gap-1" title="Visibility">
              <div className="w-2 h-2 rounded-full bg-current opacity-60" />
              {repo.visibility}
            </span>
            <span className="flex items-center gap-1" title="Last Updated">
              <div className="i-ph:clock w-3.5 h-3.5" />
              {new Date(repo.updated_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* To show if the repository is a public repository */}
        {repo.source_public && (
          <span className="flex items-center gap-1 text-xs text-gitmesh-elements-textSecondary group-hover:text-blue-500 transition-colors">
            <div className="i-ph:eye w-3.5 h-3.5" />
            Source:Public
          </span>
        )}

        {!repo.source_public && (
          <span className="flex items-center gap-1 text-xs text-gitmesh-elements-textSecondary group-hover:text-blue-500 transition-colors">
            <div className="i-ph:eye w-3.5 h-3.5" />
            Source:Connected
          </span>
        )}

        {/* Bottom section with Clone and Manage buttons */}
        <div className="flex items-center gap-2 pt-3 mt-auto">
          {onClone ? (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClone(repo);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors flex-1 justify-center"
                title="Clone repository"
              >
                <div className="i-ph:git-branch w-4 h-4" />
                Open in GitMesh
              </button>
              <button
                onClick={handleManage}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gitmesh-elements-background-depth-2 hover:bg-gitmesh-elements-background-depth-3 text-gitmesh-elements-textPrimary border border-gitmesh-elements-borderColor transition-colors"
                title="Manage repository"
              >
                <div className="i-ph:gear w-4 h-4" />
                Manage
              </button>
            </>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gitmesh-elements-textSecondary group-hover:text-blue-500 transition-colors">
              <div className="i-ph:arrow-square-out w-3.5 h-3.5" />
              View
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
