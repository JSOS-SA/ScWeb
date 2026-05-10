/**
 * شاشة الصفحة الرئيسية
 * --------------------------------------------------------------
 * تعرض:
 *   - عنوان النظام (مطابق لورقة الرئيسية)
 *   - بطاقات إحصاءات سريعة (حافلات في الفرز، إجمالي اليوم)
 *   - أزرار الانتقال للشاشات الأخرى
 * --------------------------------------------------------------
 */

import { APP_TITLE, APP_OWNER, APP_COMPANY } from '../core/constants.js';
import { countActiveBuses } from '../services/records.js';
import { getDailyKPIs } from '../services/stats.js';
import { todayAsDateStr } from '../utils/time.js';
import { formatNumber, formatBusCount, formatPaxCount } from '../utils/format.js';
import { createElement, clearElement } from '../utils/dom.js';

/**
 * يبني بطاقة إحصاء واحدة
 */
function buildStatCard({ label, value, hint, variant = '' }) {
  return createElement('div', { class: `stat-card ${variant ? 'stat-card--' + variant : ''}` },
    createElement('div', { class: 'stat-card__label' }, label),
    createElement('div', { class: 'stat-card__value' }, value),
    hint ? createElement('div', { class: 'stat-card__hint' }, hint) : null
  );
}

/**
 * يبني صف بطاقات الإحصاءات
 */
async function buildStatsRow() {
  const today = todayAsDateStr();
  const [activeCount, kpis] = await Promise.all([
    countActiveBuses(),
    getDailyKPIs(today)
  ]);

  const grid = createElement('div', { class: 'grid grid--cols-4' });

  grid.appendChild(buildStatCard({
    label: 'حافلات في الفرز الآن',
    value: formatNumber(activeCount),
    hint: formatBusCount(activeCount),
    variant: activeCount > 5 ? 'warning' : ''
  }));

  grid.appendChild(buildStatCard({
    label: 'إجمالي حافلات اليوم',
    value: formatNumber(kpis.dayTotal.buses),
    hint: formatBusCount(kpis.dayTotal.buses)
  }));

  grid.appendChild(buildStatCard({
    label: 'إجمالي الركاب اليوم',
    value: formatNumber(kpis.dayTotal.pax),
    hint: formatPaxCount(kpis.dayTotal.pax)
  }));

  grid.appendChild(buildStatCard({
    label: 'المحاضر اليوم',
    value: formatNumber(kpis.reportsCount),
    hint: kpis.reportsCount > 0 ? `بنسبة ${Math.round(kpis.reportsRate * 100)}٪` : 'لا محاضر اليوم'
  }));

  return grid;
}

/**
 * يبني بطاقات النوبات الثلاث
 */
async function buildShiftsRow() {
  const today = todayAsDateStr();
  const kpis = await getDailyKPIs(today);
  const grid = createElement('div', { class: 'grid grid--cols-3' });

  for (const stats of kpis.shifts) {
    const card = createElement('div', { class: 'card' },
      createElement('div', { class: 'card__header' },
        createElement('h3', { class: 'card__title' }, `النوبة ${stats.shift}`)
      ),
      createElement('div', { class: 'grid grid--cols-2 gap-sm' },
        buildStatCard({ label: 'الحافلات', value: formatNumber(stats.total.buses) }),
        buildStatCard({ label: 'الركاب', value: formatNumber(stats.total.pax) }),
        buildStatCard({ label: 'المحاضر', value: formatNumber(stats.reports) }),
        buildStatCard({ label: 'المتعثرة', value: formatNumber(stats.troubled), variant: stats.troubled > 0 ? 'alert' : '' })
      )
    );
    grid.appendChild(card);
  }

  return grid;
}

/**
 * يبني ترويسة الصفحة الرئيسية
 */
function buildPageHeader() {
  return createElement('div', { class: 'page-header' },
    createElement('h1', { class: 'page-header__title' }, APP_TITLE),
    createElement('p', { class: 'page-header__subtitle' }, `${APP_OWNER} · ${APP_COMPANY}`)
  );
}

/**
 * يبني صف أزرار الانتقال
 */
function buildQuickActions(onNavigate) {
  const actions = [
    { page: 'records', label: 'السجل الرئيسي', variant: 'primary' },
    { page: 'board',   label: 'لوحة الرحلات اللحظية', variant: 'accent' },
    { page: 'kpis',    label: 'مؤشرات الأداء', variant: 'outline' },
    { page: 'reports', label: 'المحاضر', variant: 'outline' },
    { page: 'import',  label: 'استيراد ملف إكسل', variant: 'ghost' }
  ];

  const row = createElement('div', { class: 'flex gap-md', style: { flexWrap: 'wrap' } });
  for (const a of actions) {
    row.appendChild(createElement('button', {
      class: `btn btn--${a.variant} btn--lg`,
      onClick: () => onNavigate(a.page)
    }, a.label));
  }
  return row;
}

/**
 * الواجهة الرئيسية: تعرض الصفحة كاملة
 */
export async function renderHomePage(container, { onNavigate }) {
  clearElement(container);

  container.appendChild(buildPageHeader());

  const loadingEl = createElement('div', { class: 'loading' }, 'جارٍ تحميل الإحصاءات...');
  container.appendChild(loadingEl);

  try {
    const [statsRow, shiftsRow] = await Promise.all([
      buildStatsRow(),
      buildShiftsRow()
    ]);

    container.removeChild(loadingEl);

    container.appendChild(createElement('div', { class: 'card', style: { marginBottom: '24px' } },
      createElement('h2', { class: 'card__title' }, 'إجراءات سريعة'),
      buildQuickActions(onNavigate)
    ));

    container.appendChild(createElement('h2', { style: { margin: '24px 0 16px' } }, 'إحصاءات اليوم'));
    container.appendChild(statsRow);

    container.appendChild(createElement('h2', { style: { margin: '32px 0 16px' } }, 'تفصيل النوبات'));
    container.appendChild(shiftsRow);
  } catch (error) {
    clearElement(container);
    container.appendChild(buildPageHeader());
    container.appendChild(createElement('div', { class: 'alert alert--alert' },
      'خطأ في تحميل البيانات: ' + error.message
    ));
  }
}
