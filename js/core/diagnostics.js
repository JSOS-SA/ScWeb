/**
 * منطق التشخيصات والمراقبات
 * --------------------------------------------------------------
 * يستبدل أعمدة التشخيص المحسوبة في ورقة Record:
 *   - Arrival Timing Classification 1, 2, 3
 *   - Bus Arrival & OPS Delay
 *   - Operations Coordination Diagnosis
 *   - حالة الرحلة
 *   - Completeness, Coord Status, Yard Departure Alert
 * كل الدوال نقية
 * --------------------------------------------------------------
 */

import { diffMinutes } from '../utils/time.js';

// قيم الإخراج الثابتة للتشخيصات (نصوص ثابتة لا تتغير)
export const DIAG_VALUES = Object.freeze({
  EARLY:        'تفويج مبكر',
  LATE:         'تفويج متأخر',
  ON_TIME:      'في الموعد',
  SHARED:       'تفويج مشترك',
  WRONG:        'تفويج خاطئ',
  WITHOUT:      'بدون محضر',
  NORMAL:       'طبيعي',
  DELAY_COORD:  'تأخر تنسيق',
  DELAY_DEP:    'تأخر مغادرة الفرز',
  COMPLETE:     'مكتمل',
  INCOMPLETE:   'ناقص',
  WARNING:      'تحذير',
  ALERT:        'تنبيه عاجل',
  TROUBLED:     'متعثرة',
  FINISHED:     'منتهية',
  PARTIAL:      'جزئية'
});

/**
 * التشخيص الأول: مبكر/متأخر بناءً على Time To Departure
 * EARLY إذا تجاوز ٤ ساعات على الإقلاع
 * LATE إذا أقل من ٤٥ دقيقة على الإقلاع
 */
export function classifyArrivalTiming1(timeToDeparture) {
  if (typeof timeToDeparture !== 'number' || isNaN(timeToDeparture)) {
    return DIAG_VALUES.WITHOUT;
  }
  if (timeToDeparture > 240) return DIAG_VALUES.EARLY;  // أكثر من ٤ ساعات
  if (timeToDeparture < 45)  return DIAG_VALUES.LATE;   // أقل من ٤٥ دقيقة
  return DIAG_VALUES.ON_TIME;
}

/**
 * التشخيص الثاني: مبكر/متأخر مع توضيح المحضر
 */
export function classifyArrivalTiming2(timing1, hasReport) {
  if (timing1 === DIAG_VALUES.EARLY) {
    return hasReport ? DIAG_VALUES.EARLY : DIAG_VALUES.EARLY + ' ' + DIAG_VALUES.WITHOUT;
  }
  if (timing1 === DIAG_VALUES.LATE) {
    return hasReport ? DIAG_VALUES.LATE : DIAG_VALUES.LATE + ' ' + DIAG_VALUES.WITHOUT;
  }
  return DIAG_VALUES.ON_TIME;
}

/**
 * التشخيص الثالث: خاطئ/مشترك
 */
export function classifyArrivalTiming3(record) {
  if (!record) return '';

  // مشترك: يوجد رحلة أخرى
  if (record.otherFlightNo && record.otherTerminal) {
    return DIAG_VALUES.SHARED;
  }

  // خاطئ: تناقض في البيانات (مثلاً جنسية لا تطابق نوع التأشيرة المتوقع)
  // هذا يحتاج قواعد تفصيلية - نتركها بسيطة الآن
  if (record.action && record.action.includes('عدم السماح')) {
    return DIAG_VALUES.WRONG;
  }

  return '';
}

/**
 * تشخيص تأخر العمليات: قارن الفارق بين الوصول والتنسيق مع العتبة
 */
export function diagnoseBusArrivalOpsDelay(busCheckIn, coordTime, maxCoordLag) {
  const lag = diffMinutes(busCheckIn, coordTime);
  if (lag === null) return '';
  if (lag <= maxCoordLag) return DIAG_VALUES.NORMAL;
  return DIAG_VALUES.DELAY_COORD;
}

