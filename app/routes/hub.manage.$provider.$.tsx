import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { ManageRepoPage } from '~/components/manage/ManageRepoPage';

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { provider } = params;
  // Splat route captures everything after /hub/manage/{provider}/
  const identifier = params['*'] || '';

  if (!provider || !identifier) {
    throw new Response('Missing provider or identifier', { status: 400 });
  }

  if (provider !== 'github' && provider !== 'gitlab') {
    throw new Response('Invalid provider. Must be "github" or "gitlab"', { status: 400 });
  }

  return json({ provider, identifier });
};

export default function HubManage() {
  return <ManageRepoPage />;
}
