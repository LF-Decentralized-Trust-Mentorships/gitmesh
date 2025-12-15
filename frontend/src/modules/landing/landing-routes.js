import LandingPage from '@/views/LandingPage.vue';

export default [
  {
    path: '/',
    name: 'landing',
    component: LandingPage,
    meta: {
      title: 'GitMesh',
      // No auth flags - accessible to everyone
    },
  },
];
