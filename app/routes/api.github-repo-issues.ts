import { json } from '@remix-run/cloudflare';
import { getGitHubTokenFromCookie } from '~/lib/api/cookies';
import { withSecurity } from '~/lib/security';
import type { GitHubIssue } from '~/types/GitHub';

async function githubRepoIssuesLoader({ request, context }: { request: Request; context: any }) {
  try {
    const url = new URL(request.url);
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    const state = url.searchParams.get('state') || 'all'; // open, closed, all
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('per_page') || '30', 10);
    const labels = url.searchParams.get('labels') || '';

    if (!owner || !repo) {
      return json({ error: 'Owner and repo parameters are required' }, { status: 400 });
    }

    // Get GitHub token from cookies
    const cookieHeader = request.headers.get('Cookie');
    const githubToken = getGitHubTokenFromCookie(cookieHeader, context);

    if (!githubToken) {
      return json({ error: 'GitHub token not found' }, { status: 401 });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      state,
      page: page.toString(),
      per_page: perPage.toString(),
      sort: 'updated',
      direction: 'desc',
    });

    if (labels) {
      queryParams.append('labels', labels);
    }

    // Fetch issues (exclude pull requests)
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?${queryParams.toString()}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      },
    );

    if (!issuesResponse.ok) {
      if (issuesResponse.status === 404) {
        return json({ error: 'Repository not found' }, { status: 404 });
      }

      if (issuesResponse.status === 401) {
        return json({ error: 'Invalid GitHub token' }, { status: 401 });
      }

      throw new Error(`GitHub API error: ${issuesResponse.status}`);
    }

    const allIssues: any[] = await issuesResponse.json();

    // Filter out pull requests (they have pull_request property)
    const issues: GitHubIssue[] = allIssues
      .filter((issue) => !issue.pull_request)
      .map((issue) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        user: issue.user,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        closed_at: issue.closed_at,
        html_url: issue.html_url,
        labels: issue.labels || [],
        assignees: issue.assignees || [],
        comments: issue.comments || 0,
        milestone: issue.milestone || null,
      }));

    // Get link header for pagination
    const linkHeader = issuesResponse.headers.get('Link');
    let hasNextPage = false;
    let hasPrevPage = false;

    if (linkHeader) {
      hasNextPage = linkHeader.includes('rel="next"');
      hasPrevPage = linkHeader.includes('rel="prev"');
    }

    return json({
      issues,
      pagination: {
        page,
        perPage,
        hasNextPage,
        hasPrevPage,
      },
      total: issues.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitHub issues:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return json(
          {
            error: 'Failed to connect to GitHub. Please check your network connection.',
          },
          { status: 503 },
        );
      }

      return json(
        {
          error: `Failed to fetch issues: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching issues',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(githubRepoIssuesLoader);
