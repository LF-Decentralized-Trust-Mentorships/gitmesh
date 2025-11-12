import { json } from '@remix-run/cloudflare';
import { getGitHubTokenFromCookie } from '~/lib/api/cookies';
import { withSecurity } from '~/lib/security';
import type { GitHubRepoInfo } from '~/types/GitHub';

async function githubRepoDetailsLoader({ request, context }: { request: Request; context: any }) {
  try {
    const url = new URL(request.url);
    const owner = url.searchParams.get('owner');
    const repo = url.searchParams.get('repo');

    if (!owner || !repo) {
      return json({ error: 'Owner and repo parameters are required' }, { status: 400 });
    }

    // Get GitHub token from cookies
    const cookieHeader = request.headers.get('Cookie');
    const githubToken = getGitHubTokenFromCookie(cookieHeader, context);

    if (!githubToken) {
      return json({ error: 'GitHub token not found' }, { status: 401 });
    }

    // Fetch repository details
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${githubToken}`,
        'User-Agent': 'gitmesh-app',
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return json({ error: 'Repository not found' }, { status: 404 });
      }

      if (repoResponse.status === 401) {
        return json({ error: 'Invalid GitHub token' }, { status: 401 });
      }

      throw new Error(`GitHub API error: ${repoResponse.status}`);
    }

    const repoData: any = await repoResponse.json();

    // Transform to our format
    const repoInfo: GitHubRepoInfo = {
      id: repoData.id.toString(),
      name: repoData.name,
      full_name: repoData.full_name,
      html_url: repoData.html_url,
      description: repoData.description || '',
      stargazers_count: repoData.stargazers_count || 0,
      forks_count: repoData.forks_count || 0,
      default_branch: repoData.default_branch,
      updated_at: repoData.updated_at,
      language: repoData.language || '',
      languages_url: repoData.languages_url,
      private: repoData.private,
      topics: repoData.topics || [],
      archived: repoData.archived,
      fork: repoData.fork,
      size: repoData.size,
    };

    // Fetch additional stats in parallel
    const [branchesResponse, contributorsResponse, issuesResponse, prsResponse] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=1`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=false`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=1`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=1`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'gitmesh-app',
        },
      }),
    ]);

    // Extract counts from link headers
    if (branchesResponse.status === 'fulfilled' && branchesResponse.value.ok) {
      const linkHeader = branchesResponse.value.headers.get('Link');

      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);

        if (match) {
          repoInfo.branches_count = parseInt(match[1], 10);
        }
      }
    }

    if (contributorsResponse.status === 'fulfilled' && contributorsResponse.value.ok) {
      const linkHeader = contributorsResponse.value.headers.get('Link');

      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);

        if (match) {
          repoInfo.contributors_count = parseInt(match[1], 10);
        }
      }
    }

    if (issuesResponse.status === 'fulfilled' && issuesResponse.value.ok) {
      const linkHeader = issuesResponse.value.headers.get('Link');

      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);

        if (match) {
          repoInfo.issues_count = parseInt(match[1], 10);
        }
      }
    }

    if (prsResponse.status === 'fulfilled' && prsResponse.value.ok) {
      const linkHeader = prsResponse.value.headers.get('Link');

      if (linkHeader) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);

        if (match) {
          repoInfo.pull_requests_count = parseInt(match[1], 10);
        }
      }
    }

    return json({
      repo: repoInfo,
    });
  } catch (error) {
    console.error('Failed to fetch GitHub repository details:', error);

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
          error: `Failed to fetch repository details: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching repository details',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(githubRepoDetailsLoader);
