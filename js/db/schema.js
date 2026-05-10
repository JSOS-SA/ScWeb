/**
 * تعريف بنية قاعدة البيانات
 * --------------------------------------------------------------
 * كل سطر هنا = جدول واحد في IndexedDB
 * صيغة Dexie للفهرسة:
 *   '++id'                  مفتاح أساسي تلقائي التصاعد
 *   '&field'                فهرس فريد (لا يتكرر)
 *   'field'                 فهرس عادي
 *   '[fieldA+fieldB]'       فهرس مركب
 *   '*field'                فهرس متعدد القيم (للمصفوفات)
 * --------------------------------------------------------------
 * مرجع: https://dexie.org/docs/Version/Version.stores()
 * --------------------------------------------------------------
 */

import { TABLES } from './constants.js';

// تعريف بنية كل جدول مع فهارسه
export const SCHEMA_V1 = Object.freeze({
  // إعدادات النظام (مفتاح نصي)
  [TABLES.META]:
    '&key',

  // القوائم المرجعية (الجنسيات، شركات الطيران، إلخ)
  [TABLES.LISTS]:
    '++id, listType, [listType+value], [listType+order], active',

  // السجل الرئيسي للحافلات (الأهم)
  [TABLES.RECORDS]:
    '++id, busNo, flightNo, date, refDay, busCheckIn, statusNow, ' +
    'responsibleShift, arrivalShift, hasReport, reportTime, ' +
    '[date+flightNo], [refDay+responsibleShift], [date+busNo+busCheckIn]',

  // ملخص توزيع النوبات اليومي
  [TABLES.SHIFT_SUMMARY]:
    '++id, &date, [date+shift]',

  // المحاضر المحررة
  [TABLES.REPORTS]:
    '++id, &reportNo, date, shift, recordId, type, createdAt',

  // تفاصيل الرحلات (حافلات لكل رحلة)
  [TABLES.FLIGHTS_DETAIL]:
    '++id, flightNo, date, [date+flightNo]',

  // اللوحة اللحظية للرحلات النشطة
  [TABLES.FLIGHTS_BOARD]:
    '++id, &flightNo, status, lastUpdate',

  // ساعات الذروة
  [TABLES.PEAK_HOURS]:
    '++id, date, shift, hour, [date+shift+hour]',

  // إحصاءات الرحلات (الترتيبات)
  [TABLES.FLIGHTS_STATS]:
    '++id, date, shift, flightNo, [date+shift]',

  // تسليم النوبات
  [TABLES.HANDOVER]:
    '++id, handoverDate, fromShift, toShift, [handoverDate+toShift]',

  // مؤشرات الأداء اليومية
  [TABLES.DAILY_KPIS]:
    '++id, &date, [date+kpiName]',

  // الرحلات المتعثرة
  [TABLES.TROUBLED]:
    '++id, flightNo, date, status, [date+status]',

  // الرحلات الدائمة (FLIGHTS MASTER)
  [TABLES.MASTER]:
    '++id, &flightNo, airline, terminal, *daysOfWeek',

  // بيانات Flight Radar 24
  [TABLES.RADAR]:
    '++id, flightNo, scheduledTime, importDate, [importDate+flightNo]',

  // سجل التغييرات للمزامنة المستقبلية
  [TABLES.CHANGE_LOG]:
    '++id, ts, table, recordId, action, [table+ts]',

  // المرفقات (التوقيعات، الشعارات، صور إضافية)
  [TABLES.ATTACHMENTS]:
    '++id, name, type, refId'
});

/**
 * يُرجع الحقول المفهرسة لجدول معين كمصفوفة
 * مفيد للأكواد التي تحتاج معرفة الفهارس برمجياً
 */
export function getIndexedFields(tableName) {
  const schema = SCHEMA_V1[tableName];
  if (!schema) return [];
  return schema
    .split(',')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('['))
    .map(s => s.replace(/^[&*+]+/, ''));
}

/**
 * يُرجع الفهارس المركبة لجدول معين
 */
export function getCompoundIndexes(tableName) {
  const schema = SCHEMA_V1[tableName];
  if (!schema) return [];
  const matches = schema.match(/\[[^\]]+\]/g) || [];
  return matches.map(m => m.slice(1, -1).split('+'));
}
