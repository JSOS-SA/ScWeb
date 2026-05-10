/**
 * خدمة الإحصاءات (Stats Service)
 * --------------------------------------------------------------
 * تستبدل الصيغ الحسابية في ورقتي Record و Sheet2
 * كل الدوال للقراءة فقط - لا تُعدّل القاعدة
 * --------------------------------------------------------------
 */

import { db } from '../db/database.js';
import { TABLES } from '../core/constants.js';
import { getAllShifts } from '../core/shifts.js';

/**
 * يحسب عدد الحافلات وعدد الركاب لمجموعة سجلات
 */
function sumBusesAndPax(records) {
  return {
    buses: records.length,
    pax: records.reduce((s, r) => s + (Number(r.pax) || 0), 0)
  };
}

/**
 * يحسب إحصائيات نوبة معينة في يوم معين
 */
export async function getShiftStats(refDay, shift) {
  const records = await db[TABLES.RECORDS]
    .where('[refDay+responsibleShift]')
    .equals([refDay, shift])
    .toArray();

  const total = sumBusesAndPax(records);
  const reports = records.filter(r => r.hasReport === 'نعم');
  const early = records.filter(r => r.arrTimingClass2?.includes('مبكر'));
  const late = records.filter(r => r.arrTimingClass2?.includes('متأخر'));
  const shared = records.filter(r => r.arrTimingClass3?.includes('مشترك'));
  const wrong = records.filter(r => r.arrTimingClass3?.includes('خاطئ'));
  const troubled = records.filter(r => r.flightState === 'متعثرة');

  return {
    shift,
    refDay,
    total,
    reports: reports.length,
    early: early.length,
    late: late.length,
    shared: shared.length,
    wrong: wrong.length,
    troubled: troubled.length,
    troubledPax: sumBusesAndPax(troubled).pax
  };
}

/**
 * يحسب إحصائيات النوبات الثلاث ليوم معين
 */
export async function getDayStats(refDay) {
  const shifts = getAllShifts();
  const results = await Promise.all(shifts.map(s => getShiftStats(refDay, s)));

  const totalBuses = results.reduce((s, r) => s + r.total.buses, 0);
  const totalPax = results.reduce((s, r) => s + r.total.pax, 0);

  return {
    refDay,
    shifts: results,
    dayTotal: { buses: totalBuses, pax: totalPax }
  };
}

/**
 * يحسب الإحصاءات مفصلة بنوع التأشيرة لنوبة معينة
 */
export async function getVisaTypeStats(refDay, shift) {
  const records = await db[TABLES.RECORDS]
    .where('[refDay+responsibleShift]')
    .equals([refDay, shift])
    .toArray();

  const visaTypes = ['حج', 'عمرة', 'سياحة', 'مقيمين', 'خليجيين', 'أخرى'];
  const stats = {};

  for (const type of visaTypes) {
    const matching = records.filter(r => r.visa === type);
    stats[type] = sumBusesAndPax(matching);
  }

  return stats;
}

/**
 * يحسب توزيع الحافلات على الساعات (لـ Peak Hours)
 * يُرجع مصفوفة بعدد ٢٤ ساعة، كل عنصر { hour, buses, pax }
 */
export async function getHourlyDistribution(refDay, shift = null) {
  let records;
  if (shift) {
    records = await db[TABLES.RECORDS]
      .where('[refDay+responsibleShift]')
      .equals([refDay, shift])
      .toArray();
  } else {
    records = await db[TABLES.RECORDS].where('refDay').equals(refDay).toArray();
  }

  // تهيئة ٢٤ ساعة (من ٦ صباحاً حتى ٥ صباحاً اليوم التالي)
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = (6 + i) % 24;
    hours.push({ hour, buses: 0, pax: 0 });
  }

  for (const r of records) {
    if (!r.busCheckIn) continue;
    const [hStr] = r.busCheckIn.split(':');
    const h = parseInt(hStr, 10);
    if (isNaN(h)) continue;
    const slot = hours.find(x => x.hour === h);
    if (slot) {
      slot.buses++;
      slot.pax += Number(r.pax) || 0;
    }
  }

  return hours;
}

/**
 * يحسب ترتيب الرحلات حسب عدد الحافلات
 * يُرجع مصفوفة مرتبة تنازلياً
 */
export async function getFlightsRanking(refDay, shift = null) {
  let records;
  if (shift) {
    records = await db[TABLES.RECORDS]
      .where('[refDay+responsibleShift]')
      .equals([refDay, shift])
      .toArray();
  } else {
    records = await db[TABLES.RECORDS].where('refDay').equals(refDay).toArray();
  }

  const groups = {};
  for (const r of records) {
    if (!r.flightNo) continue;
    if (!groups[r.flightNo]) {
      groups[r.flightNo] = { flightNo: r.flightNo, buses: 0, pax: 0 };
    }
    groups[r.flightNo].buses++;
    groups[r.flightNo].pax += Number(r.pax) || 0;
  }

  return Object.values(groups).sort((a, b) => b.buses - a.buses);
}

/**
 * يحسب إحصاءات لوحة الرحلات اللحظية (FlightsBoard)
 */
export async function getFlightsBoardStats() {
  const records = await db[TABLES.RECORDS].toArray();
  const groups = {};

  for (const r of records) {
    if (!r.flightNo) continue;
    if (!groups[r.flightNo]) {
      groups[r.flightNo] = {
        flightNo: r.flightNo,
        total: 0,
        inYard: 0,
        coordinated: 0,
        waitingDep: 0,
        onCurb: 0,
        finished: 0,
        notArrived: 0
      };
    }
    const g = groups[r.flightNo];
    g.total++;
    const s = r.statusNow;
    if (s === 'في الفرز') g.inYard++;
    else if (s === 'تم التنسيق وبانتظار الموافقة') g.coordinated++;
    else if (s === 'تمت الموافقة وبانتظار مغادرة الفرز') g.waitingDep++;
    else if (s === 'على الرصيف') g.onCurb++;
    else if (s === 'انتهت وغادرت') g.finished++;
    else if (s === 'لم تصل بعد') g.notArrived++;
  }

  return Object.values(groups);
}

/**
 * يحسب لوحة KPIs اليومية
 */
export async function getDailyKPIs(refDay) {
  const dayStats = await getDayStats(refDay);
  const records = await db[TABLES.RECORDS].where('refDay').equals(refDay).toArray();

  const avgCoord = records.length
    ? records.reduce((s, r) => s + (Number(r.coordDuration) || 0), 0) / records.length
    : 0;
  const avgWait = records.length
    ? records.reduce((s, r) => s + (Number(r.waitAfter) || 0), 0) / records.length
    : 0;
  const reportsCount = records.filter(r => r.hasReport === 'نعم').length;
  const reportsRate = records.length ? reportsCount / records.length : 0;

  return {
    ...dayStats,
    avgCoordTime: Math.round(avgCoord * 10) / 10,
    avgWaitTime: Math.round(avgWait * 10) / 10,
    reportsCount,
    reportsRate
  };
}
