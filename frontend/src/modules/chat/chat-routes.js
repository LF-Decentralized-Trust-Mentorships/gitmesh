import Layout from '@/modules/layout/components/layout.vue';

const ChatPage = () => import('@/modules/chat/pages/chat-page.vue');

export default [
  {
    name: '',
    path: '/chat',
    component: Layout,
    meta: { auth: true, title: 'Chat' },
    children: [
      {
        name: 'chat',
        path: '/chat',
        component: ChatPage,
        meta: {
          auth: true,
          badge: 'BETA',
        },
      },
    ],
  },
];
