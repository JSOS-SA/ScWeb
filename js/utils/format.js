/**
 * دوال تنسيق العرض
 * --------------------------------------------------------------
 * كل الدوال نقية - تستقبل قيمة وتُرجع نصاً منسقاً للعرض
 * --------------------------------------------------------------
 */

/**
 * ينسق عدداً بفواصل آلاف عربية
 * مثال: 1234 → "١٬٢٣٤"
 */
export function formatNumber(value, locale = 'ar-SA') {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (isNaN(n)) return String(value);
  return n.toLocaleString(locale);
}

/**
 * ينسق عدداً بفواصل آلاف غربية
 * مثال: 1234 → "1,234"
 */
export function formatNumberEn(value) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (isNaN(n)) return String(value);
  return n.toLocaleString('en-US');
}

/**
 * ينسق عدد دقائق إلى نص قابل للقراءة
 * مثال: 90 → "ساعة و٣٠ دقيقة"
 */
export function formatMinutesArabic(minutes) {
  if (typeof minutes !== 'number' || isNaN(minutes)) return '';
  const total = Math.round(minutes);
  const hours = Math.floor(total / 60);
  const mins = total % 60;

  if (hours === 0) return `${mins} دقيقة`;
  if (mins === 0) return hours === 1 ? 'ساعة واحدة' : `${hours} ساعة`;
  return `${hours} ساعة و${mins} دقيقة`;
}

/**
 * ينسق نسبة مئوية
 * مثال: 0.85 → "٨٥٫٠٪"
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || value === '') return '';
  const n = Number(value);
  if (isNaN(n)) return '';
  return (n * 100).toFixed(decimals) + '٪';
}

/**
 * يقص النص لو تجاوز طولاً معيناً ويضيف "..."
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  const s = String(text);
  if (s.length <= maxLength) return s;
  return s.substring(0, maxLength - 1) + '…';
}

/**
 * يحول قيمة منطقية إلى "نعم/لا"
 */
export function formatBoolean(value) {
  if (value === true || value === 1 || value === 'true') return 'نعم';
  if (value === false || value === 0 || value === 'false') return 'لا';
  return '';
}

/**
 * يصنف لوناً بناءً على قيمة التنبيه
 * يُستخدم في تلوين خلايا الجدول
 */
export function statusToColor(status) {
  const map = {
    'طبيعي':            'normal',
    'تحذير':            'warning',
    'تنبيه عاجل':       'alert',
    'مكتمل':            'normal',
    'ناقص':             'warning',
    'تأخر تنسيق':       'alert',
    'تأخر مغادرة الفرز':'alert',
    'في الفرز':          'info',
    'تم التنسيق وبانتظار الموافقة': 'pending',
    'تمت الموافقة وبانتظار مغادرة الفرز': 'pending',
    'على الرصيف':       'success',
    'انتهت وغادرت':     'finished'
  };
  return map[status] || 'default';
}

/**
 * يبني نصاً بعدد الحافلات بصياغة عربية صحيحة
 * مفرد، مثنى، جمع
 */
export function formatBusCount(count) {
  if (count === 0) return 'لا حافلات';
  if (count === 1) return 'حافلة واحدة';
  if (count === 2) return 'حافلتان';
  if (count >= 3 && count <= 10) return `${count} حافلات`;
  return `${count} حافلة`;
}

/**
 * يبني نصاً بعدد الركاب
 */
export function formatPaxCount(count) {
  if (count === 0) return 'لا ركاب';
  if (count === 1) return 'راكب واحد';
  if (count === 2) return 'راكبان';
  if (count >= 3 && count <= 10) return `${count} ركاب`;
  return `${formatNumber(count)} راكب`;
}

/**
 * ينسق التاريخ بصيغة ميلادية عربية
 */
export function formatDateArabic(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
