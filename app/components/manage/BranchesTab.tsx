import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '~/components/ui/Card';
import { Badge } from '~/components/ui/Badge';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { GitBranch, Shield } from 'lucide-react';

interface BranchInfo {
  name: string;
  sha: string;
  protected: boolean;
  isDefault: boolean;
}

interface BranchesTabProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
}

export function BranchesTab({ provider, owner, repo, projectId }: BranchesTabProps) {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      setError(null);

      try {
        if (provider === 'github' && owner && repo) {
          const response = await fetch(
            `/api/github-branches?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`,
          );

          if (!response.ok) {
            throw new Error('Failed to fetch branches');
          }

          const data = (await response.json()) as { branches: BranchInfo[] };
          setBranches(data.branches);
        } else if (provider === 'gitlab' && projectId) {
          /*
           * GitLab branches would need a separate API endpoint
           * For now, we'll show a placeholder
           */
          setBranches([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch branches');
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [provider, owner, repo, projectId]);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {branches.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gitmesh-elements-textSecondary">No branches found</div>
          </CardContent>
        </Card>
      ) : (
        branches.map((branch) => (
          <Card key={branch.name} className="hover:bg-gitmesh-elements-background-depth-2 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitBranch className="w-4 h-4 text-gitmesh-elements-textSecondary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gitmesh-elements-textPrimary">{branch.name}</span>
                      {branch.isDefault && <Badge variant="primary">Default</Badge>}
                      {branch.protected && (
                        <Badge variant="warning" className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Protected
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gitmesh-elements-textSecondary mt-1">
                      <code>{branch.sha.substring(0, 7)}</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
