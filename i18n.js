(function () {
  'use strict';

  var translations = {
    en: {
      'app.title': 'Student Class Management System',
      'app.dbActive': 'Database Active',
      'status.loading': 'Loading...',
      'status.saved': '✓ Saved',
      'status.saveFailed': '✗ Save Failed',
      'status.dataLoaded': '✓ Data Loaded',
      'priceSettings.title': 'Price Settings',
      'priceSettings.kareemPrice': 'Kareem - Price per Class',
      'priceSettings.saraHanaPrice': 'Sara_Hana - Price per Class',
      'priceSettings.enterPrice': 'Enter price',
      'monthlyOverview.title': 'Monthly Overview',
      'monthlyOverview.selectMonth': 'Select Month:',
      'monthlyOverview.classesThisMonth': 'Classes this month:',
      'monthlyOverview.monthlyTotal': 'Monthly total:',
      'monthlyOverview.totalClasses': 'Total Classes:',
      'monthlyOverview.totalRevenue': 'Total Revenue:',
      'schedules.title': 'Monthly Schedules',
      'schedules.kareemSchedule': "Kareem's Schedule",
      'schedules.saraHanaSchedule': "Sara_Hana's Schedule",
      'schedules.addScheduleTitle': 'Add Schedule',
      'schedules.selectDay': 'Select Day',
      'schedules.monday': 'Monday',
      'schedules.tuesday': 'Tuesday',
      'schedules.wednesday': 'Wednesday',
      'schedules.thursday': 'Thursday',
      'schedules.friday': 'Friday',
      'schedules.saturday': 'Saturday',
      'schedules.sunday': 'Sunday',
      'schedules.addScheduleBtn': 'Add Schedule',
      'schedules.generateClasses': 'Generate Classes',
      'schedules.noSchedules': 'No schedules set',
      'schedules.remove': 'Remove',
      'schedules.at': 'at',
      'extraClasses.title': 'Add Extra Classes',
      'extraClasses.addClass': 'Add Class',
      'classDetails.title': 'Class Details',
      'classDetails.kareemClasses': "Kareem's Classes",
      'classDetails.saraHanaClasses': "Sara_Hana's Classes",
      'classDetails.noClasses': 'No classes for this month',
      'classDetails.delete': 'Delete',
      'classDetails.at': 'at',
      'reports.title': 'Monthly Reports',
      'reports.kareemReport': "Kareem's Report",
      'reports.saraHanaReport': "Sara_Hana's Report",
      'reports.download': 'Download Report',
      'reports.combined': 'Combined Monthly Report',
      'reports.downloadCombined': 'Download Combined Report',
      'reports.totalClasses': 'Total Classes:',
      'reports.pricePerClass': 'Price per Class:',
      'reports.totalAmount': 'Total Amount:',
      'reports.classDetails': 'Class Details:',
      'reports.summary': 'Summary',
      'reports.generatedOn': 'Report generated on:',
      'reports.classes': 'Classes:',
      'reports.total': 'Total:',
      'student.kareem': 'Kareem',
      'student.saraHana': 'Sara_Hana',
      'alert.selectDayTime': 'Please select both day and time',
      'alert.selectDateTime': 'Please select both date and time',
      'alert.classExists': 'A class already exists for this date and time',
      'alert.noSchedules': 'No schedules set for {student}',
      'alert.generated': 'Generated {count} classes for {student} in {month}',
      'lang.ariaLabel': 'Switch to Arabic / التحويل إلى العربية',
    },
    ar: {
      'app.title': 'نظام إدارة الفصول الدراسية',
      'app.dbActive': 'قاعدة البيانات نشطة',
      'status.loading': 'جارٍ التحميل...',
      'status.saved': '✓ تم الحفظ',
      'status.saveFailed': '✗ فشل الحفظ',
      'status.dataLoaded': '✓ تم تحميل البيانات',
      'priceSettings.title': 'إعدادات الأسعار',
      'priceSettings.kareemPrice': 'كريم - سعر الحصة',
      'priceSettings.saraHanaPrice': 'سارة هناء - سعر الحصة',
      'priceSettings.enterPrice': 'أدخل السعر',
      'monthlyOverview.title': 'النظرة الشهرية',
      'monthlyOverview.selectMonth': 'اختر الشهر:',
      'monthlyOverview.classesThisMonth': 'الحصص هذا الشهر:',
      'monthlyOverview.monthlyTotal': 'المجموع الشهري:',
      'monthlyOverview.totalClasses': 'إجمالي الحصص:',
      'monthlyOverview.totalRevenue': 'إجمالي الإيرادات:',
      'schedules.title': 'الجداول الشهرية',
      'schedules.kareemSchedule': 'جدول كريم',
      'schedules.saraHanaSchedule': 'جدول سارة هناء',
      'schedules.addScheduleTitle': 'إضافة جدول',
      'schedules.selectDay': 'اختر اليوم',
      'schedules.monday': 'الاثنين',
      'schedules.tuesday': 'الثلاثاء',
      'schedules.wednesday': 'الأربعاء',
      'schedules.thursday': 'الخميس',
      'schedules.friday': 'الجمعة',
      'schedules.saturday': 'السبت',
      'schedules.sunday': 'الأحد',
      'schedules.addScheduleBtn': 'إضافة جدول',
      'schedules.generateClasses': 'توليد الحصص',
      'schedules.noSchedules': 'لا توجد جداول',
      'schedules.remove': 'حذف',
      'schedules.at': 'الساعة',
      'extraClasses.title': 'إضافة حصص إضافية',
      'extraClasses.addClass': 'إضافة حصة',
      'classDetails.title': 'تفاصيل الحصص',
      'classDetails.kareemClasses': 'حصص كريم',
      'classDetails.saraHanaClasses': 'حصص سارة هناء',
      'classDetails.noClasses': 'لا توجد حصص هذا الشهر',
      'classDetails.delete': 'حذف',
      'classDetails.at': 'الساعة',
      'reports.title': 'التقارير الشهرية',
      'reports.kareemReport': 'تقرير كريم',
      'reports.saraHanaReport': 'تقرير سارة هناء',
      'reports.download': 'تحميل التقرير',
      'reports.combined': 'التقرير الشهري المشترك',
      'reports.downloadCombined': 'تحميل التقرير المشترك',
      'reports.totalClasses': 'إجمالي الحصص:',
      'reports.pricePerClass': 'سعر الحصة:',
      'reports.totalAmount': 'المبلغ الإجمالي:',
      'reports.classDetails': 'تفاصيل الحصص:',
      'reports.summary': 'ملخص',
      'reports.generatedOn': 'تاريخ إنشاء التقرير:',
      'reports.classes': 'الحصص:',
      'reports.total': 'المجموع:',
      'student.kareem': 'كريم',
      'student.saraHana': 'سارة هناء',
      'alert.selectDayTime': 'الرجاء تحديد اليوم والوقت',
      'alert.selectDateTime': 'الرجاء تحديد التاريخ والوقت',
      'alert.classExists': 'توجد حصة بالفعل في هذا التاريخ والوقت',
      'alert.noSchedules': 'لا توجد جداول لـ {student}',
      'alert.generated': 'تم توليد {count} حصة لـ {student} في {month}',
      'lang.ariaLabel': 'Switch to English / التحويل إلى الإنجليزية',
    },
  };

  var STORAGE_KEY = 'anubisland-lang';

  function t(key, params) {
    var lang = getCurrentLang();
    var str =
      (translations[lang] && translations[lang][key]) ||
      (translations['en'] && translations['en'][key]) ||
      key;
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, function (_, k) {
      return params[k] !== undefined ? params[k] : '{' + k + '}';
    });
  }

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function setLanguage(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
  }

  function applyLanguage(lang) {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    if (lang === 'ar') {
      html.classList.add('lang-ar');
      html.classList.remove('lang-en');
    } else {
      html.classList.add('lang-en');
      html.classList.remove('lang-ar');
    }

    render();
    _updateToggle(lang);
    document.title = t('app.title');

    // Notify script.js that language changed so dynamic content re-renders
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function _updateToggle(lang) {
    var toggle = document.getElementById('langToggle');
    if (!toggle) return;
    toggle.setAttribute('aria-label', t('lang.ariaLabel'));
    toggle.setAttribute('aria-checked', lang === 'ar' ? 'true' : 'false');

    var enLabel = toggle.querySelector('.lang-label-en');
    var arLabel = toggle.querySelector('.lang-label-ar');
    if (enLabel) {
      enLabel.style.fontWeight = lang === 'en' ? '700' : '400';
      enLabel.style.color = lang === 'en' ? '#1d4ed8' : '#6b7280';
    }
    if (arLabel) {
      arLabel.style.fontWeight = lang === 'ar' ? '700' : '400';
      arLabel.style.color = lang === 'ar' ? '#1d4ed8' : '#6b7280';
    }
  }

  function render() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-option]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n-option'));
    });
  }

  function init() {
    applyLanguage(getCurrentLang());
  }

  window.i18n = { t: t, setLanguage: setLanguage, getCurrentLang: getCurrentLang, render: render, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
