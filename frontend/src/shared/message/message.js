import { i18n } from '@/i18n';
import { ElNotification } from 'element-plus';
import 'element-plus/es/components/notification/style/css';

import { h, ref } from 'vue';

// Typewriter effect component
const TypewriterText = (text) => {
  return h('div', {
    class: 'typewriter-text',
    innerHTML: '',
    onVnodeMounted: (vnode) => {
      const element = vnode.el;
      let index = 0;
      const speed = 30; // milliseconds per character
      
      const typeChar = () => {
        if (index < text.length) {
          element.innerHTML += text.charAt(index);
          index++;
          setTimeout(typeChar, speed);
        }
      };
      
      typeChar();
    },
  });
};

const successIcon = h(
  'i', // type
  { class: 'ri-checkbox-circle-fill text-green-400 text-lg' }, // props
  [],
);

const errorIcon = h(
  'i', // type
  { class: 'ri-error-warning-fill text-red-400 text-lg' }, // props
  [],
);

const infoIcon = h(
  'i', // type
  { class: 'ri-loader-4-line text-blue-400 animate-spin text-lg' }, // props
  [],
);

export default class Message {
  static success(message, options = {}) {
    const title = options.title ? options.title : message;
    const body = options.title ? message : null;
    
    ElNotification(
      {
        title: '',
        showClose: true,
        message: h('div', { class: 'notification-content' }, [
          h('div', { class: 'notification-header' }, [
            successIcon,
            TypewriterText(title),
          ]),
          body ? TypewriterText(body) : null,
        ]),
        customClass: 'success modern-notification robotic-notification',
        duration: 5000,
        dangerouslyUseHTMLString: false,
        position: 'bottom-right',
        offset: 24,
        ...options,
      },
    );
  }

  static error(payload, options = {}) {
    let message = payload;

    if (!message) {
      message = i18n('errors.defaultErrorMessage');
    }
    
    const title = options.title ? options.title : message;
    const body = options.title ? message : null;

    ElNotification(
      {
        title: '',
        showClose: true,
        message: h('div', { class: 'notification-content' }, [
          h('div', { class: 'notification-header' }, [
            errorIcon,
            TypewriterText(title),
          ]),
          body ? TypewriterText(body) : null,
        ]),
        customClass: 'error modern-notification robotic-notification',
        duration: 7000,
        dangerouslyUseHTMLString: false,
        position: 'bottom-right',
        offset: 24,
        ...options,
      },
    );
  }

  static info(message, options = {}) {
    const title = options.title ? options.title : message;
    const body = options.title ? message : null;
    
    ElNotification(
      {
        title: '',
        showClose: true,
        message: h('div', { class: 'notification-content' }, [
          h('div', { class: 'notification-header' }, [
            infoIcon,
            TypewriterText(title),
          ]),
          body ? TypewriterText(body) : null,
        ]),
        customClass: 'info modern-notification robotic-notification',
        duration: 5000,
        dangerouslyUseHTMLString: false,
        position: 'bottom-right',
        offset: 24,
        ...options,
      },
    );
  }

  static closeAll() {
    ElNotification.closeAll();
  }
}
