/**
 * منطق النوبات الثلاث (A و B و C)
 * --------------------------------------------------------------
 * كل دوال هذا الملف نقية (Pure Functions)
 * نطاقات النوبات:
 *   A: 06:00 → 14:00
 *   B: 14:00 → 22:00
 *   C: 22:00 → 06:00 (تعبر منتصف الليل)
 * --------------------------------------------------------------
 */

import { SHIFT_RANGES } from './constants.js';
import { parseTimeToMinutes, addDays } from '../utils/time.js';

/**
 * يحدد النوبة بناءً على وقت HH:MM
 * يُرجع 'A' أو 'B' أو 'C' أو null لو الوقت غير صالح
 */
export function getShift(timeStr) {
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) return null;

  const hour = minutes / 60;

  if (hour >= SHIFT_RANGES.A.start && hour < SHIFT_RANGES.A.end) return 'A';
  if (hour >= SHIFT_RANGES.B.start && hour < SHIFT_RANGES.B.end) return 'B';
  return 'C'; // باقي الساعات (22:00 → 06:00)
}

/**
 * يحدد اليوم المرجعي للإحصاء
 * النوبات A و B → اليوم نفسه
 * النوبة C بعد منتصف الليل (00:00 → 06:00) → اليوم السابق
 * النوبة C قبل منتصف الليل (22:00 → 23:59) → اليوم نفسه
 */
export function getReferenceDay(dateStr, timeStr) {
  const shift = getShift(timeStr);
  if (!shift || !dateStr) return null;

  const minutes = parseTimeToMinutes(timeStr);
  const hour = minutes / 60;

  // النوبة C في الفجر تُسند لليوم السابق
  if (shift === 'C' && hour < SHIFT_RANGES.A.start) {
    return addDays(dateStr, -1);
  }
  return dateStr;
}

/**
 * يكتشف Cross Shift (تعارض النوبات)
 * يحدث عندما يكون وقت الوصول في نوبة ووقت الموافقة في نوبة أخرى
 */
export function isCrossShift(arrivalTime, approvalTime) {
  if (!arrivalTime || !approvalTime) return false;
  const arrShift = getShift(arrivalTime);
  const appShift = getShift(approvalTime);
  if (!arrShift || !appShift) return false;
  return arrShift !== appShift;
}

/**
 * يحدد النوبة المسؤولة عن المحضر
 * القاعدة الأساسية: نوبة الوصول هي المسؤولة
 * الاستثناءات:
 *   - لو حدث Cross Shift وكانت الحافلة لا تزال في الفرز عند انتهاء النوبة
 *     → النوبة المسؤولة قد تكون نوبة المغادرة
 *   - لو يوجد "سبب إسناد" يدوي → يُحترم
 */
export function getResponsibleShift(record) {
  if (!record) return null;

  // سبب إسناد يدوي له الأولوية
  if (record.assignReason && record.assignReason.trim()) {
    return record.responsibleShift || null;
  }

  const arrShift = getShift(record.busCheckIn);
  if (!arrShift) return null;

  // لو لم يحدث Cross Shift، نوبة الوصول هي المسؤولة
  if (!isCrossShift(record.busCheckIn, record.approvalTime)) {
    return arrShift;
  }

  // Cross Shift: نوبة المغادرة هي المسؤولة لو الحافلة عبرت
  const depShift = getShift(record.busCheckOut);
  return depShift || arrShift;
}

/**
 * يُرجع كل النوبات الثلاث كمصفوفة (للحلقات)
 */
export function getAllShifts() {
  return ['A', 'B', 'C'];
}

/**
 * يحقق هل النوبة صالحة
 */
export function isValidShift(shift) {
  return shift === 'A' || shift === 'B' || shift === 'C';
}

/**
 * يُرجع وصفاً نصياً للنوبة (لعرض المستخدم)
 */
export function describeShift(shift) {
  const descriptions = {
    A: 'النوبة الأولى (٦ صباحاً - ٢ ظهراً)',
    B: 'النوبة الثانية (٢ ظهراً - ١٠ مساءً)',
    C: 'النوبة الثالثة (١٠ مساءً - ٦ صباحاً)'
  };
  return descriptions[shift] || 'نوبة غير معروفة';
}
