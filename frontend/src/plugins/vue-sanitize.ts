import type { App } from 'vue';
import DOMPurify from 'dompurify';
import { vueSanitizeOptions } from './sanitize';

/**
 * Convert sanitize-html style options to DOMPurify config
 */
function convertToDOMPurifyConfig(options: typeof vueSanitizeOptions): DOMPurify.Config {
  return {
    ALLOWED_TAGS: options.allowedTags?.filter((tag: string) => !tag.startsWith('<')) || [],
    ALLOWED_ATTR: [
      ...new Set(
        Object.values(options.allowedAttributes || {}).flat()
      ),
    ],
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|ftp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  };
}

const domPurifyConfig = convertToDOMPurifyConfig(vueSanitizeOptions);

/**
 * Custom Vue 3 sanitize plugin using DOMPurify
 * DOMPurify is browser-native and doesn't require Node.js modules
 */
export default {
  install(app: App) {
    app.config.globalProperties.$sanitize = (dirty: string, _options?: unknown) => {
      if (!dirty) return '';
      return DOMPurify.sanitize(dirty, domPurifyConfig);
    };
  },
};
