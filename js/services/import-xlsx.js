/**
 * خدمة استيراد ملف الإكسل الأصلي
 * --------------------------------------------------------------
 * يستخدم مكتبة SheetJS (XLSX) لقراءة الملف
 * يحول كل ورقة إلى صفوف JSON
 * يدمج الصفوف في الجداول المقابلة في IndexedDB
 * --------------------------------------------------------------
 * يفترض تحميل lib/xlsx.full.min.js في index.html
 * --------------------------------------------------------------
 */

import { db } from '../db/database.js';
import { TABLES, SHEET_NAMES, META_KEYS } from '../core/constants.js';
import { RECORD_COLUMNS } from '../core/columns.js';
import { computeDerivedFields } from './records.js';

const XLSX = window.XLSX;

if (!XLSX) {
  console.warn('مكتبة XLSX غير محملة. خدمة الاستيراد لن تعمل');
}

/**
 * يقرأ ملف Excel ويُرجع كائناً يحوي كل الأوراق
 */
export async function readExcelFile(file) {
  if (!XLSX) throw new Error('مكتبة XLSX غير محملة');

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    cellDates: true,
    cellNF: false,
    sheetStubs: false
  });

  const result = {};
  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    result[name] = XLSX.utils.sheet_to_json(sheet, {
      defval: null,
      raw: false,
      blankrows: false
    });
  }
  return result;
}

/**
 * يحول صفاً من ورقة Record الإكسل إلى سجل قاعدة بيانات
 * الإكسل يستخدم labels عربية، نحول إلى keys إنجليزية
 */
function mapExcelRowToRecord(row) {
  const record = {};
  for (const col of RECORD_COLUMNS) {
    // ابحث عن القيمة باستخدام label أو جزء منه
    const label = col.label;
    const englishPart = label.includes('\n') ? label.split('\n')[1] : null;

    let value = null;
    // جرب أولاً المفتاح الإنجليزي (لو موجود في الـ label)
    if (englishPart && row[englishPart] !== undefined) {
      value = row[englishPart];
    } else if (row[label] !== undefined) {
      value = row[label];
    } else {
      // ابحث في كل المفاتيح
      for (const key of Object.keys(row)) {
        if (key.includes(label.split('\n')[0])) {
          value = row[key];
          break;
        }
      }
    }

    if (value !== null && value !== undefined && value !== '') {
      record[col.key] = value;
    }
  }
  return record;
}

/**
 * يستورد صفوف ورقة Record إلى جدول records
 */
async function importRecords(rows) {
  // تجاوز الصفوف الأولى (لوحة الإحصاءات في الأعلى)
  // الصفوف الفعلية تبدأ من الصف ٣ تقريباً
  const dataRows = rows.filter(r => {
    // صف يحوي بيانات حقيقية لو يحتوي رقم رحلة أو رقم لوحة
    const hasFlightNo = Object.values(r).some(v =>
      typeof v === 'string' && /^[A-Z]{1,3}\s*\d+$/.test(v.trim())
    );
    return hasFlightNo;
  });

  if (dataRows.length === 0) return { imported: 0 };

  const records = dataRows.map(mapExcelRowToRecord);
  const enriched = await Promise.all(records.map(r => computeDerivedFields(r)));

  await db[TABLES.RECORDS].bulkAdd(enriched);
  return { imported: enriched.length };
}

/**
 * يستورد قوائم Lists (تحدث الموجود ولا تكرر)
 */
async function importLists(rows) {
  // ورقة Lists في الملف الأصلي معقدة (٢٤ عمود)
  // نتجاهلها لأن البيانات الافتراضية موجودة في seed
  // المستخدم يستطيع إضافة قوائم من شاشة الإعدادات
  return { skipped: rows.length };
}

/**
 * يستورد ورقة FLIGHTS MASTER SHEET
 */
async function importMaster(rows) {
  const dataRows = rows.filter(r =>
    Object.values(r).some(v => typeof v === 'string' && v.trim().length > 0)
  );
  if (dataRows.length === 0) return { imported: 0 };

  await db[TABLES.MASTER].bulkAdd(dataRows);
  return { imported: dataRows.length };
}

/**
 * يستورد ورقة Flight Radar 24
 */
async function importRadar(rows) {
  const dataRows = rows.filter(r =>
    Object.values(r).some(v => v !== null && v !== '')
  );
  if (dataRows.length === 0) return { imported: 0 };

  const importDate = new Date().toISOString().slice(0, 10);
  const enriched = dataRows.map(r => ({ ...r, importDate }));

  await db[TABLES.RADAR].bulkAdd(enriched);
  return { imported: enriched.length };
}

/**
 * الواجهة الرئيسية للاستيراد
 * يستقبل ملف Excel ويستورد كل الأوراق المعروفة
 */
export async function importExcelFile(file, onProgress) {
  if (!file) throw new Error('لم يتم تحديد ملف');

  onProgress?.({ stage: 'reading', message: 'جارٍ قراءة الملف...' });
  const sheets = await readExcelFile(file);

  const report = { total: 0, sheets: {} };

  // ورقة Record (الأهم)
  if (sheets[SHEET_NAMES.RECORD]) {
    onProgress?.({ stage: 'records', message: 'جارٍ استيراد السجلات...' });
    const r = await importRecords(sheets[SHEET_NAMES.RECORD]);
    report.sheets.records = r;
    report.total += r.imported || 0;
  }

  // ورقة FLIGHTS MASTER SHEET
  if (sheets[SHEET_NAMES.MASTER]) {
    onProgress?.({ stage: 'master', message: 'جارٍ استيراد الرحلات الدائمة...' });
    const r = await importMaster(sheets[SHEET_NAMES.MASTER]);
    report.sheets.master = r;
    report.total += r.imported || 0;
  }

  // ورقة Flight Radar 24
  if (sheets[SHEET_NAMES.RADAR]) {
    onProgress?.({ stage: 'radar', message: 'جارٍ استيراد بيانات Flight Radar...' });
    const r = await importRadar(sheets[SHEET_NAMES.RADAR]);
    report.sheets.radar = r;
    report.total += r.imported || 0;
  }

  // ورقة Lists (نتخطاها - الافتراضي يكفي)
  if (sheets[SHEET_NAMES.LISTS]) {
    report.sheets.lists = await importLists(sheets[SHEET_NAMES.LISTS]);
  }

  // تحديث وقت آخر استيراد
  await db[TABLES.META].put({
    key: META_KEYS.LAST_IMPORT,
    value: new Date().toISOString()
  });

  onProgress?.({ stage: 'done', message: 'تم الاستيراد بنجاح' });
  return report;
}
