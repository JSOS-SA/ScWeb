/**
 * نقطة الدخول الرئيسية
 * --------------------------------------------------------------
 * يُنفذ بالترتيب:
 *   ١. فتح قاعدة البيانات
 *   ٢. التعبئة الأولية (إن لزم)
 *   ٣. طلب التخزين الدائم
 *   ٤. بناء الشريط الجانبي
 *   ٥. عرض الصفحة الرئيسية
 * --------------------------------------------------------------
 */

import { openDatabase, requestPersistentStorage } from './db/database.js';
import { runInitialSeed } from './db/seed.js';
import { buildSidebar, navigateTo } from './ui/router.js';
import { $, showToast } from './utils/dom.js';
import { APP_TITLE } from './core/constants.js';

/**
 * يعرض رسالة خطأ تشغيل قاتل
 */
function showFatalError(message) {
  const main = $('app-main') || document.body;
  main.innerHTML = `
    <div class="alert alert--alert" style="margin: 32px;">
      <h2>تعذر تشغيل النظام</h2>
      <p>${message}</p>
      <p>يُرجى تحديث الصفحة، أو حذف بيانات الموقع من إعدادات المتصفح.</p>
    </div>
  `;
}

/**
 * يبني ترويسة التطبيق
 */
function setupHeader() {
  const header = $('app-header');
  if (!header) return;

  header.innerHTML = `
    <h1 class="app-header__title">برنامج حافلات صالة الحج</h1>
    <span class="app-header__subtitle">بوابة ١٤ · شركة مطارات جدة</span>
    <div class="app-header__spacer"></div>
    <div class="app-header__actions">
      <button class="btn btn--ghost btn--sm" id="btn-reload" style="color: white;">تحديث</button>
    </div>
  `;

  const reloadBtn = $('btn-reload');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', () => window.location.reload());
  }
}

/**
 * يفحص أن المكتبات المطلوبة محملة
 */
function checkDependencies() {
  const missing = [];
  if (!window.Dexie) missing.push('Dexie');
  if (!window.XLSX) missing.push('XLSX (SheetJS)');
  if (missing.length) {
    throw new Error(`المكتبات التالية غير محملة: ${missing.join(', ')}. ` +
                    `تحقق من مجلد lib/ ومن ترتيب الـ scripts في index.html`);
  }
}

/**
 * التشغيل الرئيسي
 */
async function start() {
  console.log('بدء التشغيل:', APP_TITLE);

  try {
    checkDependencies();

    // ١. فتح القاعدة
    console.log('فتح قاعدة البيانات...');
    await openDatabase();

    // ٢. التعبئة الأولية
    console.log('التحقق من التعبئة الأولية...');
    const seedResult = await runInitialSeed();
    if (seedResult.seeded) {
      console.log('تم تعبئة البيانات الأولية');
      showToast('تم تجهيز قاعدة البيانات لأول مرة', 'success');
    }

    // ٣. طلب التخزين الدائم
    const storage = await requestPersistentStorage();
    if (storage.supported && !storage.persisted) {
      console.log('لم يُمنح التخزين الدائم. البيانات قد تُحذف تحت ضغط المساحة');
    }

    // ٤. بناء الواجهة
    setupHeader();
    buildSidebar();

    // ٥. عرض الصفحة الرئيسية
    await navigateTo('home');

    console.log('تم تشغيل النظام بنجاح');
  } catch (error) {
    console.error('خطأ في التشغيل:', error);
    showFatalError(error.message);
  }
}

// انتظر تحميل DOM ثم ابدأ
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
