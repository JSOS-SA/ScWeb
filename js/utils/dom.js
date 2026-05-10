/**
 * دوال DOM المساعدة
 * --------------------------------------------------------------
 * أدوات صغيرة للتعامل مع عناصر الصفحة
 * --------------------------------------------------------------
 */

/**
 * يختصر document.getElementById
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * يختصر document.querySelector
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * يختصر document.querySelectorAll
 */
export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * ينشئ عنصراً مع خصائص ومحتوى
 */
export function createElement(tag, props = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (key === 'class' || key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      for (const [k, v] of Object.entries(value)) {
        el.dataset[k] = v;
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  for (const child of children.flat()) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else {
      el.appendChild(child);
    }
  }

  return el;
}

/**
 * يفرغ عنصراً من محتواه
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * يعرض رسالة تنبيه عابرة (toast)
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = $('toast-container');
  if (!container) {
    container = createElement('div', {
      id: 'toast-container',
      style: {
        position: 'fixed',
        bottom: '20px',
        insetInlineEnd: '20px',
        zIndex: '2000',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    });
    document.body.appendChild(container);
  }

  const toast = createElement('div', {
    class: `alert alert--${type}`,
    style: {
      minWidth: '300px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      opacity: '0',
      transition: 'opacity 250ms'
    }
  }, message);

  container.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/**
 * يعرض حواراً للتأكيد
 */
export function confirmDialog(message) {
  return Promise.resolve(window.confirm(message));
}

/**
 * يعرض حواراً للإدخال
 */
export function promptDialog(message, defaultValue = '') {
  return Promise.resolve(window.prompt(message, defaultValue));
}