/**
 * تشخيص تشغيل العمليات المركّب
 * يجمع: زمن التنسيق + زمن الاستجابة + زمن المغادرة
 */
export function diagnoseOperations(record, thresholds) {
  if (!record || !thresholds) return '';

  const coordLag = diffMinutes(record.busCheckIn, record.coordTime);
  const respLag = diffMinutes(record.coordTime, record.approvalTime);
  const yardLag = diffMinutes(record.approvalTime, record.busCheckOut);

  const parts = [];
  if (coordLag !== null && coordLag > thresholds.MaxCoordLag) {
    parts.push('تنسيق متأخر');
  }
  if (yardLag !== null && yardLag > thresholds.MaxYardAfterApproval) {
    parts.push('مغادرة متأخرة');
  }

  return parts.length ? parts.join(' / ') : DIAG_VALUES.NORMAL;
}

/**
 * مراقبة اكتمال التسجيل: تتحقق من ملء الحقول الإلزامية
 */
export function checkCompleteness(record) {
  if (!record) return DIAG_VALUES.INCOMPLETE;

  const required = ['busNo', 'flightNo', 'pax', 'busCheckIn', 'visa', 'paxStatus'];
  const missing = required.filter(field => !record[field]);

  return missing.length === 0 ? DIAG_VALUES.COMPLETE : DIAG_VALUES.INCOMPLETE;
}

/**
 * مراقبة حالة التنسيق: تحذير عند الاقتراب من العتبة
 */
export function checkCoordStatus(busCheckIn, coordTime, maxCoordLag, currentTime) {
  // لو التنسيق تم بالفعل، نقيس الفارق الفعلي
  if (coordTime) {
    const lag = diffMinutes(busCheckIn, coordTime);
    if (lag === null) return '';
    if (lag > maxCoordLag) return DIAG_VALUES.ALERT;
    return DIAG_VALUES.NORMAL;
  }

  // لو التنسيق لم يتم بعد، نقيس الفارق مع الوقت الحالي
  if (currentTime && busCheckIn) {
    const elapsed = diffMinutes(busCheckIn, currentTime);
    if (elapsed === null) return '';
    if (elapsed > maxCoordLag) return DIAG_VALUES.ALERT;
    if (elapsed > maxCoordLag - 1) return DIAG_VALUES.WARNING;
  }

  return DIAG_VALUES.NORMAL;
}

/**
 * مراقبة مغادرة الفرز: تنبيه عند تجاوز ٥ دقائق بعد الموافقة
 */
export function checkYardDeparture(approvalTime, busCheckOut, maxYard, currentTime) {
  if (busCheckOut) {
    const yardLag = diffMinutes(approvalTime, busCheckOut);
    if (yardLag === null) return '';
    if (yardLag > maxYard) return DIAG_VALUES.ALERT;
    return DIAG_VALUES.NORMAL;
  }

  if (currentTime && approvalTime) {
    const elapsed = diffMinutes(approvalTime, currentTime);
    if (elapsed === null) return '';
    if (elapsed > maxYard) return DIAG_VALUES.ALERT;
    if (elapsed > maxYard - 1) return DIAG_VALUES.WARNING;
  }

  return DIAG_VALUES.NORMAL;
}

/**
 * يحدد ما إذا كان السجل يستحق محضراً
 * المعيار: تفويج مبكر أو متأخر أو خاطئ أو مشترك
 */
export function shouldHaveReport(record) {
  if (!record) return false;
  const triggers = [
    record.arrTimingClass2,
    record.arrTimingClass3
  ].filter(Boolean);

  return triggers.some(t =>
    t.includes(DIAG_VALUES.EARLY) ||
    t.includes(DIAG_VALUES.LATE) ||
    t.includes(DIAG_VALUES.WRONG) ||
    t.includes(DIAG_VALUES.SHARED)
  );
}
