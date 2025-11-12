import { json } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';
import type { GitLabProjectInfo } from '~/types/GitLab';

async function gitlabRepoDetailsLoader({ request }: { request: Request }) {
  try {
    const body: any = await request.json();
    const { token, projectId, gitlabUrl = 'https://gitlab.com' } = body;

    if (!token) {
      return json({ error: 'GitLab token is required' }, { status: 400 });
    }

    if (!projectId) {
      return json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Fetch project details
    const url = `${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}`;

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

    const projectData: any = await response.json();

    // Transform to our format
    const projectInfo: GitLabProjectInfo = {
      id: projectData.id,
      name: projectData.name,
      path_with_namespace: projectData.path_with_namespace,
      description: projectData.description || '',
      http_url_to_repo: projectData.http_url_to_repo,
      star_count: projectData.star_count || 0,
      forks_count: projectData.forks_count || 0,
      updated_at: projectData.updated_at,
      default_branch: projectData.default_branch,
      visibility: projectData.visibility,
    };

    // Fetch additional stats in parallel
    const [mrsResponse, issuesResponse, contributorsResponse] = await Promise.allSettled([
      fetch(`${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests?per_page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'User-Agent': 'gitmesh-app',
        },
      }),
      fetch(`${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/issues?per_page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'User-Agent': 'gitmesh-app',
        },
      }),
      fetch(`${gitlabUrl}/api/v4/projects/${encodeURIComponent(projectId)}/repository/contributors?per_page=1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'User-Agent': 'gitmesh-app',
        },
      }),
    ]);

    // Extract counts from headers
    if (mrsResponse.status === 'fulfilled' && mrsResponse.value.ok) {
      const total = mrsResponse.value.headers.get('x-total');

      if (total) {
        // Store in a way that's compatible with our interface
        (projectInfo as any).merge_requests_count = parseInt(total, 10);
      }
    }

    if (issuesResponse.status === 'fulfilled' && issuesResponse.value.ok) {
      const total = issuesResponse.value.headers.get('x-total');

      if (total) {
        (projectInfo as any).issues_count = parseInt(total, 10);
      }
    }

    if (contributorsResponse.status === 'fulfilled' && contributorsResponse.value.ok) {
      const total = contributorsResponse.value.headers.get('x-total');

      if (total) {
        (projectInfo as any).contributors_count = parseInt(total, 10);
      }
    }

    return json({
      repo: projectInfo,
    });
  } catch (error) {
    console.error('Failed to fetch GitLab project details:', error);

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
          error: `Failed to fetch project details: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return json(
      {
        error: 'An unexpected error occurred while fetching project details',
      },
      { status: 500 },
    );
  }
}

export const loader = withSecurity(gitlabRepoDetailsLoader);
export const action = withSecurity(gitlabRepoDetailsLoader);
