/**
 * تعبئة البيانات الأولية
 * --------------------------------------------------------------
 * يُستدعى مرة واحدة عند أول تشغيل
 * يملأ:
 *   - جدول meta بالعتبات الافتراضية
 *   - جدول lists بالقوائم المرجعية الـ 24
 * --------------------------------------------------------------
 */

import { db } from './database.js';
import { TABLES, META_KEYS, DEFAULT_THRESHOLDS } from '../core/constants.js';
import { buildSeedRows } from '../core/lists.js';

/**
 * يفحص هل القاعدة فارغة (لم تُملأ من قبل)
 */
export async function isDatabaseEmpty() {
  const metaCount = await db[TABLES.META].count();
  return metaCount === 0;
}

/**
 * يملأ جدول meta بالإعدادات الافتراضية
 */
async function seedMeta() {
  await db[TABLES.META].bulkPut([
    { key: META_KEYS.THRESHOLDS,    value: DEFAULT_THRESHOLDS },
    { key: META_KEYS.LAST_IMPORT,   value: null },
    { key: META_KEYS.LAST_HANDOVER, value: null },
    { key: META_KEYS.CURRENT_SHIFT, value: null },
    { key: META_KEYS.CURRENT_DAY,   value: null }
  ]);
}

/**
 * يملأ جدول lists بالقوائم المرجعية
 */
async function seedLists() {
  const rows = buildSeedRows();
  await db[TABLES.LISTS].bulkAdd(rows);
}

/**
 * يُجري التعبئة الأولية الكاملة
 * يستخدم معاملة واحدة لكل العمليات (atomic)
 */
export async function runInitialSeed() {
  const empty = await isDatabaseEmpty();
  if (!empty) {
    return { seeded: false, reason: 'القاعدة معبأة سابقاً' };
  }

  await db.transaction('rw', [db[TABLES.META], db[TABLES.LISTS]], async () => {
    await seedMeta();
    await seedLists();
  });

  return { seeded: true };
}

/**
 * يُعيد تعيين القاعدة إلى الحالة الافتراضية
 * يحذف كل شيء ثم يُعيد التعبئة
 * تحذير: يحذف كل بيانات المستخدم
 */
export async function resetToDefaults() {
  const tableNames = Object.values(TABLES);
  await db.transaction('rw', tableNames.map(t => db[t]), async () => {
    for (const t of tableNames) {
      await db[t].clear();
    }
  });
  await runInitialSeed();
}
