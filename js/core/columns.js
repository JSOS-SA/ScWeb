/**
 * تعريف أعمدة جدول السجل الرئيسي
 * --------------------------------------------------------------
 * 64 عمود مأخوذة حرفياً من ورقة Record الأصلية
 * كل عمود له:
 *   - key: مفتاح برمجي بالإنجليزية للقاعدة (لا يحتوي مسافات)
 *   - label: العنوان الأصلي كما يظهر للمستخدم (عربي ضمن قواعد المستخدم)
 *   - type: نوع البيانات (text, number, time, date, lookup, computed)
 *   - source: input (إدخال يدوي) أو computed (محسوب)
 *   - listType: لو كانت قائمة منسدلة، نوع القائمة المرجعية
 * --------------------------------------------------------------
 */

import { LIST_TYPES } from './constants.js';

export const RECORD_COLUMNS = Object.freeze([
  { key: 'busNo',           label: 'رقم لوحة الحافلة\nBus No.',                              type: 'text',     source: 'input' },
  { key: 'flightNo',        label: 'رقم الرحلة\nFlight No',                                  type: 'text',     source: 'input' },
  { key: 'nationality',     label: 'الجنسية\nNationality',                                   type: 'lookup',   source: 'input', listType: LIST_TYPES.NATIONALITY },
  { key: 'pax',             label: 'اجمالي عدد الركاب حتى في وجود رحلة مشتركة\nPAX',         type: 'number',   source: 'input' },
  { key: 'busCheckIn',      label: 'وقت وصول الحافلة للفرز\nBus Check IN Time',              type: 'time',     source: 'input' },
  { key: 'flightsOnBus',    label: 'عدد الرحلات في الحافلة\nNo of Flight on Bus',            type: 'number',   source: 'input' },
  { key: 'parking',         label: 'الموقف\nParking No',                                     type: 'lookup',   source: 'input', listType: LIST_TYPES.PARKING },
  { key: 'visa',            label: 'نوع التأشيرة\nVisa',                                     type: 'lookup',   source: 'input', listType: LIST_TYPES.VISA_TYPE },
  { key: 'company',         label: 'الحملة\nCompany',                                        type: 'lookup',   source: 'input', listType: LIST_TYPES.COMPANY },
  { key: 'paxStatus',       label: 'وضع الركاب\nPassengers Status',                          type: 'lookup',   source: 'input', listType: LIST_TYPES.PAX_STATUS },
  { key: 'baggageStatus',   label: 'وضع الأمتعة\nBaggages Status',                           type: 'lookup',   source: 'input', listType: LIST_TYPES.BAGGAGE_STATUS },
  { key: 'flightStatus',    label: 'وضع الرحلة\nFlight Status',                              type: 'lookup',   source: 'input', listType: LIST_TYPES.FLIGHT_STATUS },
  { key: 'action',          label: 'الاجراء المتخذ\nAction',                                 type: 'lookup',   source: 'input', listType: LIST_TYPES.ACTION },
  { key: 'coordTime',       label: 'وقت التنسيق مع عمليات الصالة\nCoordination Time',        type: 'time',     source: 'input' },
  { key: 'approvalTime',    label: 'وقت موافقة العمليات وطلب الحافلة\nApproval Time',        type: 'time',     source: 'input' },
  { key: 'busCheckOut',     label: 'وقت مغادرة الحافلة للفرز\nBus Check OUT Time',           type: 'time',     source: 'input' },
  { key: 'otherTerminal',   label: 'الصالة الأخرى\nيعبأ في حالة المشترك فقط',                type: 'lookup',   source: 'input', listType: LIST_TYPES.TERMINAL },
  { key: 'otherFlightNo',   label: 'رقم الرحلة الأخرى\nيعبأ في حالة المشترك فقط',            type: 'text',     source: 'input' },
  { key: 'otherPax',        label: 'عدد ركاب الرحلة الأخرى\nيعبأ في حالة المشترك فقط',       type: 'number',   source: 'input' },
  { key: 'extraInfo',       label: 'معلومات إضافية تخص الرحلات ان وجدت',                     type: 'text',     source: 'input' },
  { key: 'ourPax',          label: 'ركاب صالتنا',                                            type: 'number',   source: 'computed' },
  { key: 'crossSubType',    label: 'نوع المشترك',                                            type: 'lookup',   source: 'input', listType: LIST_TYPES.CROSS_SUB },
  { key: 'destination',     label: 'الوجهة\nDistination',                                    type: 'text',     source: 'computed' },
  { key: 'std',             label: 'وقت الإقلاع\nSTD',                                       type: 'time',     source: 'computed' },
  { key: 'iataCode',        label: 'الرمز\nIATA Code',                                       type: 'lookup',   source: 'computed', listType: LIST_TYPES.AIRLINE_CODE },
  { key: 'airline',         label: 'الطيران الناقل\nAirlines',                               type: 'lookup',   source: 'computed', listType: LIST_TYPES.AIRLINE },
  { key: 'flightLogo',      label: 'Flight Logo',                                            type: 'text',     source: 'computed' },
  { key: 'terminal',        label: 'الصالة\nTerminal',                                       type: 'lookup',   source: 'computed', listType: LIST_TYPES.TERMINAL },
  { key: 'servicesCo',      label: 'شركة الخدمات\nServices Company',                         type: 'lookup',   source: 'computed', listType: LIST_TYPES.SERVICES_CO },
  { key: 'timeToDep',       label: 'الوقت المتبقي للاقلاع حين وصول الحافلة\nTime To Departure', type: 'number', source: 'computed' },
  { key: 'timeToDep2',      label: 'الوقت المتبقي للاقلاع حين طلب الحافلة\nTimeToDeparture2', type: 'number',  source: 'computed' },
  { key: 'arrTimingClass1', label: 'تشخيص توقيت الوصول وتحرير المحاضر1\nArrival Timing Classification1', type: 'text', source: 'computed' },
  { key: 'arrTimingClass2', label: 'تشخيص (مبكر، متأخر)\nArrival Timing Classification2',    type: 'text',     source: 'computed' },
  { key: 'arrTimingClass3', label: 'تشخيص (خاطئ، مشترك)\nArrival Timing Classification2',    type: 'text',     source: 'computed' },
  { key: 'busArrOpsDelay',  label: 'تشخيص توقيت الوصول وتأخر العمليات\nBus Arrival&OPS Delay', type: 'text',    source: 'computed' },
  { key: 'coordDuration',   label: 'معدل زمن التنسيق مع العمليات\nCoordinationTime with OPS', type: 'number',   source: 'computed' },
  { key: 'responseTime',    label: 'معدل زمن استجابة العمليات\nResponseTime (Approval time)', type: 'number',   source: 'computed' },
  { key: 'opsDiagnosis',    label: 'تشخيص تشغيل العمليات\nOperations Coordination Diagnosis', type: 'text',     source: 'computed' },
  { key: 'flightState',     label: 'حالة الرحلة',                                            type: 'text',     source: 'computed' },
  { key: 'troubledClose',   label: 'وقت اغلاق الحالة المتعثرة\nTroubled Flight Closing Time', type: 'time',     source: 'input' },
  { key: 'waitBefore',      label: 'معدل زمن الانتظار قبل موافقة العمليات\nWaitDuration (BeforeApproval)', type: 'number', source: 'computed' },
  { key: 'waitAfter',       label: 'معدل زمن الانتظار بعد موافقة العمليات\nWaitDuration (AfterApproval)',  type: 'number', source: 'computed' },
  { key: 'date',            label: 'التاريخ\nDate',                                          type: 'date',     source: 'input' },
  { key: 'shiftTime',       label: 'وقت النوبة',                                             type: 'text',     source: 'computed' },
  { key: 'arrivalShift',    label: 'نوبة الوصول',                                            type: 'text',     source: 'computed' },
  { key: 'departureShift',  label: 'نوبة المغادرة',                                          type: 'text',     source: 'computed' },
  { key: 'approvalShift',   label: 'نوبة موافقة العمليات',                                   type: 'text',     source: 'computed' },
  { key: 'responsibleShift',label: 'النوبة المسؤولة عن المحضر',                              type: 'text',     source: 'computed' },
  { key: 'refDay',          label: 'اليوم المرجعي للإحصاء',                                  type: 'date',     source: 'computed' },
  { key: 'targetTime',      label: 'الزمن المستهدف لتحرير المحاضر',                          type: 'number',   source: 'computed' },
  { key: 'hasReport',       label: 'هل يحتوي على محضر؟',                                     type: 'text',     source: 'computed' },
  { key: 'pullToReport',    label: 'يسحب للمحاضر؟',                                          type: 'text',     source: 'computed' },
  { key: 'reportTime',      label: 'وقت تحرير المحضر',                                       type: 'time',     source: 'input' },
  { key: 'reportNote',      label: 'ملاحظة المحضر',                                          type: 'text',     source: 'input' },
  { key: 'crossShift',      label: 'Cross Shift',                                            type: 'text',     source: 'computed' },
  { key: 'assignReason',    label: 'سبب الاسناد',                                            type: 'text',     source: 'computed' },
  { key: 'reportExists',    label: 'هل يوجد محضر',                                           type: 'text',     source: 'computed' },
  { key: 'statusNow',       label: 'الحالة اللحظية للحافلة\nStatusNow',                      type: 'lookup',   source: 'input', listType: LIST_TYPES.STATUS_NOW },
  { key: 'statusAtRef',     label: 'حالة الحافلة عند وقت التسليم\nStatusAtRef',              type: 'text',     source: 'computed' },
  { key: 'completeness',    label: 'مراقبة اكتمال التسجيل\nCompleteness',                    type: 'text',     source: 'computed' },
  { key: 'coordStatus',     label: 'مراقبة تأخر التنسيق\nCoord Status',                      type: 'text',     source: 'computed' },
  { key: 'yardDepAlert',    label: 'مراقبة مغادرة الفرز\nYard Departure Alert',              type: 'text',     source: 'computed' },
  { key: 'notes',           label: 'ملاحظات',                                                type: 'text',     source: 'input' }
]);

// خرائط مساعدة للبحث السريع
export const COLUMN_KEYS = RECORD_COLUMNS.map(c => c.key);
export const INPUT_COLUMNS = RECORD_COLUMNS.filter(c => c.source === 'input');
export const COMPUTED_COLUMNS = RECORD_COLUMNS.filter(c => c.source === 'computed');

// عدد الأعمدة (للتحقق)
export const RECORD_COLUMN_COUNT = RECORD_COLUMNS.length; // = 64
