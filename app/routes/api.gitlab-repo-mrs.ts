import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import type { GitLabMergeRequest } from '~/types/GitLab';

async function gitlabRepoMRsLoader({ request }: { request: Request }) {
  try {
    const body: any = await request.json();
    const { token, projectId, gitlabUrl = 'https://gitlab.com', state = 'all', page = 1, perPage = 30 } = body;

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
      order_by: 'updated_at',
      sort: 'desc',
    });

    if (state !== 'all') {
      queryParams.append('state', state);
    }

    // Fetch merge requests
    const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests?${queryParams.toString()}`;

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

    const mrs: GitLabMergeRequest[] = await response.json();

    // Get pagination info from headers
    const totalPages = parseInt(response.headers.get('x-total-pages') || '1', 10);
    const currentPage = parseInt(response.headers.get('x-page') || '1', 10);
    const totalItems = parseInt(response.headers.get('x-total') || '0', 10);

    return json({
      mrs,
      pagination: {
        page: currentPage,
        perPage,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
      total: mrs.length,
    });
  } catch (error) {
    console.error('Failed to fetch GitLab merge requests:', error);

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
          error: `Failed to fetch merge requests: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching merge requests',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(gitlabRepoMRsLoader);
export const action = withSecurity(gitlabRepoMRsLoader);
