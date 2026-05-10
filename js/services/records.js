/**
 * خدمة إدارة السجلات (Records Service)
 * --------------------------------------------------------------
 * تستخدم قاعدة البيانات + الدوال النقية (نوبات + تشخيصات)
 * كل عملية كتابة تُحدث الحقول المحسوبة تلقائياً
 * --------------------------------------------------------------
 */

import { db } from '../db/database.js';
import { TABLES, META_KEYS } from '../core/constants.js';
import { getShift, getReferenceDay, getResponsibleShift, isCrossShift } from '../core/shifts.js';
import {
  classifyArrivalTiming1,
  classifyArrivalTiming2,
  classifyArrivalTiming3,
  diagnoseBusArrivalOpsDelay,
  diagnoseOperations,
  checkCompleteness,
  checkCoordStatus,
  checkYardDeparture,
  shouldHaveReport
} from '../core/diagnostics.js';
import { diffMinutes, nowAsTimeStr } from '../utils/time.js';
import { validateRecord } from '../core/validators.js';

/**
 * يجلب العتبات الحالية من جدول meta
 */
async function getThresholds() {
  const row = await db[TABLES.META].get(META_KEYS.THRESHOLDS);
  return row?.value || { MaxCoordLag: 4, MaxYardAfterApproval: 5, MaxCurbAfterApproval: 7 };
}

/**
 * يحسب كل الحقول المشتقة لسجل واحد
 * يُستدعى قبل كل عملية حفظ
 */
export async function computeDerivedFields(record) {
  if (!record) return record;
  const thresholds = await getThresholds();

  // النوبات
  const arrShift = getShift(record.busCheckIn);
  const depShift = getShift(record.busCheckOut);
  const appShift = getShift(record.approvalTime);
  const refDay = getReferenceDay(record.date, record.busCheckIn);
  const crossShift = isCrossShift(record.busCheckIn, record.approvalTime);
  const respShift = getResponsibleShift({ ...record, arrivalShift: arrShift });

  // المدد الزمنية
  const coordDuration = diffMinutes(record.busCheckIn, record.coordTime);
  const responseTime = diffMinutes(record.coordTime, record.approvalTime);
  const waitBefore = diffMinutes(record.busCheckIn, record.approvalTime);
  const waitAfter = diffMinutes(record.approvalTime, record.busCheckOut);

  // التشخيصات
  const timing1 = classifyArrivalTiming1(record.timeToDep);
  const hasReport = record.reportTime ? true : false;
  const timing2 = classifyArrivalTiming2(timing1, hasReport);
  const timing3 = classifyArrivalTiming3(record);
  const busOpsDelay = diagnoseBusArrivalOpsDelay(
    record.busCheckIn, record.coordTime, thresholds.MaxCoordLag
  );
  const opsDiagnosis = diagnoseOperations(record, thresholds);

  // المراقبات
  const now = nowAsTimeStr();
  const completeness = checkCompleteness(record);
  const coordStatus = checkCoordStatus(
    record.busCheckIn, record.coordTime, thresholds.MaxCoordLag, now
  );
  const yardDepAlert = checkYardDeparture(
    record.approvalTime, record.busCheckOut, thresholds.MaxYardAfterApproval, now
  );

  // اقتراح المحضر
  const needsReport = shouldHaveReport({
    ...record, arrTimingClass2: timing2, arrTimingClass3: timing3
  });

  return {
    ...record,
    arrivalShift: arrShift,
    departureShift: depShift,
    approvalShift: appShift,
    responsibleShift: respShift,
    refDay,
    crossShift: crossShift ? 'نعم' : 'لا',
    coordDuration,
    responseTime,
    waitBefore,
    waitAfter,
    arrTimingClass1: timing1,
    arrTimingClass2: timing2,
    arrTimingClass3: timing3,
    busArrOpsDelay: busOpsDelay,
    opsDiagnosis,
    completeness,
    coordStatus,
    yardDepAlert,
    hasReport: needsReport ? 'نعم' : 'لا',
    pullToReport: needsReport ? 'نعم' : 'لا'
  };
}

/**
 * يضيف سجلاً جديداً
 */
export async function addRecord(record) {
  const validation = validateRecord(record);
  if (!validation.valid) {
    throw new Error('بيانات السجل غير صحيحة: ' + validation.errors.join(' ، '));
  }
  const enriched = await computeDerivedFields(record);
  return await db[TABLES.RECORDS].add(enriched);
}

/**
 * يحدث سجلاً موجوداً
 */
export async function updateRecord(id, changes) {
  const existing = await db[TABLES.RECORDS].get(id);
  if (!existing) throw new Error(`السجل رقم ${id} غير موجود`);

  const merged = { ...existing, ...changes };
  const validation = validateRecord(merged);
  if (!validation.valid) {
    throw new Error('بيانات السجل غير صحيحة: ' + validation.errors.join(' ، '));
  }
  const enriched = await computeDerivedFields(merged);
  return await db[TABLES.RECORDS].put(enriched);
}

/**
 * يحذف سجلاً
 */
export async function deleteRecord(id) {
  return await db[TABLES.RECORDS].delete(id);
}

/**
 * يجلب سجلاً واحداً
 */
export async function getRecord(id) {
  return await db[TABLES.RECORDS].get(id);
}

/**
 * يجلب كل السجلات (مرتبة بوقت الوصول)
 */
export async function getAllRecords() {
  return await db[TABLES.RECORDS].orderBy('busCheckIn').toArray();
}

/**
 * يجلب سجلات يوم معين
 */
export async function getRecordsByDay(refDay) {
  return await db[TABLES.RECORDS].where('refDay').equals(refDay).toArray();
}

/**
 * يجلب سجلات نوبة معينة في يوم معين
 */
export async function getRecordsByShift(refDay, shift) {
  return await db[TABLES.RECORDS]
    .where('[refDay+responsibleShift]')
    .equals([refDay, shift])
    .toArray();
}

/**
 * يجلب الحافلات التي لا تزال في الفرز الآن
 */
export async function getActiveBuses() {
  const activeStatuses = [
    'في الفرز',
    'تم التنسيق وبانتظار الموافقة',
    'تمت الموافقة وبانتظار مغادرة الفرز'
  ];
  return await db[TABLES.RECORDS]
    .where('statusNow')
    .anyOf(activeStatuses)
    .toArray();
}

/**
 * يحسب عدد الحافلات في الفرز حالياً
 */
export async function countActiveBuses() {
  const buses = await getActiveBuses();
  return buses.length;
}
