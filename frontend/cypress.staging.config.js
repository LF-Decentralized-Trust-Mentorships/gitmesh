const { defineConfig } = require('cypress');
require('dotenv').config({
  path: './.env.cypress',
});

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://apptest-kube.gitmesh.dev',
    specPattern: 'tests/e2e/*.spec.js',
    supportFile: 'tests/support/index.js',
  },
  folders: {
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'tests/screenshots',
    videosFolder: 'tests/videos',
  },
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
    },
  },
  browser: {
    chromeWebSecurity: false,
  },
  env: {
    appUrl: 'https://apptest-kube.gitmesh.dev',
    apiUrl: 'https://apptest-kube.gitmesh.dev/api',
    MAILOSAUR_API_KEY: import.meta.env.MAILOSAUR_API_KEY,
    MAILOSAUR_SERVER_ID: import.meta.env.MAILOSAUR_SERVER_ID,
  },
});
