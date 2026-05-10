# دليل النشر من A-Shell على iOS

هذا الدليل لمن يريد رفع المشروع لـ GitHub مباشرة من الـ iPhone أو iPad دون كمبيوتر.

---

## المتطلبات

١. تطبيق **A-Shell** من App Store (مجاني).

٢. مجلد `ht-bus-web` محفوظ في تطبيق **الملفات** على الـ iPhone (داخل iCloud Drive أو On My iPhone).

٣. **Personal Access Token** من GitHub:
   - افتح <https://github.com/settings/tokens>
   - اضغط **Generate new token (classic)**
   - **Note**: `ScWeb deployment`
   - **Expiration**: ٩٠ يوم
   - **Scopes**: ضع علامة على `repo` فقط
   - **Generate token** ثم انسخه فوراً

---

## الخطوات في A-Shell

افتح A-Shell ونفّذ ثلاثة أوامر فقط:

### الأمر الأول: اختر مجلد المشروع

```
pickFolder
```

سيفتح تطبيق الملفات. تنقّل إلى مجلد `ht-bus-web` واضغط **Open** أو **Done**.

### الأمر الثاني: تحقق أنك داخل المجلد الصحيح

```
ls
```

يجب أن تشاهد ملفات مثل `index.html` و `README.md` ومجلدات `js` و `css`.

### الأمر الثالث: نفّذ سكربت النشر

```
python3 deploy_ashell.py
```

السكربت سيسألك عن **التوكن**، ألصقه واضغط Enter. السكربت سينفذ:

١. التحقق من صحة التوكن

٢. إنشاء مستودع `ScWeb` على حسابك

٣. تهيئة git ورفع كل الملفات

٤. تفعيل GitHub Pages

٥. عرض رابط الموقع

---

## بعد اكتمال السكربت

ستظهر رسالة:
```
اكتمل النشر
رابط الموقع المنشور (انتظر دقيقتين للانتشار):
  https://jsos-sa.github.io/ScWeb/
```

انتظر دقيقتين ثم افتح الرابط من Safari.

---

## إذا تعرّضت لمشاكل

### "خطأ: لا يوجد index.html في المجلد الحالي"
نفّذ `pickFolder` مرة أخرى واختر المجلد الصحيح. ثم نفّذ `pwd` وتأكد من المسار.

### "lg2: command not found"
A-Shell يحتاج تحديث. افتح App Store وحدّث التطبيق.

### "401 Unauthorized" أو "Bad credentials"
التوكن غير صالح أو منتهي الصلاحية. أنشئ توكن جديد من GitHub.

### "422 Validation Failed" عند إنشاء المستودع
المستودع `ScWeb` موجود سابقاً تحت حسابك. السكربت يتجاوز هذه المشكلة تلقائياً.

### الـ push يفشل
- تأكد أن التوكن له صلاحية `repo`
- تأكد من اتصال الإنترنت
- جرّب: `lg2 push origin master` لو الفرع اسمه master

### الصفحة لا تظهر بعد الرفع
- تحقق من تبويب Actions في المستودع، انتظر اكتمال البناء
- ادخل **Settings → Pages** وتأكد أن **Source** = **GitHub Actions**

---

## ملاحظات إضافية

- **التوكن آمن**: يُحفظ في `.git/config` داخل المجلد فقط، لا يُرسل لأي مكان آخر.

- **التحديث لاحقاً**: لو عدّلت ملفات، نفّذ في A-Shell:
  ```
  pickFolder
  lg2 add .
  lg2 commit -m "تحديث"
  lg2 push origin main
  ```

- **حذف التوكن من Git** بعد الرفع (للأمان):
  ```
  lg2 remote rm origin
  lg2 remote add origin https://github.com/JSOS-SA/ScWeb.git
  ```
  لكن ستحتاج التوكن مرة أخرى عند كل push.
