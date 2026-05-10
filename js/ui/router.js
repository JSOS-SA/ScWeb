/**
 * موجه التنقل بين الشاشات
 * --------------------------------------------------------------
 * مسؤول عن:
 *   - عرض الشاشة الصحيحة بناءً على الصفحة المختارة
 *   - تحديث الشريط الجانبي
 *   - استدعاء دالة renderXxx للصفحة المطلوبة
 * --------------------------------------------------------------
 */

import { $ , clearElement, createElement, qsa } from '../utils/dom.js';
import { renderHomePage } from './page-home.js';
import { renderImportPage } from './page-import.js';

// قائمة الصفحات المعرفة
const PAGES = Object.freeze({
  home:    { label: 'الصفحة الرئيسية',         render: renderHomePage },
  records: { label: 'السجل الرئيسي',           render: null }, // قيد التطوير
  board:   { label: 'لوحة الرحلات اللحظية',    render: null },
  kpis:    { label: 'مؤشرات الأداء',           render: null },
  peak:    { label: 'ساعات الذروة',            render: null },
  stats:   { label: 'إحصاءات الرحلات',         render: null },
  handover:{ label: 'تسليم النوبة',            render: null },
  reports: { label: 'المحاضر',                 render: null },
  troubled:{ label: 'الرحلات المتعثرة',        render: null },
  master:  { label: 'الرحلات الدائمة',         render: null },
  radar:   { label: 'Flight Radar 24',         render: null },
  import:  { label: 'استيراد ملف إكسل',        render: renderImportPage },
  settings:{ label: 'الإعدادات',               render: null }
});

let currentPage = 'home';

/**
 * يحدث الشريط الجانبي ليبرز الصفحة الحالية
 */
function highlightSidebar(pageKey) {
  const items = qsa('.sidebar-nav__item');
  items.forEach(item => {
    if (item.dataset.page === pageKey) {
      item.classList.add('sidebar-nav__item--active');
    } else {
      item.classList.remove('sidebar-nav__item--active');
    }
  });
}

/**
 * يعرض رسالة قيد التطوير لصفحات لم تكتمل بعد
 */
function renderPlaceholder(container, label) {
  clearElement(container);
  container.appendChild(createElement('div', { class: 'page-header' },
    createElement('h1', { class: 'page-header__title' }, label)
  ));
  container.appendChild(createElement('div', { class: 'empty-state' },
    createElement('div', { class: 'empty-state__title' }, 'قيد التطوير'),
    createElement('div', {},
      'هذه الشاشة ستُبنى في المرحلة التالية. حالياً متاح: الصفحة الرئيسية واستيراد ملف الإكسل.')
  ));
}

/**
 * ينتقل إلى صفحة معينة
 */
export async function navigateTo(pageKey) {
  if (!PAGES[pageKey]) {
    console.warn(`صفحة غير معروفة: ${pageKey}`);
    return;
  }

  currentPage = pageKey;
  highlightSidebar(pageKey);

  const main = $('app-main');
  if (!main) return;

  const page = PAGES[pageKey];
  if (page.render) {
    await page.render(main, { onNavigate: navigateTo });
  } else {
    renderPlaceholder(main, page.label);
  }

  // تحديث عنوان المتصفح
  document.title = page.label + ' | برنامج حافلات صالة الحج';
}

/**
 * يبني عناصر الشريط الجانبي
 */
export function buildSidebar() {
  const sidebar = $('app-sidebar');
  if (!sidebar) return;

  const nav = createElement('ul', { class: 'sidebar-nav' });

  // مجموعة العمليات اليومية
  nav.appendChild(createElement('li', { class: 'sidebar-nav__group' }, 'العمليات اليومية'));
  ['home', 'records', 'board', 'handover'].forEach(key => {
    nav.appendChild(createElement('li', {
      class: 'sidebar-nav__item',
      dataset: { page: key },
      onClick: () => navigateTo(key)
    }, PAGES[key].label));
  });

  // مجموعة التقارير
  nav.appendChild(createElement('li', { class: 'sidebar-nav__group' }, 'التقارير والإحصاءات'));
  ['kpis', 'stats', 'peak', 'reports', 'troubled'].forEach(key => {
    nav.appendChild(createElement('li', {
      class: 'sidebar-nav__item',
      dataset: { page: key },
      onClick: () => navigateTo(key)
    }, PAGES[key].label));
  });

  // مجموعة البيانات المرجعية
  nav.appendChild(createElement('li', { class: 'sidebar-nav__group' }, 'البيانات المرجعية'));
  ['master', 'radar'].forEach(key => {
    nav.appendChild(createElement('li', {
      class: 'sidebar-nav__item',
      dataset: { page: key },
      onClick: () => navigateTo(key)
    }, PAGES[key].label));
  });

  // مجموعة الإدارة
  nav.appendChild(createElement('li', { class: 'sidebar-nav__group' }, 'الإدارة'));
  ['import', 'settings'].forEach(key => {
    nav.appendChild(createElement('li', {
      class: 'sidebar-nav__item',
      dataset: { page: key },
      onClick: () => navigateTo(key)
    }, PAGES[key].label));
  });

  clearElement(sidebar);
  sidebar.appendChild(nav);
}

/**
 * يُرجع الصفحة الحالية
 */
export function getCurrentPage() {
  return currentPage;
}
