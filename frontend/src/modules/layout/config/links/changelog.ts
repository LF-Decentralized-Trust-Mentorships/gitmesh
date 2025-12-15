import { MenuLink } from '@/modules/layout/types/MenuLink';

const changelog: MenuLink = {
  id: 'changelog',
  label: 'Changelog',
  icon: 'ri-megaphone-line',
  href: 'https://github.com/alveoli-app/gitmesh',
  display: () => true,
  disable: () => false,
};

export default changelog;
