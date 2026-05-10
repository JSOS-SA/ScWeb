/**
 * قواعد التحقق من صحة البيانات
 * --------------------------------------------------------------
 * كل دالة تستقبل قيمة وتُرجع كائناً:
 *   { valid: boolean, message: string }
 * --------------------------------------------------------------
 */

import { parseTimeToMinutes } from '../utils/time.js';

const ok = () => ({ valid: true, message: '' });
const fail = (msg) => ({ valid: false, message: msg });

/**
 * يتحقق أن القيمة ليست فارغة
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    return fail(`الحقل "${fieldName}" مطلوب`);
  }
  return ok();
}

/**
 * يتحقق أن القيمة عدد موجب
 */
export function validatePositiveNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') return ok();
  const n = Number(value);
  if (isNaN(n)) return fail(`الحقل "${fieldName}" يجب أن يكون رقماً`);
  if (n < 0) return fail(`الحقل "${fieldName}" يجب أن يكون موجباً`);
  return ok();
}

/**
 * يتحقق أن القيمة عدد صحيح موجب
 */
export function validatePositiveInteger(value, fieldName) {
  const numCheck = validatePositiveNumber(value, fieldName);
  if (!numCheck.valid) return numCheck;
  if (value === null || value === undefined || value === '') return ok();
  if (!Number.isInteger(Number(value))) {
    return fail(`الحقل "${fieldName}" يجب أن يكون عدداً صحيحاً`);
  }
  return ok();
}

/**
 * يتحقق أن النص يطابق صيغة وقت HH:MM
 */
export function validateTime(value, fieldName) {
  if (!value) return ok();
  if (parseTimeToMinutes(value) === null) {
    return fail(`الحقل "${fieldName}" يجب أن يكون وقتاً صحيحاً بصيغة HH:MM`);
  }
  return ok();
}

/**
 * يتحقق أن النص يطابق صيغة تاريخ YYYY-MM-DD
 */
export function validateDate(value, fieldName) {
  if (!value) return ok();
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return fail(`الحقل "${fieldName}" يجب أن يكون تاريخاً بصيغة YYYY-MM-DD`);
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return fail(`الحقل "${fieldName}" تاريخ غير صالح`);
  }
  return ok();
}

/**
 * يتحقق أن القيمة موجودة في قائمة معتمدة
 */
export function validateInList(value, list, fieldName) {
  if (!value) return ok();
  if (!Array.isArray(list)) return ok();
  if (!list.includes(value)) {
    return fail(`القيمة "${value}" غير مسموحة في الحقل "${fieldName}"`);
  }
  return ok();
}

/**
 * يتحقق من اكتمال السجل (الحقول الإلزامية)
 * يُرجع مصفوفة بكل الأخطاء (قد تكون متعددة)
 */
export function validateRecord(record) {
  const errors = [];

  const checks = [
    validateRequired(record.busNo, 'رقم لوحة الحافلة'),
    validateRequired(record.flightNo, 'رقم الرحلة'),
    validatePositiveInteger(record.pax, 'عدد الركاب'),
    validateTime(record.busCheckIn, 'وقت وصول الحافلة للفرز'),
    validateTime(record.coordTime, 'وقت التنسيق'),
    validateTime(record.approvalTime, 'وقت الموافقة'),
    validateTime(record.busCheckOut, 'وقت مغادرة الفرز'),
    validateDate(record.date, 'التاريخ')
  ];

  checks.forEach(c => { if (!c.valid) errors.push(c.message); });

  // تحقق منطقي: ترتيب الأوقات
  const ti = parseTimeToMinutes(record.busCheckIn);
  const tc = parseTimeToMinutes(record.coordTime);
  const ta = parseTimeToMinutes(record.approvalTime);
  const to = parseTimeToMinutes(record.busCheckOut);

  if (ti !== null && tc !== null && tc < ti) {
    errors.push('وقت التنسيق لا يمكن أن يسبق وقت وصول الحافلة');
  }
  if (tc !== null && ta !== null && ta < tc) {
    errors.push('وقت الموافقة لا يمكن أن يسبق وقت التنسيق');
  }
  if (ta !== null && to !== null && to < ta) {
    errors.push('وقت المغادرة لا يمكن أن يسبق وقت الموافقة');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * يتحقق من رقم رحلة (صيغة شائعة: حرفان أو ثلاثة + أرقام)
 * مثل SV1234، F3567، QR4 ، MS3987
 */
export function validateFlightNo(value) {
  if (!value) return ok();
  const match = String(value).trim().match(/^[A-Za-z]{1,3}\s*\d{1,5}$/);
  if (!match) {
    return fail('رقم الرحلة يجب أن يبدأ بـ ١-٣ حروف ثم أرقام');
  }
  return ok();
}

/**
 * يتحقق من رقم لوحة حافلة (صيغة سعودية مبسطة)
 */
export function validateBusNo(value) {
  if (!value) return ok();
  // نقبل أي صيغة معقولة - السعودية لها صيغ متعددة
  if (String(value).trim().length < 4) {
    return fail('رقم لوحة الحافلة قصير جداً');
  }
  return ok();
}
