import { MenuLink } from '@/modules/layout/types/MenuLink';

const chat: MenuLink = {
  id: 'chat',
  label: 'Chat',
  icon: 'ri-chat-smile-2-line',
  routeName: 'chat',
  display: () => true,
  disable: () => false,
};

export default chat;
