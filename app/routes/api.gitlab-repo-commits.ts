import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import type { GitLabCommit } from '~/types/GitLab';

async function gitlabRepoCommitsLoader({ request }: { request: Request }) {
  try {
    const body: any = await request.json();
    const { token, projectId, gitlabUrl = 'https://gitlab.com', branch = '', page = 1, perPage = 30 } = body;

    if (!token) {
      return json({ error: 'GitLab token is required' }, { status: 400 });
    }

    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (branch) {
      queryParams.append('ref_name', branch);
    }

    // Fetch commits
    const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/repository/commits?${queryParams.toString()}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'User-Agent': 'gitmesh-app',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return json({ error: 'Project not found' }, { status: 404 });
      }

      if (response.status === 401) {
        return json({ error: 'Invalid GitLab token' }, { status: 401 });
      }

      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('GitLab API error:', response.status, errorText);

      return json(
        {
          error: `GitLab API error: ${response.status}`,
        },
        { status: response.status },
      );
    }

    const commits: GitLabCommit[] = await response.json();

    // Get pagination info from headers
    const totalPages = parseInt(response.headers.get('x-total-pages') || '1', 10);
    const currentPage = parseInt(response.headers.get('x-page') || '1', 10);
    const totalItems = parseInt(response.headers.get('x-total') || '0', 10);

    return json({
      commits,
      pagination: {
        page: currentPage,
        perPage,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
      total: commits.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitLab commits:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return json(
          {
            error: 'Failed to connect to GitLab. Please check your network connection.',
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

export const loader = withSecurity(gitlabRepoCommitsLoader);
export const action = withSecurity(gitlabRepoCommitsLoader);
