import { ElMessageBox } from 'element-plus';
import { h } from 'vue';
import 'element-plus/es/components/message-box/style/css';

export default ({
  vertical = false,
  type = 'warning',
  title = ':: SYSTEM_ALERT',
  message = 'Confirm execution of this command?',
  badgeContent = undefined,
  highlightedInfo = undefined,
  showCancelButton = true,
  showClose = false,
  // Triggers the global CSS for Black BG / White Border defined in your App
  customClass = 'terminal-dialog', 
  cancelButtonText = 'CANCEL',
  // Default Terminal Cancel Button
  cancelButtonClass = 'h-10 px-4 bg-black border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors w-full rounded-none',
  confirmButtonText = 'CONFIRM',
  // Default Terminal Confirm Button
  confirmButtonClass = 'h-10 px-4 bg-orange-600 hover:bg-orange-500 text-black font-mono text-xs font-bold uppercase tracking-wider border-none w-full rounded-none',
  icon = 'ri-error-warning-fill',
  distinguishCancelAndClose = false,
  autofocus = true,
  closeOnClickModal = true,
  titleClass = null,
  messageClass = null,
  verticalCancelButtonClass = null,
  verticalConfirmButtonClass = null,
  verticalCustomClass = null,
  hideCloseButton = false,
}) => {
  
  // 1. Terminal Color Logic
  // We use dark backgrounds (zinc-900) and specific accents for the icon box
  let iconColorClass = 'text-orange-500';
  let iconBgColorClass = 'bg-zinc-900 border border-zinc-700';

  if (type === 'danger') {
    iconColorClass = 'text-red-500';
    iconBgColorClass = 'bg-red-950/30 border border-red-900';
  } else if (type === 'info') {
    iconColorClass = 'text-zinc-400';
    iconBgColorClass = 'bg-zinc-900 border border-zinc-700';
  } else if (type === 'success') {
    iconColorClass = 'text-emerald-500';
    iconBgColorClass = 'bg-emerald-950/30 border border-emerald-900';
  } else if (type === 'notification') {
    iconColorClass = 'text-blue-500';
    iconBgColorClass = 'bg-blue-950/30 border border-blue-900';
  }

  // 2. Icon Render Function (Sharp corners, dark bg)
  const renderIcon = () => {
    if (type === 'custom') {
      return h('span', { innerHTML: icon, class: '' });
    }
    return h(
      'span',
      {
        class: `rounded-sm ${iconBgColorClass} w-10 h-10 flex items-center justify-center shrink-0 custom-icon`,
      },
      [
        h('i', { class: `${icon} text-lg ${iconColorClass} leading-none` }),
      ],
    );
  };

  // 3. Highlight Info Render Function (Terminal arrow style)
  const renderHighlight = () => {
    if (!highlightedInfo) return undefined;
    return h(
      'div',
      {
        class: 'mt-4 p-2 bg-zinc-900/50 border-l-2 border-orange-500 text-[11px] text-orange-500 font-mono flex items-start gap-2',
      },
      [
        h('i', { class: 'ri-arrow-right-s-line mt-0.5' }),
        h('div', { innerHTML: highlightedInfo }),
      ],
    );
  };

  let content;

  // --- VERTICAL LAYOUT (Default for most dialogs) ---
  if (vertical) {
    content = h(
      'div', 
      { class: 'font-mono' }, // Wrapper to force mono font
      [
        h(
          'div',
          { class: 'flex justify-between items-start mb-4' },
          [
            renderIcon(),
            !hideCloseButton ? h(
              'button',
              {
                class: 'text-zinc-200 hover:text-white transition-colors focus:outline-none w-8 h-8 flex items-center justify-center',
                type: 'button',
                onClick: () => {
                  const btn = document.querySelector('.el-message-box__headerbtn');
                  if(btn) btn.dispatchEvent(new Event('click'));
                },
              },
              [h('i', { class: 'text-xl ri-close-line leading-none' })],
            ) : null,
          ],
        ),
        
        // Title
        h('h6', {
          innerHTML: title,
          class: `text-white font-bold uppercase tracking-wider text-sm mb-2 ${titleClass || ''}`,
        }),
        
        // Optional Badge
        badgeContent ? h('div', {
          class: 'border border-zinc-700 bg-zinc-900 px-2 py-0.5 mb-3 inline-flex text-[10px] text-zinc-300 uppercase tracking-wide',
          innerHTML: badgeContent,
        }) : undefined,
        
        // Message Body
        h('div', {
          innerHTML: message,
          class: `text-zinc-400 text-xs leading-relaxed ${messageClass || ''}`,
        }),
        
        renderHighlight(),
      ],
    );

    const overrideCustomClass = `terminal-dialog ${verticalCustomClass || ''}`;

    return ElMessageBox({
      title: '', // Title handled in content
      message: content,
      showClose: true,
      showCancelButton,
      customClass: overrideCustomClass,
      confirmButtonText,
      confirmButtonClass: verticalConfirmButtonClass || confirmButtonClass,
      cancelButtonText,
      cancelButtonClass: verticalCancelButtonClass || cancelButtonClass,
      distinguishCancelAndClose,
      autofocus,
      closeOnClickModal,
    });
  }

  // --- HORIZONTAL LAYOUT ---
  content = h(
    'div',
    { class: 'flex gap-4 font-mono' },
    [
      h('div', { class: 'relative' }, [ renderIcon() ]),
      h('div', [
        h('p', {
          innerHTML: message,
          class: `text-zinc-300 text-xs leading-relaxed ${messageClass || ''}`,
        }),
        renderHighlight(),
      ]),
    ],
  );

  return ElMessageBox({
    title,
    message: content,
    showCancelButton,
    showClose,
    customClass,
    cancelButtonText,
    cancelButtonClass,
    confirmButtonText,
    confirmButtonClass,
    distinguishCancelAndClose,
    autofocus,
    closeOnClickModal,
  });
};