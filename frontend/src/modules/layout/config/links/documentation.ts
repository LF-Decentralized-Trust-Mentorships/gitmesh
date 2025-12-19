import { MenuLink } from '@/modules/layout/types/MenuLink';

const documentation: MenuLink = {
  id: 'documentation',
  label: 'Documentation',
  icon: 'ri-book-open-line',
  href: 'https://github.com/LF-Decentralized-Trust-labs/gitmesh',
  display: () => true,
  disable: () => false,
};

export default documentation;
