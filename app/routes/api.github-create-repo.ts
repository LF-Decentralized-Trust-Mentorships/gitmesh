import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { withSecurity } from '~/lib/security';

// Define the shape of the incoming request body
interface CreateRepoRequestBody {
  repoName?: string;
  description?: string;
  isPrivate?: boolean;
  autoInit?: boolean;
}

// Define a basic shape for a potential GitHub API error
interface GitHubApiError {
  message?: string;
  [key: string]: any; // Allow other properties
}

// A helper to parse the specific cookie we need
function getGitHubTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const cookie = cookies.find((c) => c.startsWith('githubToken='));

  return cookie ? cookie.split('=')[1] : null;
}

async function createRepoAction({ request, context: _context }: ActionFunctionArgs) {
  try {
    const cookieHeader = request.headers.get('Cookie');
    const githubToken = getGitHubTokenFromCookie(cookieHeader);

    if (!githubToken) {
      return json({ error: 'GitHub token not found in cookies' }, { status: 401 });
    }

    const { repoName, description, isPrivate, autoInit } = (await request.json()) as CreateRepoRequestBody;

    if (!repoName) {
      return json({ error: 'Repository name is required' }, { status: 400 });
    }

    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${githubToken}`,
        'User-Agent': 'gitmesh-app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description,
        private: isPrivate,
        auto_init: autoInit,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json()) as GitHubApiError;
      // Keep this server-side log for production error monitoring
      console.error('GitHub API Error during repo creation:', errorData);

      return json(
        { error: 'Failed to create repository on GitHub', details: errorData.message || 'Unknown error' },
        { status: response.status },
      );
    }

    const newRepo = await response.json();

    return json(newRepo, { status: 201 });
  } catch (error) {
    console.error('Error creating GitHub repository:', error);
    return json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export const action = withSecurity(createRepoAction, {
  rateLimit: true,
  allowedMethods: ['POST'],
});
