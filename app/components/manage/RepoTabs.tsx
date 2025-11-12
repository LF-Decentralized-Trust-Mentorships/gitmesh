import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/Tabs';
import { OverviewTab } from './OverviewTab';
import { PullRequestsTab } from './PullRequestsTab';
import { IssuesTab } from './IssuesTab';
import { ContributionsTab } from './ContributionsTab';
import { BranchesTab } from './BranchesTab';

interface RepoTabsProps {
  provider: 'github' | 'gitlab';
  owner?: string;
  repo?: string;
  projectId?: string | number;
  defaultBranch?: string;
}

export function RepoTabs({ provider, owner, repo, projectId, defaultBranch }: RepoTabsProps) {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="prs">{provider === 'github' ? 'Pull Requests' : 'Merge Requests'}</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
        <TabsTrigger value="contributions">Contributions</TabsTrigger>
        <TabsTrigger value="branches">Branches</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-6">
        <OverviewTab
          provider={provider}
          owner={owner}
          repo={repo}
          projectId={projectId}
          defaultBranch={defaultBranch}
        />
      </TabsContent>
      <TabsContent value="prs" className="mt-6">
        <PullRequestsTab provider={provider} owner={owner} repo={repo} projectId={projectId} />
      </TabsContent>
      <TabsContent value="issues" className="mt-6">
        <IssuesTab provider={provider} owner={owner} repo={repo} projectId={projectId} />
      </TabsContent>
      <TabsContent value="contributions" className="mt-6">
        <ContributionsTab
          provider={provider}
          owner={owner}
          repo={repo}
          projectId={projectId}
          defaultBranch={defaultBranch}
        />
      </TabsContent>
      <TabsContent value="branches" className="mt-6">
        <BranchesTab provider={provider} owner={owner} repo={repo} projectId={projectId} />
      </TabsContent>
    </Tabs>
  );
}
