/**
 * ملف الثوابت التشغيلية للنظام
 * --------------------------------------------------------------
 * بيانات صرفة بدون أي منطق تنفيذي
 * مصدر هذه القيم: نطاقات Lists!U2:U4 في الملف الأصلي
 * لا تعدل من الكود مباشرة - تعدل من شاشة الإعدادات
 * --------------------------------------------------------------
 */

// قيم العتبات الزمنية الافتراضية للتنبيهات
export const DEFAULT_THRESHOLDS = Object.freeze({
  MaxCoordLag: 4,          // أقصى تأخر للتنسيق بعد دخول الفرز (دقائق)
  MaxYardAfterApproval: 5, // أقصى مدة بقاء في الفرز بعد الموافقة (دقائق)
  MaxCurbAfterApproval: 7  // أقصى مدة على الرصيف بعد الموافقة (دقائق)
});

// نطاقات النوبات الثلاث بساعات اليوم (٢٤ ساعة)
export const SHIFT_RANGES = Object.freeze({
  A: { start: 6,  end: 14 }, // من السادسة صباحاً حتى الثانية ظهراً
  B: { start: 14, end: 22 }, // من الثانية ظهراً حتى العاشرة مساءً
  C: { start: 22, end: 30 }  // من العاشرة مساءً حتى السادسة فجراً (نهاية مرنة)
});

// أسماء الأوراق الأصلية في ملف الإكسل (نحتفظ بها حرفياً للتطابق)
export const SHEET_NAMES = Object.freeze({
  HOME:           'الرئيسية',
  LISTS:          'Lists',
  RECORD:         'Record',
  SHIFT_SUMMARY:  'Sheet2',
  REPORTS_DETAILS:'Reports Details',
  REPORT_1:       'Reports(1 Choice)',
  REPORT_2:       'Reports(2Choices) ',
  FLIGHTS_DETAIL: 'FlightsDetail',
  FLIGHTS_BOARD:  'FlightsBoard',
  PEAK_HOURS:     'Peak Hours',
  FLIGHTS_STATS:  'Flights Statistics',
  HANDOVER:       'Handover',
  DAILY_KPIS:     'Daily KPIs',
  TROUBLED:       'Troubled Flights Details',
  MASTER:         'FLIGHTS MASTER SHEET',
  RADAR:          'Flight Radar 24'
});

// أسماء جداول قاعدة البيانات المحلية (المقابل لأوراق الإكسل)
export const TABLES = Object.freeze({
  META:           'meta',           // إعدادات وثوابت
  LISTS:          'lists',          // القوائم المرجعية
  RECORDS:        'records',        // السجل الرئيسي
  SHIFT_SUMMARY:  'shiftSummary',   // ملخص النوبات
  REPORTS:        'reports',        // المحاضر
  FLIGHTS_DETAIL: 'flightsDetail',  // تفاصيل الرحلة
  FLIGHTS_BOARD:  'flightsBoard',   // اللوحة اللحظية
  PEAK_HOURS:     'peakHours',      // ساعات الذروة
  FLIGHTS_STATS:  'flightsStats',   // إحصاءات الرحلات
  HANDOVER:       'handover',       // تسليم النوبة
  DAILY_KPIS:     'dailyKpis',      // مؤشرات الأداء
  TROUBLED:       'troubled',       // الرحلات المتعثرة
  MASTER:         'flightsMaster',  // الرحلات الدائمة
  RADAR:          'flightRadar',    // بيانات Flight Radar 24
  CHANGE_LOG:     'changeLog',      // سجل التغييرات للمزامنة
  ATTACHMENTS:    'attachments'     // التوقيعات والصور
});

// أنواع القوائم المرجعية الـ 24 الموجودة في ورقة Lists الأصلية
export const LIST_TYPES = Object.freeze({
  FLIGHT_STATUS:  'flight_status',  // مجدولة، متعثرة، غادرت
  NATIONALITY:    'nationality',    // الجنسيات
  VISA_TYPE:      'visa_type',      // حج، عمرة، سياحة، مقيمين، خليجيين، أخرى
  TERMINAL:       'terminal',       // الصالات
  PARKING:        'parking',        // المواقف
  COMPANY:        'company',        // الحملات
  PAX_STATUS:     'pax_status',     // وضع الركاب
  BAGGAGE_STATUS: 'baggage_status', // وضع الأمتعة
  TIMING:         'timing',         // في الموعد، مبكر، متأخر، خاطئ
  SERVICES_CO:    'services_co',    // SGS, SWI
  AIRLINE:        'airline',        // شركات الطيران
  AIRLINE_CODE:   'airline_code',   // أكواد IATA
  ACTION:         'action',         // الإجراءات المتخذة
  STATUS_NOW:     'status_now',     // الحالات اللحظية
  CROSS_SUB:      'cross_sub',      // أنواع المشترك
  MANAGER:        'manager',        // المديرون الموقعون
  SUPERVISOR:     'supervisor'      // المشرفون
});

// عنوان البرنامج كما يظهر في ورقة الرئيسية حرفياً
export const APP_TITLE = 'برنامج تسجيل ومتابعة حافلات الرحلات بنقطة فرز صالة الحج (بوابة 14) وقياس مؤشرات الأداء';
export const APP_OWNER = 'الإدارة العامة لعمليات الساحات الخارجية والمواصلات';
export const APP_COMPANY = 'شركة مطارات جدة';

// إصدار قاعدة البيانات (يُزاد عند تغيير الـ schema)
export const DB_NAME = 'HajjTerminalDB';
export const DB_VERSION = 1;

// مفاتيح الإعدادات في جدول meta
export const META_KEYS = Object.freeze({
  THRESHOLDS:     'thresholds',
  LAST_IMPORT:    'last_import_date',
  LAST_HANDOVER:  'last_handover_ts',
  CURRENT_SHIFT:  'current_shift',
  CURRENT_DAY:    'current_operational_day'
});
