/**
 * شاشة استيراد ملف الإكسل الأصلي
 * --------------------------------------------------------------
 * تتيح للمستخدم رفع ملف 2026_05_05_B.xlsx ومثيلاته
 * وتعرض شريط التقدم وتقرير النتائج
 * --------------------------------------------------------------
 */

import { importExcelFile } from '../services/import-xlsx.js';
import { createElement, clearElement, showToast } from '../utils/dom.js';

/**
 * يبني عنصر رفع الملف
 */
function buildFileInput(onFileSelected) {
  const input = createElement('input', {
    type: 'file',
    accept: '.xlsx,.xls',
    style: { display: 'none' },
    id: 'xlsx-file-input',
    onChange: (e) => {
      const file = e.target.files[0];
      if (file) onFileSelected(file);
    }
  });

  const button = createElement('button', {
    class: 'btn btn--primary btn--lg',
    onClick: () => input.click()
  }, 'اختر ملف إكسل للاستيراد');

  return createElement('div', { class: 'flex flex-col gap-md items-center' },
    input,
    button,
    createElement('p', { class: 'card__subtitle' },
      'الصيغ المدعومة: xlsx, xls. الحد الأقصى ٢٠ ميغابايت')
  );
}

/**
 * يبني شريط التقدم
 */
function buildProgressBar() {
  const bar = createElement('div', {
    style: {
      height: '8px',
      background: 'var(--bg-disabled)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden',
      marginTop: 'var(--space-lg)'
    }
  });
  const fill = createElement('div', {
    style: {
      height: '100%',
      width: '0%',
      background: 'var(--color-primary)',
      transition: 'width 250ms'
    }
  });
  bar.appendChild(fill);

  const message = createElement('div', {
    style: {
      marginTop: 'var(--space-sm)',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--text-secondary)',
      textAlign: 'center'
    }
  }, 'جارٍ التحضير...');

  const wrapper = createElement('div', { class: 'hidden', id: 'progress-wrapper' },
    bar, message
  );

  return {
    element: wrapper,
    show: () => wrapper.classList.remove('hidden'),
    hide: () => wrapper.classList.add('hidden'),
    update: (percent, text) => {
      fill.style.width = percent + '%';
      message.textContent = text;
    }
  };
}

/**
 * يبني تقرير النتائج
 */
function buildReport(report) {
  const items = [];

  if (report.sheets.records) {
    items.push(`تم استيراد ${report.sheets.records.imported} سجل من ورقة Record`);
  }
  if (report.sheets.master) {
    items.push(`تم استيراد ${report.sheets.master.imported} رحلة من FLIGHTS MASTER SHEET`);
  }
  if (report.sheets.radar) {
    items.push(`تم استيراد ${report.sheets.radar.imported} صف من Flight Radar 24`);
  }
  if (report.sheets.lists) {
    items.push('تم تخطي ورقة Lists (يستخدم الافتراضي)');
  }

  const list = createElement('ul', { style: { margin: 0, padding: '0 20px' } });
  for (const item of items) {
    list.appendChild(createElement('li', {}, item));
  }

  return createElement('div', { class: 'alert alert--success' },
    createElement('strong', {}, `الإجمالي: ${report.total} سجل تم استيراده`),
    list
  );
}

/**
 * الواجهة الرئيسية
 */
export function renderImportPage(container) {
  clearElement(container);

  // ترويسة
  container.appendChild(createElement('div', { class: 'page-header' },
    createElement('h1', { class: 'page-header__title' }, 'استيراد ملف الإكسل'),
    createElement('p', { class: 'page-header__subtitle' },
      'يحول ملف الإكسل الأصلي إلى قاعدة البيانات المحلية')
  ));

  // تنبيه إرشادي
  container.appendChild(createElement('div', { class: 'alert alert--info' },
    createElement('strong', {}, 'ملاحظة: '),
    'الاستيراد يقرأ الأوراق التالية: Record (السجلات)، FLIGHTS MASTER SHEET (الرحلات الدائمة)، ' +
    'Flight Radar 24 (البيانات اللحظية). ورقة Lists تُتخطى لأن القوائم الافتراضية معبأة مسبقاً.'
  ));

  const progress = buildProgressBar();
  const resultArea = createElement('div', { id: 'result-area' });

  // الكارد الرئيسي
  const card = createElement('div', { class: 'card' },
    createElement('h2', { class: 'card__title' }, 'اختر الملف'),
    buildFileInput(async (file) => {
      progress.show();
      progress.update(10, 'جارٍ قراءة الملف...');
      clearElement(resultArea);

      try {
        const report = await importExcelFile(file, (status) => {
          const stageMap = {
            reading: 20,
            records: 50,
            master: 70,
            radar: 85,
            done: 100
          };
          progress.update(stageMap[status.stage] || 50, status.message);
        });

        progress.update(100, 'اكتمل الاستيراد');
        setTimeout(() => progress.hide(), 1500);

        resultArea.appendChild(buildReport(report));
        showToast(`تم استيراد ${report.total} سجل بنجاح`, 'success');
      } catch (error) {
        progress.hide();
        resultArea.appendChild(createElement('div', { class: 'alert alert--alert' },
          'خطأ في الاستيراد: ' + error.message
        ));
        showToast('فشل الاستيراد', 'alert');
      }
    }),
    progress.element
  );

  container.appendChild(card);
  container.appendChild(resultArea);
}
