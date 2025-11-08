export function parseCookies(cookieHeader: string | null) {
  const cookies: Record<string, string> = {};

  if (!cookieHeader) {
    return cookies;
  }

  // Split the cookie string by semicolons and spaces
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());

  items.forEach((item) => {
    const [name, ...rest] = item.split('=');

    if (name && rest.length > 0) {
      // Decode the name and value, and join value parts in case it contains '='
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });

  return cookies;
}

export function getApiKeysFromCookie(cookieHeader: string | null): Record<string, string> {
  const cookies = parseCookies(cookieHeader);
  return cookies.apiKeys ? JSON.parse(cookies.apiKeys) : {};
}

export function getProviderSettingsFromCookie(cookieHeader: string | null): Record<string, any> {
  const cookies = parseCookies(cookieHeader);
  return cookies.providers ? JSON.parse(cookies.providers) : {};
}

export function getGitHubTokenFromCookie(cookieHeader: string | null, context?: any): string {
  const cookies = parseCookies(cookieHeader);
  const apiKeys = getApiKeysFromCookie(cookieHeader);

  // Try to get GitHub token from various sources
  return (
    cookies.githubToken ||
    apiKeys.GITHUB_API_KEY ||
    apiKeys.VITE_GITHUB_ACCESS_TOKEN ||
    context?.cloudflare?.env?.GITHUB_TOKEN ||
    context?.cloudflare?.env?.VITE_GITHUB_ACCESS_TOKEN ||
    process.env.GITHUB_TOKEN ||
    process.env.VITE_GITHUB_ACCESS_TOKEN ||
    ''
  );
}
