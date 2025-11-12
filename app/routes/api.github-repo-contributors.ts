import { json } from '@remix-run/cloudflare';
import { getGitHubTokenFromCookie } from '~/lib/api/cookies';
import { withSecurity } from '~/lib/security';
import type { GitHubContributor } from '~/types/GitHub';

async function githubRepoContributorsLoader({ request, context }: { request: Request; context: any }) {
  try {
    const url = new URL(request.url);
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('per_page') || '100', 10);

    if (!owner || !repo) {
      return json({ error: 'Owner and repo parameters are required' }, { status: 400 });
    }

    // Get GitHub token from cookies
    const cookieHeader = request.headers.get('Cookie');
    const githubToken = getGitHubTokenFromCookie(cookieHeader, context);

    if (!githubToken) {
      return json({ error: 'GitHub token not found' }, { status: 401 });
    }

    // Fetch contributors
    const contributorsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contributors?page=${page}&per_page=${perPage}&anon=false`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      },
    );

    if (!contributorsResponse.ok) {
      if (contributorsResponse.status === 404) {
        return json({ error: 'Repository not found' }, { status: 404 });
      }

      if (contributorsResponse.status === 401) {
        return json({ error: 'Invalid GitHub token' }, { status: 401 });
      }

      throw new Error(`GitHub API error: ${contributorsResponse.status}`);
    }

    const contributors: GitHubContributor[] = await contributorsResponse.json();

    // Get link header for pagination
    const linkHeader = contributorsResponse.headers.get('Link');
    let hasNextPage = false;
    let hasPrevPage = false;

    if (linkHeader) {
      hasNextPage = linkHeader.includes('rel="next"');
      hasPrevPage = linkHeader.includes('rel="prev"');
    }

    return json({
      contributors,
      pagination: {
        page,
        perPage,
        hasNextPage,
        hasPrevPage,
      },
      total: contributors.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitHub contributors:', error);

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
          error: `Failed to fetch contributors: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching contributors',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(githubRepoContributorsLoader);
