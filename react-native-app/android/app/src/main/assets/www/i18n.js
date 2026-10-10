(function () {
  'use strict';

  var translations = {
    en: {
      // General
      'app.title': 'Family Class & Activity Management System',
      'app.subtitle': 'Track classes, activities, schedules & monthly expenses for your children',
      'app.dbActive': 'Database Active',
      'status.loading': 'Loading...',
      'status.saved': '✓ Saved',
      'status.saveFailed': '✗ Save Failed',
      'status.dataLoaded': '✓ Data Loaded',
      'status.migrated': '✓ Previous data successfully migrated',
      'status.imported': '✓ Data imported successfully',
      'status.importFailed': '✗ Import failed. Invalid format',
      'pwa.installApp': '📲 Install App',
      'pwa.installed': '✓ Installed',

      // Family & Settings
      'settings.title': 'Family & General Settings',
      'settings.familyName': 'Family / Account Name',
      'settings.familyNamePlaceholder': 'e.g., Ahmed Family',
      'settings.currency': 'Currency',
      'settings.exportBackup': 'Backup Data (JSON)',
      'settings.importBackup': 'Restore Data (JSON)',
      'settings.resetConfirm': 'Are you sure you want to reset data?',

      // Children Management
      'children.title': 'Children Management',
      'children.subtitle': 'Add and manage children profiles and their specific activities',
      'children.addChild': 'Add Child',
      'children.editChild': 'Edit Child',
      'children.childName': 'Child Name',
      'children.childNamePlaceholder': 'e.g., Kareem, Sara, Omar...',
      'children.color': 'Theme Color',
      'children.noChildren': 'No children added yet. Click "Add Child" to get started!',
      'children.deleteConfirm': 'Are you sure you want to delete this child and all their classes?',
      'children.activitiesCount': '{count} Activities',
      'children.totalMonthly': 'This Month:',

      // Activities Management
      'activities.title': 'Activities & Pricing',
      'activities.addActivity': 'Add Activity',
      'activities.name': 'Activity / Subject Name',
      'activities.namePlaceholder': 'e.g., English, Swimming, Math, Piano...',
      'activities.price': 'Price per Session',
      'activities.instructor': 'Teacher / Coach (Optional)',
      'activities.instructorPlaceholder': 'e.g., Mr. Ahmed',
      'activities.noActivities': 'No activities defined for this child yet.',
      'activities.deleteConfirm': 'Are you sure you want to delete this activity?',
      'activities.defaultActivity': 'General Sessions',

      // Monthly Overview
      'monthlyOverview.title': 'Monthly Financial Overview',
      'monthlyOverview.selectMonth': 'Select Month:',
      'monthlyOverview.classesThisMonth': 'Sessions this month:',
      'monthlyOverview.monthlyTotal': 'Monthly total:',
      'monthlyOverview.totalClasses': 'Total Sessions (All Children):',
      'monthlyOverview.totalRevenue': 'Total Monthly Cost:',
      'monthlyOverview.filterChild': 'Filter by Child:',
      'monthlyOverview.allChildren': 'All Children',

      // Schedules
      'schedules.title': 'Weekly Recurring Schedules',
      'schedules.subtitle': 'Set up weekly recurring schedules to auto-generate all sessions for the month',
      'schedules.selectChild': 'Select Child',
      'schedules.selectActivity': 'Select Activity',
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
      'schedules.generateClasses': 'Generate Month Sessions',
      'schedules.generateAll': 'Generate for All Children',
      'schedules.noSchedules': 'No recurring schedules set',
      'schedules.remove': 'Remove',
      'schedules.at': 'at',

      // Extra Classes
      'extraClasses.title': 'Add Extra / Makeup Session',
      'extraClasses.subtitle': 'Add individual sessions outside the regular recurring schedule',
      'extraClasses.addClass': 'Add Session',
      'extraClasses.selectChild': 'Select Child',
      'extraClasses.selectActivity': 'Select Activity',
      'extraClasses.sessionPrice': 'Custom Price (optional)',

      // Class Details
      'classDetails.title': 'Session Logs & Attendance',
      'classDetails.noClasses': 'No sessions logged for this month',
      'classDetails.delete': 'Delete',
      'classDetails.at': 'at',
      'classDetails.statusCompleted': 'Completed',
      'classDetails.statusCancelled': 'Cancelled',
      'classDetails.statusScheduled': 'Scheduled',
      'classDetails.filterBy': 'Filter by Child:',

      // Reports
      'reports.title': 'Monthly Financial Reports & Invoices',
      'reports.childReport': '{name}\'s Report',
      'reports.download': 'Download Text Report',
      'reports.downloadCsv': 'Export CSV (Excel)',
      'reports.shareWhatsApp': 'Share via WhatsApp',
      'reports.print': 'Print / PDF',
      'reports.combined': 'Combined Family Monthly Report',
      'reports.downloadCombined': 'Download Combined Report',
      'reports.totalClasses': 'Total Sessions:',
      'reports.pricePerClass': 'Price per Session:',
      'reports.totalAmount': 'Total Amount:',
      'reports.classDetails': 'Session Details:',
      'reports.summary': 'Summary',
      'reports.generatedOn': 'Report generated on:',
      'reports.combinedTotalClasses': 'Total Sessions (All Children):',
      'reports.classes': 'Sessions:',
      'reports.total': 'Total:',
      'reports.byActivity': 'Breakdown by Activity:',

      // Alerts & validation
      'alert.enterName': 'Please enter a name',
      'alert.enterActivityName': 'Please enter an activity name and valid price',
      'alert.selectDayTime': 'Please select both day and time',
      'alert.selectDateTime': 'Please select both date and time',
      'alert.selectChild': 'Please select a child',
      'alert.selectActivity': 'Please select an activity',
      'alert.classExists': 'A session already exists for this date, time and child',
      'alert.noSchedules': 'No schedules set for {student}',
      'alert.generated': 'Generated {count} sessions for {student} in {month}',
      'alert.generatedAll': 'Generated {count} total sessions for all children in {month}',
      'alert.copiedWhatsApp': 'WhatsApp message text copied to clipboard!',

      // Legacy fallback keys
      'priceSettings.title': 'Price Settings',
      'priceSettings.kareemPrice': 'Kareem - Price per Class',
      'priceSettings.saraHanaPrice': 'Sara_Hana - Price per Class',
      'priceSettings.enterPrice': 'Enter price',
      'schedules.kareemSchedule': "Kareem's Schedule",
      'schedules.saraHanaSchedule': "Sara_Hana's Schedule",
      'classDetails.kareemClasses': "Kareem's Classes",
      'classDetails.saraHanaClasses': "Sara_Hana's Classes",
      'reports.kareemReport': "Kareem's Report",
      'reports.saraHanaReport': "Sara_Hana's Report",
      'student.kareem': 'Kareem',
      'student.saraHana': 'Sara_Hana',
      'lang.ariaLabel': 'Switch to Arabic / التحويل إلى العربية',
    },
    ar: {
      // General
      'app.title': 'نظام إدارة حصص وأنشطة الأسرة',
      'app.subtitle': 'متابعة الحصص، التمارين، الجداول الأسبوعية، والمصاريف الشهرية للأولاد',
      'app.dbActive': 'قاعدة البيانات نشطة',
      'status.loading': 'جارٍ التحميل...',
      'status.saved': '✓ تم الحفظ',
      'status.saveFailed': '✗ فشل الحفظ',
      'status.dataLoaded': '✓ تم تحميل البيانات',
      'status.migrated': '✓ تم ترحيل البيانات السابقة بنجاح',
      'status.imported': '✓ تم استيراد البيانات بنجاح',
      'status.importFailed': '✗ فشل الاستيراد. الملف غير صالح',
      'pwa.installApp': '📲 تثبيت التطبيق',
      'pwa.installed': '✓ التطبيق مثبت',

      // Family & Settings
      'settings.title': 'إعدادات الأسرة والتخصيص',
      'settings.familyName': 'اسم الأسرة / الحساب',
      'settings.familyNamePlaceholder': 'مثال: أسرة أحمد',
      'settings.currency': 'العملة',
      'settings.exportBackup': 'نسخ احتياطي (JSON)',
      'settings.importBackup': 'استعادة البيانات (JSON)',
      'settings.resetConfirm': 'هل أنت متأكد من رغبتك في إعادة تعيين البيانات؟',

      // Children Management
      'children.title': 'إدارة الأبناء',
      'children.subtitle': 'إضافة وتعديل بيانات الأبناء وتعيين الأنشطة والدروس الخاصة بكل ابن',
      'children.addChild': 'إضافة ابن جديد',
      'children.editChild': 'تعديل بيانات الابن',
      'children.childName': 'اسم الابن / الابنة',
      'children.childNamePlaceholder': 'مثال: كريم، سارة، عمر...',
      'children.color': 'لون التمييز',
      'children.noChildren': 'لم يتم إضافة أي أبناء بعد. اضغط على "إضافة ابن جديد" للبدء!',
      'children.deleteConfirm': 'هل أنت متأكد من حذف هذا الابن وجميع حصصه وأنشطته؟',
      'children.activitiesCount': '{count} أنشطة / مواد',
      'children.totalMonthly': 'هذا الشهر:',

      // Activities Management
      'activities.title': 'الأنشطة والمواد والأسعار',
      'activities.addActivity': 'إضافة نشاط / مادة',
      'activities.name': 'اسم النشاط أو المادة',
      'activities.namePlaceholder': 'مثال: لغة إنجليزية، سباحة، رياضيات، بيانو...',
      'activities.price': 'سعر الحصة / التمرين',
      'activities.instructor': 'اسم المعلم / المدرب (اختياري)',
      'activities.instructorPlaceholder': 'مثال: أ. محمد',
      'activities.noActivities': 'لا توجد أنشطة مسجلة بعد.',
      'activities.deleteConfirm': 'هل أنت متأكد من حذف هذا النشاط؟',
      'activities.defaultActivity': 'حصص عامة',

      // Monthly Overview
      'monthlyOverview.title': 'النظرة المالية الشهرية',
      'monthlyOverview.selectMonth': 'اختر الشهر:',
      'monthlyOverview.classesThisMonth': 'الحصص هذا الشهر:',
      'monthlyOverview.monthlyTotal': 'المجموع الشهري:',
      'monthlyOverview.totalClasses': 'إجمالي الحصص (لكل الأبناء):',
      'monthlyOverview.totalRevenue': 'إجمالي المصاريف المستحقة:',
      'monthlyOverview.filterChild': 'تصفية بالابن:',
      'monthlyOverview.allChildren': 'جميع الأبناء',

      // Schedules
      'schedules.title': 'الجداول الأسبوعية التلقائية',
      'schedules.subtitle': 'إعداد المواعيد الأسبوعية الثابتة لتوليد جميع حصص الشهر بنقرة واحدة',
      'schedules.selectChild': 'اختر الابن',
      'schedules.selectActivity': 'اختر النشاط / المادة',
      'schedules.addScheduleTitle': 'إضافة موعد أسبوعي',
      'schedules.selectDay': 'اختر اليوم',
      'schedules.monday': 'الاثنين',
      'schedules.tuesday': 'الثلاثاء',
      'schedules.wednesday': 'الأربعاء',
      'schedules.thursday': 'الخميس',
      'schedules.friday': 'الجمعة',
      'schedules.saturday': 'السبت',
      'schedules.sunday': 'الأحد',
      'schedules.addScheduleBtn': 'إضافة للجدول',
      'schedules.generateClasses': 'توليد حصص الشهر للابن',
      'schedules.generateAll': 'توليد لجميع الأبناء',
      'schedules.noSchedules': 'لا توجد مواعيد أسبوعية مسجلة',
      'schedules.remove': 'حذف',
      'schedules.at': 'الساعة',

      // Extra Classes
      'extraClasses.title': 'إضافة حصة / تمرين إضافي',
      'extraClasses.subtitle': 'إضافة حصص تعويضية أو جلسات فردية خارج الجدول الأسبوعي',
      'extraClasses.addClass': 'إضافة الحصة',
      'extraClasses.selectChild': 'اختر الابن',
      'extraClasses.selectActivity': 'اختر النشاط / المادة',
      'extraClasses.sessionPrice': 'سعر مخصص (اختياري)',

      // Class Details
      'classDetails.title': 'سجل الحصص والتمارين الشهرية',
      'classDetails.noClasses': 'لا توجد حصص مسجلة لهذا الشهر',
      'classDetails.delete': 'حذف',
      'classDetails.at': 'الساعة',
      'classDetails.statusCompleted': 'تمت',
      'classDetails.statusCancelled': 'ملغاة',
      'classDetails.statusScheduled': 'مجدولة',
      'classDetails.filterBy': 'عرض حسب الابن:',

      // Reports
      'reports.title': 'التقارير المالية الشهرية وكشف الحساب',
      'reports.childReport': 'تقرير {name}',
      'reports.download': 'تحميل تقرير نصي',
      'reports.downloadCsv': 'تصدير إكسيل (CSV)',
      'reports.shareWhatsApp': 'مشاركة عبر واتساب',
      'reports.print': 'طباعة / حفظ PDF',
      'reports.combined': 'التقرير المالي الشامل للأسرة',
      'reports.downloadCombined': 'تحميل التقرير الشامل',
      'reports.totalClasses': 'إجمالي الحصص:',
      'reports.pricePerClass': 'سعر الحصة:',
      'reports.totalAmount': 'المبلغ الإجمالي:',
      'reports.classDetails': 'تفاصيل الحصص:',
      'reports.summary': 'ملخص الحساب',
      'reports.generatedOn': 'تاريخ إنشاء التقرير:',
      'reports.combinedTotalClasses': 'إجمالي الحصص (لكل الأبناء):',
      'reports.classes': 'الحصص:',
      'reports.total': 'المجموع:',
      'reports.byActivity': 'التفصيل حسب المادة / النشاط:',

      // Alerts & validation
      'alert.enterName': 'الرجاء إدخال الاسم',
      'alert.enterActivityName': 'الرجاء إدخال اسم النشاط وسعر صحيح',
      'alert.selectDayTime': 'الرجاء تحديد اليوم والوقت',
      'alert.selectDateTime': 'الرجاء تحديد التاريخ والوقت',
      'alert.selectChild': 'الرجاء اختيار الابن',
      'alert.selectActivity': 'الرجاء اختيار النشاط / المادة',
      'alert.classExists': 'توجد حصة بالفعل في هذا التاريخ والوقت لهذا الابن',
      'alert.noSchedules': 'لا توجد جداول مسجلة لـ {student}',
      'alert.generated': 'تم توليد {count} حصة لـ {student} في {month}',
      'alert.generatedAll': 'تم توليد {count} حصة إجمالية لجميع الأبناء في {month}',
      'alert.copiedWhatsApp': 'تم نسخ نص الرسالة إلى الحافظة للمشاركة عبر واتساب!',

      // Legacy fallback keys
      'priceSettings.title': 'إعدادات الأسعار',
      'priceSettings.kareemPrice': 'كريم - سعر الحصة',
      'priceSettings.saraHanaPrice': 'سارة هناء - سعر الحصة',
      'priceSettings.enterPrice': 'أدخل السعر',
      'schedules.kareemSchedule': 'جدول كريم',
      'schedules.saraHanaSchedule': 'جدول سارة هناء',
      'classDetails.kareemClasses': 'حصص كريم',
      'classDetails.saraHanaClasses': 'حصص سارة هناء',
      'reports.kareemReport': 'تقرير كريم',
      'reports.saraHanaReport': 'تقرير سارة هناء',
      'student.kareem': 'كريم',
      'student.saraHana': 'سارة هناء',
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
    return localStorage.getItem(STORAGE_KEY) || 'ar'; // Default to Arabic for user friendliness
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
