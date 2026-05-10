# دليل نشر المشروع على GitHub Pages

هذا الدليل يشرح كيف ترفع مشروع `ScWeb` لـ GitHub وتفعّل الاستضافة المجانية ليتحول إلى موقع له رابط دائم.

---

## الخطوة ١: إنشاء Personal Access Token (مرة واحدة فقط)

GitHub أوقف كلمات المرور للـ Git منذ ٢٠٢١. ستحتاج Token بدلاً منها.

١. ادخل: <https://github.com/settings/tokens>

٢. اضغط **Generate new token (classic)**

٣. الإعدادات:
   - **Note**: `ScWeb deployment`
   - **Expiration**: `90 days` (أو حسب رغبتك)
   - **Scopes**: ضع علامة على `repo` فقط (يكفي)

٤. اضغط **Generate token** في الأسفل

٥. **انسخ الـ Token الظاهر فوراً** (لن يظهر مرة أخرى). احتفظ به في مكان آمن.

---

## الخطوة ٢: إنشاء المستودع على GitHub

١. ادخل: <https://github.com/new>

٢. الإعدادات:
   - **Repository name**: `ScWeb`
   - **Description**: `برنامج حافلات صالة الحج - بوابة ١٤`
   - **Visibility**: اختر **Public** (شرط لـ Pages المجاني)
   - **لا تضع علامة** على Initialize this repository (نريد مستودع فارغ)

٣. اضغط **Create repository**

---

## الخطوة ٣: رفع الملفات

### للويندوز (الأسهل): استخدم PowerShell

١. افتح PowerShell داخل مجلد المشروع:
   - من File Explorer، اذهب لمجلد `ht-bus-web`
   - اضغط `Shift + Right Click` في مكان فارغ
   - اختر **Open PowerShell window here**

٢. شغّل السكربت:
   ```powershell
   .\deploy.ps1
   ```

٣. لو ظهر خطأ تنفيذ السكربت، شغّل أولاً:
   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
   ثم أعد تشغيل `.\deploy.ps1`

٤. عند طلب اسم المستخدم: اكتبه واضغط Enter

٥. عند طلب كلمة المرور: **الصق الـ Token** (لن يظهر شيء أثناء الكتابة، هذا طبيعي)

### بديل: استخدم Git Bash

```bash
cd ht-bus-web
bash deploy.sh
```

---

## الخطوة ٤: تفعيل GitHub Pages

١. ادخل: `https://github.com/JSOS-SA/ScWeb/settings/pages`
   (عدّل `JSOS-SA` لاسم حسابك)

٢. تحت **Build and deployment** → **Source**:
   - اختر **GitHub Actions**

٣. ادخل تبويب **Actions** في أعلى المستودع، ستجد workflow اسمه `Deploy to GitHub Pages` يعمل تلقائياً.

٤. انتظر ٢-٣ دقائق حتى يكتمل البناء (تظهر علامة ✓ خضراء).

---

## الخطوة ٥: افتح الموقع

الرابط النهائي:
```
https://JSOS-SA.github.io/ScWeb/
```

(عدّل `JSOS-SA` لاسم حسابك)

---

## التحديث لاحقاً

كل مرة تعدّل الملفات:

```bash
cd ht-bus-web
git add .
git commit -m "وصف التغيير"
git push
```

GitHub Actions سينشر التحديث تلقائياً خلال دقيقتين.

أو يكفي تشغيل `deploy.ps1` / `deploy.sh` مرة أخرى.

---

## استكشاف الأخطاء

### المشكلة: "Permission denied" أو "Authentication failed"
- تأكد أنك تستخدم Personal Access Token وليس كلمة المرور
- تأكد أن الـ Token له صلاحية `repo`

### المشكلة: "remote: Repository not found"
- تأكد أن اسم المستودع يطابق `ScWeb` بالضبط (حساس لحالة الأحرف)
- تأكد أن المستودع موجود فعلاً على GitHub

### المشكلة: الموقع يفتح لكن صفحة ٤٠٤
- تأكد أن `index.html` في جذر المستودع (وليس داخل مجلد فرعي)
- تأكد أن workflow اكتمل بنجاح (تبويب Actions)

### المشكلة: الموقع يفتح لكن الصفحة بيضاء
- افتح Console في المتصفح (F12) واقرأ الخطأ
- الأرجح أن مسار ملف JS أو CSS غير صحيح
