export interface ResourceLink {
  text: string;
  icon: string;
  url: string;
}

export const resourcesLinks: ResourceLink[] = [
  {
    text: 'GitMesh YouTube Channel',
    icon: 'ri-film-line',
    url: 'https://www.youtube.com/@GitMesh',
  },
  {
    text: 'Documentation',
    icon: 'ri-book-open-line',
    url: 'https://github.com/alveoli-app/gitmesh',
  },
  // {
  //   text: 'API Reference',
  //   icon: 'ri-braces-line',
  //   url: '',
  // },
  // {
  //   text: 'Changelog',
  //   icon: 'ri-megaphone-line',
  //   url: '',
  // },
  {
    text: 'Discord community',
    icon: 'ri-discord-fill',
    url: 'https://discord.gg/xXvYkK3yEp',
  },
];
