import { json } from '@remix-run/cloudflare';
import { getGitHubTokenFromCookie } from '~/lib/api/cookies';
import { withSecurity } from '~/lib/security';
import type { GitHubCommit } from '~/types/GitHub';

async function githubRepoCommitsLoader({ request, context }: { request: Request; context: any }) {
  try {
    const url = new URL(request.url);
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    const branch = url.searchParams.get('branch') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('per_page') || '30', 10);

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
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (branch) {
      queryParams.append('sha', branch);
    }

    // Fetch commits
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?${queryParams.toString()}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      },
    );

    if (!commitsResponse.ok) {
      if (commitsResponse.status === 404) {
        return json({ error: 'Repository not found' }, { status: 404 });
      }

      if (commitsResponse.status === 401) {
        return json({ error: 'Invalid GitHub token' }, { status: 401 });
      }

      throw new Error(`GitHub API error: ${commitsResponse.status}`);
    }

    const commits: GitHubCommit[] = await commitsResponse.json();

    // Get link header for pagination
    const linkHeader = commitsResponse.headers.get('Link');
    let hasNextPage = false;
    let hasPrevPage = false;

    if (linkHeader) {
      hasNextPage = linkHeader.includes('rel="next"');
      hasPrevPage = linkHeader.includes('rel="prev"');
    }

    return json({
      commits,
      pagination: {
        page,
        perPage,
        hasNextPage,
        hasPrevPage,
      },
      total: commits.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitHub commits:', error);

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
          error: `Failed to fetch commits: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching commits',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(githubRepoCommitsLoader);
