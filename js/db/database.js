/**
 * تهيئة قاعدة البيانات
 * --------------------------------------------------------------
 * هذا الملف ينشئ نسخة واحدة فقط من قاعدة البيانات
 * ويُصدرها للاستخدام في باقي أجزاء النظام
 * لا منطق أعمال هنا - فقط إعداد وفتح القاعدة
 * --------------------------------------------------------------
 * مرجع: https://dexie.org/docs/Tutorial/Hello-World
 * --------------------------------------------------------------
 */

import { DB_NAME, DB_VERSION } from '../core/constants.js';
import { SCHEMA_V1 } from './schema.js';

// إنشاء نسخة Dexie (يفترض تحميل dexie.min.js قبل هذا الملف في index.html)
const Dexie = window.Dexie;

if (!Dexie) {
  throw new Error('مكتبة Dexie غير محملة. تأكد من تحميل lib/dexie.min.js قبل هذا الملف');
}

// إنشاء قاعدة البيانات وتعريف الإصدار
export const db = new Dexie(DB_NAME);

// تطبيق schema الإصدار 1
db.version(DB_VERSION).stores(SCHEMA_V1);

/**
 * فتح القاعدة وإرجاع نسختها جاهزة للاستخدام
 * تُستدعى مرة واحدة عند بدء التطبيق
 */
export async function openDatabase() {
  try {
    await db.open();
    return db;
  } catch (error) {
    throw new Error('فشل فتح قاعدة البيانات: ' + error.message);
  }
}

/**
 * إغلاق القاعدة (تُستخدم نادراً، في حالات الاختبار أو الإعادة)
 */
export function closeDatabase() {
  db.close();
}

/**
 * حذف القاعدة كاملة من المتصفح
 * تحذير: يحذف كل البيانات. تأكد قبل الاستدعاء
 */
export async function dropDatabase() {
  closeDatabase();
  await Dexie.delete(DB_NAME);
}

/**
 * طلب التخزين الدائم من المتصفح
 * يمنع المتصفح من حذف البيانات تحت ضغط المساحة
 * مرجع: https://web.dev/storage-for-the-web/
 */
export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    return { supported: false, persisted: false };
  }
  const persisted = await navigator.storage.persist();
  return { supported: true, persisted };
}

/**
 * يُرجع معلومات حصة التخزين الحالية
 */
export async function getStorageEstimate() {
  if (!navigator.storage?.estimate) {
    return null;
  }
  const est = await navigator.storage.estimate();
  return {
    usage: est.usage || 0,
    quota: est.quota || 0,
    percent: est.quota ? (est.usage / est.quota) * 100 : 0
  };
}
