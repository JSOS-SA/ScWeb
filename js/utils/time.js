/**
 * دوال مساعدة للتعامل مع الوقت والتاريخ
 * --------------------------------------------------------------
 * كل الدوال هنا نقية (Pure Functions):
 *   - لا تُعدل المدخلات
 *   - لا تُحدث حالة خارجية
 *   - نفس المدخل يُنتج نفس المخرج دائماً
 * --------------------------------------------------------------
 */

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * يحول نص وقت (HH:MM) إلى عدد دقائق منذ منتصف الليل
 * مثال: "14:30" → 870
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

/**
 * يحول عدد دقائق إلى نص وقت HH:MM
 * مثال: 870 → "14:30"
 */
export function formatMinutesToTime(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) return '';
  const total = Math.floor(minutes) % (24 * 60);
  const safe = total < 0 ? total + 24 * 60 : total;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

/**
 * يحسب فرق الدقائق بين وقتين (HH:MM)
 * يتعامل مع تجاوز منتصف الليل (لو wrapDay=true)
 */
export function diffMinutes(start, end, wrapDay = false) {
  const a = parseTimeToMinutes(start);
  const b = parseTimeToMinutes(end);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (wrapDay && diff < 0) diff += 24 * 60;
  return diff;
}

/**
 * يحول كائن Date إلى نص HH:MM
 */
export function dateToTimeStr(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return String(date.getHours()).padStart(2, '0') + ':' +
         String(date.getMinutes()).padStart(2, '0');
}

/**
 * يحول كائن Date إلى نص YYYY-MM-DD
 */
export function dateToDateStr(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.getFullYear() + '-' +
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0');
}

/**
 * يبني كائن Date من تاريخ ووقت نصيين
 */
export function buildDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) return null;
  const [y, m, d] = dateStr.split('-').map(n => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, Math.floor(minutes / 60), minutes % 60);
}

/**
 * يُرجع الوقت الحالي كنص HH:MM
 */
export function nowAsTimeStr() {
  return dateToTimeStr(new Date());
}

/**
 * يُرجع التاريخ الحالي كنص YYYY-MM-DD
 */
export function todayAsDateStr() {
  return dateToDateStr(new Date());
}

/**
 * يحسب اليوم التالي
 */
export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(n => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return dateToDateStr(date);
}

/**
 * يحسب الفرق بالدقائق بين الآن وبين وقت معين في نفس اليوم
 */
export function minutesFromNow(timeStr) {
  return diffMinutes(nowAsTimeStr(), timeStr);
}

/**
 * يحسب الفرق بالدقائق منذ وقت معين حتى الآن
 */
export function minutesSince(timeStr) {
  return diffMinutes(timeStr, nowAsTimeStr());
}

// تصدير الثوابت للاستخدام في وحدات أخرى
export const TIME_CONSTANTS = Object.freeze({
  MS_PER_MINUTE,
  MS_PER_HOUR,
  MS_PER_DAY
});
