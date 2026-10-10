import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Alert,
  Share,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Provider as PaperProvider,
  DefaultTheme,
  Appbar,
  Card,
  Text,
  Button,
  TextInput,
  Chip,
  Portal,
  Modal,
  Surface,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHILD_PALETTES = [
  { bg: '#EFF6FF', border: '#BFDBFE', accent: '#2563EB', text: '#1E3A8A', badge: '#DBEAFE' }, // Blue
  { bg: '#FDF2F8', border: '#FBCFE8', accent: '#DB2777', text: '#831843', badge: '#FCE7F3' }, // Pink
  { bg: '#ECFDF5', border: '#A7F3D0', accent: '#059669', text: '#064E3B', badge: '#D1FAE5' }, // Emerald
  { bg: '#FFFBEB', border: '#FDE68A', accent: '#D97706', text: '#78350F', badge: '#FEF3C7' }, // Amber
  { bg: '#FAF5FF', border: '#E9D5FF', accent: '#7C3AED', text: '#581C87', badge: '#F3E8FF' }, // Purple
  { bg: '#FFF1F2', border: '#FECDD3', accent: '#E11D48', text: '#881337', badge: '#FFE4E6' }, // Rose
  { bg: '#F0F9FF', border: '#BAE6FD', accent: '#0284C7', text: '#0C4A6E', badge: '#E0F2FE' }, // Sky
];

const getChildPalette = (index) => CHILD_PALETTES[index % CHILD_PALETTES.length];

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2563EB',
    secondary: '#EC4899',
    surface: '#FFFFFF',
    background: '#F8FAFC',
  },
};

const DAYS_OF_WEEK = [
  { id: 'Sunday', ar: 'الأحد' },
  { id: 'Monday', ar: 'الاثنين' },
  { id: 'Tuesday', ar: 'الثلاثاء' },
  { id: 'Wednesday', ar: 'الأربعاء' },
  { id: 'Thursday', ar: 'الخميس' },
  { id: 'Friday', ar: 'الجمعة' },
  { id: 'Saturday', ar: 'السبت' },
];

const StudentClassManagementApp = () => {
  // State
  const [settings, setSettings] = useState({ familyName: '', currency: 'EGP' });
  const [children, setChildren] = useState([
    { id: 'kareem', name: 'كريم (Kareem)', color: '#3B82F6' },
    { id: 'saraHana', name: 'سارة هناء (Sara_Hana)', color: '#EC4899' },
  ]);
  const [activities, setActivities] = useState([
    { id: 'act_1', childId: 'kareem', name: 'لغة إنجليزية', price: 50 },
    { id: 'act_2', childId: 'saraHana', name: 'رياضيات', price: 50 },
  ]);
  const [classes, setClasses] = useState({});
  const [schedules, setSchedules] = useState({});
  const [currentMonth, setCurrentMonth] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [childNameInput, setChildNameInput] = useState('');

  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [activityChildId, setActivityChildId] = useState('');
  const [activityNameInput, setActivityNameInput] = useState('');
  const [activityPriceInput, setActivityPriceInput] = useState('50');

  const [classModalVisible, setClassModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('kareem');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [newClassDate, setNewClassDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedScheduleTime, setSelectedScheduleTime] = useState('16:00');
  const [customPriceInput, setCustomPriceInput] = useState('');

  const [familyNameInput, setFamilyNameInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('EGP');

  const [expandedClasses, setExpandedClasses] = useState({});

  const toggleClassDetails = (studentId) => {
    setExpandedClasses((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setSaveStatus('جاري التحميل...');
      await loadData();
      setCurrentMonthToNow();
      setSaveStatus('✓ جاهز');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Initialization error:', error);
      setSaveStatus('✗ خطأ في التحميل');
    } finally {
      setLoading(false);
    }
  };

  const saveToDatabase = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setSaveStatus('✓ تم الحفظ');
      setTimeout(() => setSaveStatus(''), 1500);
      return true;
    } catch (error) {
      console.error(`[SAVE] Error saving ${key}:`, error);
      setSaveStatus('✗ فشل الحفظ');
      return false;
    }
  };

  const loadFromDatabase = async (key, defaultValue = null) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Load error:', error);
      return defaultValue;
    }
  };

  const loadData = async () => {
    const savedChildren = await loadFromDatabase('family_children', null);
    const savedActivities = await loadFromDatabase('family_activities', null);
    const savedSettings = await loadFromDatabase('family_settings', null);
    const savedClasses = await loadFromDatabase('family_classes', null);
    const savedSchedules = await loadFromDatabase('family_schedules', null);

    if (savedChildren && Array.isArray(savedChildren) && savedChildren.length > 0) {
      const s = savedSettings || { familyName: '', currency: 'EGP' };
      setSettings(s);
      setFamilyNameInput(s.familyName || '');
      setCurrencyInput(s.currency || 'EGP');
      setChildren(savedChildren);
      setActivities(savedActivities || []);
      setClasses(savedClasses || {});
      setSchedules(savedSchedules || {});
      setSelectedStudent(savedChildren[0].id);
    } else {
      const defChildren = [
        { id: 'kareem', name: 'كريم (Kareem)', color: '#3B82F6' },
        { id: 'saraHana', name: 'سارة هناء (Sara_Hana)', color: '#EC4899' },
      ];
      const defActs = [
        { id: 'act_1', childId: 'kareem', name: 'لغة إنجليزية', price: 50 },
        { id: 'act_2', childId: 'saraHana', name: 'رياضيات', price: 50 },
      ];
      setChildren(defChildren);
      setActivities(defActs);
      setSelectedStudent('kareem');
      await saveToDatabase('family_children', defChildren);
      await saveToDatabase('family_activities', defActs);
    }
  };

  const persistAll = async (newChildren, newActs, newClasses, newSchedules, newSettings) => {
    if (newChildren) await saveToDatabase('family_children', newChildren);
    if (newActs) await saveToDatabase('family_activities', newActs);
    if (newClasses) await saveToDatabase('family_classes', newClasses);
    if (newSchedules) await saveToDatabase('family_schedules', newSchedules);
    if (newSettings) await saveToDatabase('family_settings', newSettings);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMonthName = (monthString) => {
    if (!monthString) return '';
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
  };

  const setCurrentMonthToNow = () => {
    const now = new Date();
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthString);
  };

  const navigateMonth = (direction) => {
    const [year, month] = (currentMonth || '2026-10').split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);
    const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
  };

  const formatMoney = (amount) => {
    const curr = settings?.currency || 'EGP';
    return `${Number(amount || 0).toFixed(2)} ${curr}`;
  };

  const getChildById = (id) => children.find((c) => c.id === id);
  const getChildActivities = (childId) => activities.filter((a) => a.childId === childId);
  const getActivityById = (id) => activities.find((a) => a.id === id);

  const getChildDefaultPrice = (childId) => {
    const childActs = getChildActivities(childId);
    return childActs.length > 0 ? childActs[0].price : 50;
  };

  // Child CRUD
  const openAddChildModal = () => {
    setEditingChildId(null);
    setChildNameInput('');
    setChildModalVisible(true);
  };

  const openEditChildModal = (child) => {
    setEditingChildId(child.id);
    setChildNameInput(child.name);
    setChildModalVisible(true);
  };

  const saveChild = async () => {
    if (!childNameInput.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الابن/الابنة');
      return;
    }

    let updated;
    if (editingChildId) {
      updated = children.map((c) =>
        c.id === editingChildId ? { ...c, name: childNameInput.trim() } : c
      );
    } else {
      const newId = 'child_' + Date.now();
      const newChild = { id: newId, name: childNameInput.trim() };
      updated = [...children, newChild];

      const newAct = { id: 'act_' + Date.now(), childId: newId, name: 'دروس عامة', price: 50 };
      const updatedActs = [...activities, newAct];
      setActivities(updatedActs);
      await saveToDatabase('family_activities', updatedActs);
    }

    setChildren(updated);
    await saveToDatabase('family_children', updated);
    setChildModalVisible(false);
    setEditingChildId(null);
    setChildNameInput('');
  };

  const deleteChild = (childId) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الابن وجميع حصصه وجداوله؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const updatedChildren = children.filter((c) => c.id !== childId);
          const updatedActs = activities.filter((a) => a.childId !== childId);
          const updatedClasses = { ...classes };
          delete updatedClasses[childId];
          const updatedSchedules = { ...schedules };
          delete updatedSchedules[childId];

          setChildren(updatedChildren);
          setActivities(updatedActs);
          setClasses(updatedClasses);
          setSchedules(updatedSchedules);

          await persistAll(updatedChildren, updatedActs, updatedClasses, updatedSchedules, null);
        },
      },
    ]);
  };

  // Activity CRUD
  const openAddActivityModal = (childId) => {
    setActivityChildId(childId);
    setActivityNameInput('');
    setActivityPriceInput('50');
    setActivityModalVisible(true);
  };

  const saveActivity = async () => {
    if (!activityNameInput.trim() || isNaN(parseFloat(activityPriceInput))) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم النشاط وسعر صحيح');
      return;
    }

    const newAct = {
      id: 'act_' + Date.now(),
      childId: activityChildId || selectedStudent,
      name: activityNameInput.trim(),
      price: parseFloat(activityPriceInput),
    };

    const updated = [...activities, newAct];
    setActivities(updated);
    await saveToDatabase('family_activities', updated);
    setActivityModalVisible(false);
    setActivityNameInput('');
    setActivityPriceInput('50');
  };

  const deleteActivity = async (actId) => {
    Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا النشاط؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const updated = activities.filter((a) => a.id !== actId);
          setActivities(updated);
          await saveToDatabase('family_activities', updated);
        },
      },
    ]);
  };

  // Extra Class
  const openAddClassModal = (childId) => {
    setSelectedStudent(childId);
    const childActs = getChildActivities(childId);
    setSelectedActivityId(childActs.length > 0 ? childActs[0].id : '');
    setCustomPriceInput('');
    setNewClassDate(new Date());
    setClassModalVisible(true);
  };

  const addClass = async () => {
    const dateStr = formatDate(newClassDate);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentClasses = { ...classes };
    if (!currentClasses[selectedStudent]) {
      currentClasses[selectedStudent] = [];
    }

    const childActs = getChildActivities(selectedStudent);
    const actId = selectedActivityId || (childActs.length > 0 ? childActs[0].id : '');
    const act = getActivityById(actId);
    const price = customPriceInput ? parseFloat(customPriceInput) : act ? act.price : getChildDefaultPrice(selectedStudent);

    const newClass = {
      id: Date.now(),
      childId: selectedStudent,
      activityId: actId,
      date: dateStr,
      time: timeStr,
      price: price,
      status: 'completed',
    };

    currentClasses[selectedStudent].push(newClass);
    setClasses(currentClasses);
    await saveToDatabase('family_classes', currentClasses);
    setClassModalVisible(false);
    setCustomPriceInput('');
    Alert.alert('تمت الإضافة', 'تم تسجيل الحصة بنجاح');
  };

  const removeClass = async (studentId, classId) => {
    Alert.alert('حذف الحصة', 'هل تريد حذف هذه الحصة المسجلة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          const currentClasses = { ...classes };
          if (currentClasses[studentId]) {
            currentClasses[studentId] = currentClasses[studentId].filter((c) => c.id !== classId);
            setClasses(currentClasses);
            await saveToDatabase('family_classes', currentClasses);
          }
        },
      },
    ]);
  };

  // Auto generate classes from schedules
  const generateMonthlyClasses = async (studentId) => {
    const studentSchedules = schedules[studentId] || [];
    const child = getChildById(studentId);
    const childName = child ? child.name : studentId;

    if (studentSchedules.length === 0) {
      Alert.alert('تنبيه', `لا توجد مواعيد أسبوعية مسجلة لـ ${childName}.\nيرجى إضافة جدول أسبوعي أولاً.`);
      return;
    }

    const [year, month] = (currentMonth || '2026-10').split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    let generatedCount = 0;
    const currentClasses = { ...classes };
    if (!currentClasses[studentId]) currentClasses[studentId] = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      studentSchedules.forEach((sch) => {
        if (dayMap[sch.day] === dayOfWeek) {
          const dateStr = formatDate(d);
          const exists = currentClasses[studentId].some((c) => c.date === dateStr && c.time === sch.time);
          if (!exists) {
            const act = getActivityById(sch.activityId);
            const price = act ? act.price : getChildDefaultPrice(studentId);
            currentClasses[studentId].push({
              id: Date.now() + Math.random(),
              childId: studentId,
              activityId: sch.activityId,
              date: dateStr,
              time: sch.time,
              price: price,
              status: 'completed',
            });
            generatedCount++;
          }
        }
      });
    }

    setClasses(currentClasses);
    await saveToDatabase('family_classes', currentClasses);
    Alert.alert('تم بنجاح', `تم توليد ${generatedCount} حصة لـ ${childName} في شهر ${getMonthName(currentMonth)}`);
  };

  // Schedule CRUD
  const openAddScheduleModal = () => {
    if (children.length === 0) {
      Alert.alert('تنبيه', 'يرجى إضافة طالب أولاً');
      return;
    }
    setSelectedStudent(children[0].id);
    const childActs = getChildActivities(children[0].id);
    setSelectedActivityId(childActs.length > 0 ? childActs[0].id : '');
    setSelectedDay('Monday');
    setSelectedScheduleTime('16:00');
    setScheduleModalVisible(true);
  };

  const addSchedule = async () => {
    const childActs = getChildActivities(selectedStudent);
    const actId = selectedActivityId || (childActs.length > 0 ? childActs[0].id : '');

    const newSchedule = {
      id: Date.now(),
      childId: selectedStudent,
      activityId: actId,
      day: selectedDay,
      time: selectedScheduleTime,
    };

    const currentSchedules = { ...schedules };
    if (!currentSchedules[selectedStudent]) {
      currentSchedules[selectedStudent] = [];
    }
    currentSchedules[selectedStudent].push(newSchedule);

    setSchedules(currentSchedules);
    await saveToDatabase('family_schedules', currentSchedules);
    setScheduleModalVisible(false);
    Alert.alert('تم بنجاح', 'تمت إضافة الموعد الأسبوعي إلى الجدول');
  };

  const removeSchedule = async (studentId, scheduleId) => {
    const currentSchedules = { ...schedules };
    if (currentSchedules[studentId]) {
      currentSchedules[studentId] = currentSchedules[studentId].filter((s) => s.id !== scheduleId);
      setSchedules(currentSchedules);
      await saveToDatabase('family_schedules', currentSchedules);
    }
  };

  // Settings
  const saveSettings = async () => {
    const updated = {
      familyName: familyNameInput.trim(),
      currency: currencyInput.trim() || 'EGP',
    };
    setSettings(updated);
    await saveToDatabase('family_settings', updated);
    setSettingsModalVisible(false);
    Alert.alert('تم الحفظ', 'تم تحديث الإعدادات بنجاح');
  };

  // Helpers
  const getMonthlyClasses = (studentId) => {
    if (!classes[studentId]) return [];
    return classes[studentId]
      .filter((c) => c.date && c.date.startsWith(currentMonth))
      .sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')) - new Date(a.date + 'T' + (a.time || '00:00')));
  };

  const getStudentMonthlyTotal = (studentId) => {
    const list = getMonthlyClasses(studentId);
    return list.reduce((sum, c) => sum + (c.price || getChildDefaultPrice(studentId)), 0);
  };

  const getTotalMonthlyClassesCount = () => {
    return children.reduce((sum, child) => sum + getMonthlyClasses(child.id).length, 0);
  };

  const getTotalMonthlyRevenue = () => {
    return children.reduce((sum, child) => sum + getStudentMonthlyTotal(child.id), 0);
  };

  const shareMonthlyReport = async () => {
    let text = `📅 تقرير الحصص والأنشطة - ${getMonthName(currentMonth)}\n`;
    if (settings.familyName) text += `🏠 ${settings.familyName}\n`;
    text += `===================================\n\n`;

    children.forEach((child) => {
      const list = getMonthlyClasses(child.id);
      const total = getStudentMonthlyTotal(child.id);
      text += `👤 ${child.name}\n`;
      text += `إجمالي الحصص: ${list.length}\n`;
      text += `المجموع: ${formatMoney(total)}\n`;
      if (list.length > 0) {
        list.forEach((c, idx) => {
          const act = getActivityById(c.activityId);
          const actName = act ? `[${act.name}] ` : '';
          text += `  ${idx + 1}. ${c.date} ${c.time ? '@ ' + c.time : ''} ${actName}(${formatMoney(c.price)})\n`;
        });
      }
      text += `-----------------------------------\n\n`;
    });

    text += `📊 المجموع الكلي للأسرة: ${formatMoney(getTotalMonthlyRevenue())} (${getTotalMonthlyClassesCount()} حصة)\n`;

    try {
      await Share.share({ message: text, title: 'تقرير المصاريف والحصص الشهرية' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Top App Header */}
        <View style={styles.topBar}>
          <View style={styles.topBarRight}>
            <Text style={styles.appTitle}>
              {settings.familyName ? settings.familyName : 'متابعة حصص الأسرة'}
            </Text>
            {saveStatus ? <Text style={styles.saveBadge}>{saveStatus}</Text> : null}
          </View>
          <View style={styles.topBarLeft}>
            <TouchableOpacity
              style={styles.headerBtnSecondary}
              onPress={() => setSettingsModalVisible(true)}
            >
              <Text style={styles.headerBtnText}>⚙️ إعدادات</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerBtnPrimary}
              onPress={openAddChildModal}
            >
              <Text style={styles.headerBtnPrimaryText}>➕ إضافة ابن</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Month Selector Card */}
          <View style={styles.monthCard}>
            <View style={styles.monthHeaderRow}>
              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => navigateMonth(1)}
              >
                <Text style={styles.monthNavBtnText}>◀ التالي</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={setCurrentMonthToNow} style={styles.monthTitleWrap}>
                <Text style={styles.monthTitleText}>{getMonthName(currentMonth)}</Text>
                <Text style={styles.monthSubHint}>اضغط للعودة للشهر الحالي</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.monthNavBtn}
                onPress={() => navigateMonth(-1)}
              >
                <Text style={styles.monthNavBtnText}>السابق ▶</Text>
              </TouchableOpacity>
            </View>

            {/* Total Dark Summary Banner */}
            <View style={styles.summaryBanner}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>إجمالي الحصص</Text>
                <Text style={styles.summaryValue}>{getTotalMonthlyClassesCount()}</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>المبلغ الإجمالي المستحق</Text>
                <Text style={[styles.summaryValue, styles.summaryRevenue]}>
                  {formatMoney(getTotalMonthlyRevenue())}
                </Text>
              </View>
            </View>
          </View>

          {/* Children List */}
          {children.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.emptyTitle}>لا يوجد أبناء مسجلين حتى الآن</Text>
              <Text style={styles.emptySubtitle}>اضغط على زر "إضافة ابن" بالأعلى للبدء</Text>
              <TouchableOpacity style={styles.bigAddBtn} onPress={openAddChildModal}>
                <Text style={styles.bigAddBtnText}>➕ إضافة ابن جديد</Text>
              </TouchableOpacity>
            </View>
          ) : (
            children.map((child, index) => {
              const palette = getChildPalette(index);
              const monthlyClasses = getMonthlyClasses(child.id);
              const childTotal = getStudentMonthlyTotal(child.id);
              const childActs = getChildActivities(child.id);
              const childSchedules = schedules[child.id] || [];
              const isExpanded = !!expandedClasses[child.id];

              return (
                <View
                  key={child.id}
                  style={[
                    styles.childCard,
                    {
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  {/* Child Top Bar */}
                  <View style={styles.childHeaderRow}>
                    <View style={styles.childAvatarWrap}>
                      <View style={[styles.childAvatar, { backgroundColor: palette.accent }]}>
                        <Text style={styles.childAvatarText}>
                          {child.name.trim().charAt(0) || '👤'}
                        </Text>
                      </View>
                      <View style={styles.childNameBox}>
                        <Text style={[styles.childNameTitle, { color: palette.text }]}>
                          {child.name}
                        </Text>
                        <Text style={styles.childSubtitle}>
                          {monthlyClasses.length} حصة مسجلة هذا الشهر
                        </Text>
                      </View>
                    </View>

                    {/* Child Price Badge & Edit Actions */}
                    <View style={styles.childTopRight}>
                      <View style={[styles.priceBadge, { backgroundColor: palette.badge, borderColor: palette.border }]}>
                        <Text style={[styles.priceBadgeText, { color: palette.text }]}>
                          {formatMoney(childTotal)}
                        </Text>
                      </View>
                      <View style={styles.childMiniActions}>
                        <TouchableOpacity
                          style={styles.miniIconBtn}
                          onPress={() => openEditChildModal(child)}
                        >
                          <Text style={styles.miniIconText}>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.miniIconBtn}
                          onPress={() => deleteChild(child.id)}
                        >
                          <Text style={styles.miniIconText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Activities Pills */}
                  <View style={styles.activitiesContainer}>
                    <Text style={styles.sectionMiniTitle}>الأنشطة والأسعار:</Text>
                    <View style={styles.actPillsRow}>
                      {childActs.map((act) => (
                        <TouchableOpacity
                          key={act.id}
                          style={styles.actPill}
                          onPress={() => deleteActivity(act.id)}
                        >
                          <Text style={styles.actPillText}>
                            {act.name} ({formatMoney(act.price)}) ✕
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={styles.addActPill}
                        onPress={() => openAddActivityModal(child.id)}
                      >
                        <Text style={styles.addActPillText}>➕ إضافة مادة</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Schedules Preview */}
                  {childSchedules.length > 0 && (
                    <View style={styles.schedulePreviewRow}>
                      <Text style={styles.schedulePreviewTitle}>المواعيد الأسبوعية:</Text>
                      <View style={styles.scheduleChipsWrap}>
                        {childSchedules.map((sch) => {
                          const dayObj = DAYS_OF_WEEK.find((d) => d.id === sch.day);
                          const dayName = dayObj ? dayObj.ar : sch.day;
                          const act = getActivityById(sch.activityId);
                          return (
                            <View key={sch.id} style={styles.scheduleBadge}>
                              <Text style={styles.scheduleBadgeText}>
                                🗓️ {dayName} {sch.time} {act ? `(${act.name})` : ''}
                              </Text>
                              <TouchableOpacity onPress={() => removeSchedule(child.id, sch.id)}>
                                <Text style={styles.scheduleDeleteText}> ✕</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  )}

                  {/* Child Action Buttons */}
                  <View style={styles.childActionButtonsRow}>
                    <TouchableOpacity
                      style={[styles.btnAction, styles.btnActionPrimary, { backgroundColor: palette.accent }]}
                      onPress={() => openAddClassModal(child.id)}
                    >
                      <Text style={styles.btnActionPrimaryText}>➕ إضافة حصة</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btnAction, styles.btnActionSecondary]}
                      onPress={() => generateMonthlyClasses(child.id)}
                    >
                      <Text style={styles.btnActionSecondaryText}>⚡ توليد تلقائي</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btnAction, styles.btnActionOutline]}
                      onPress={() => toggleClassDetails(child.id)}
                    >
                      <Text style={styles.btnActionOutlineText}>
                        {isExpanded ? '▲ إخفاء السجل' : `▼ سجل الحصص (${monthlyClasses.length})`}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Expanded Session Logs */}
                  {isExpanded && (
                    <View style={styles.classesLogContainer}>
                      <Divider style={styles.logDivider} />
                      <Text style={styles.logHeaderTitle}>
                        سجل حصص {child.name} لشهر {getMonthName(currentMonth)}:
                      </Text>

                      {monthlyClasses.length === 0 ? (
                        <Text style={styles.emptyLogText}>لا توجد حصص مسجلة في هذا الشهر</Text>
                      ) : (
                        monthlyClasses.map((cls, idx) => {
                          const act = getActivityById(cls.activityId);
                          return (
                            <View key={cls.id || idx} style={styles.classLogRow}>
                              <View style={styles.classLogInfo}>
                                <Text style={styles.classLogDate}>
                                  🗓️ {cls.date} {cls.time ? ` الساعة ${cls.time}` : ''}
                                </Text>
                                <Text style={styles.classLogAct}>
                                  {act ? `مادة: ${act.name}` : 'حصة عامة'}
                                </Text>
                              </View>
                              <View style={styles.classLogEnd}>
                                <Text style={styles.classLogPrice}>{formatMoney(cls.price)}</Text>
                                <TouchableOpacity
                                  style={styles.deleteClassBtn}
                                  onPress={() => removeClass(child.id, cls.id)}
                                >
                                  <Text style={styles.deleteClassBtnText}>🗑️</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Bottom Global Actions */}
          <View style={styles.globalActionsRow}>
            <TouchableOpacity
              style={styles.globalBtnPrimary}
              onPress={openAddScheduleModal}
            >
              <Text style={styles.globalBtnPrimaryText}>🗓️ إضافة موعد بالجدول الأسبوعي</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.globalBtnSecondary}
              onPress={shareMonthlyReport}
            >
              <Text style={styles.globalBtnSecondaryText}>📤 مشاركة التقرير عبر واتساب</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal: Add/Edit Child */}
        <Portal>
          <Modal
            visible={childModalVisible}
            onDismiss={() => setChildModalVisible(false)}
            contentContainerStyle={styles.modalCard}
          >
            <Text style={styles.modalHeading}>
              {editingChildId ? '✏️ تعديل بيانات الابن' : '➕ إضافة ابن/ابنة جديد'}
            </Text>
            <Text style={styles.inputLabel}>اسم الابن / الابنة:</Text>
            <RNTextInput
              value={childNameInput}
              onChangeText={setChildNameInput}
              placeholder="مثال: أحمد، مريم"
              style={styles.nativeInput}
            />
            <View style={styles.modalBtnsRow}>
              <Button mode="contained" onPress={saveChild} style={styles.modalSaveBtn}>
                حفظ
              </Button>
              <Button mode="outlined" onPress={() => setChildModalVisible(false)}>
                إلغاء
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Modal: Add Activity */}
        <Portal>
          <Modal
            visible={activityModalVisible}
            onDismiss={() => setActivityModalVisible(false)}
            contentContainerStyle={styles.modalCard}
          >
            <Text style={styles.modalHeading}>➕ إضافة مادة / نشاط</Text>
            <Text style={styles.inputLabel}>اسم المادة أو النشاط:</Text>
            <RNTextInput
              value={activityNameInput}
              onChangeText={setActivityNameInput}
              placeholder="مثال: لغة فرنسية، سباحة، بيانو"
              style={styles.nativeInput}
            />
            <Text style={styles.inputLabel}>سعر الحصة / الجلسة ({settings.currency}):</Text>
            <RNTextInput
              value={activityPriceInput}
              onChangeText={setActivityPriceInput}
              keyboardType="numeric"
              placeholder="50"
              style={styles.nativeInput}
            />
            <View style={styles.modalBtnsRow}>
              <Button mode="contained" onPress={saveActivity} style={styles.modalSaveBtn}>
                حفظ النشاط
              </Button>
              <Button mode="outlined" onPress={() => setActivityModalVisible(false)}>
                إلغاء
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Modal: Add Extra Class */}
        <Portal>
          <Modal
            visible={classModalVisible}
            onDismiss={() => setClassModalVisible(false)}
            contentContainerStyle={styles.modalCard}
          >
            <Text style={styles.modalHeading}>➕ تسجيل حصة منفردة</Text>
            <Text style={styles.modalNotice}>
              تسجيل حصة لـ {getChildById(selectedStudent)?.name} بتاريخ اليوم: {formatDate(newClassDate)}
            </Text>

            <Text style={styles.inputLabel}>اختر المادة:</Text>
            <View style={styles.choiceChipsWrap}>
              {getChildActivities(selectedStudent).map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={[
                    styles.choiceChipItem,
                    selectedActivityId === act.id && styles.choiceChipSelected,
                  ]}
                  onPress={() => setSelectedActivityId(act.id)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      selectedActivityId === act.id && styles.choiceChipTextSelected,
                    ]}
                  >
                    {act.name} ({formatMoney(act.price)})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>سعر مخصص (اتركه فارغاً للسعر الافتراضي):</Text>
            <RNTextInput
              value={customPriceInput}
              onChangeText={setCustomPriceInput}
              keyboardType="numeric"
              placeholder="سعر افتراضي للمادة"
              style={styles.nativeInput}
            />

            <View style={styles.modalBtnsRow}>
              <Button mode="contained" onPress={addClass} style={styles.modalSaveBtn}>
                تأكيد تسجيل الحصة
              </Button>
              <Button mode="outlined" onPress={() => setClassModalVisible(false)}>
                إلغاء
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Modal: Add Schedule */}
        <Portal>
          <Modal
            visible={scheduleModalVisible}
            onDismiss={() => setScheduleModalVisible(false)}
            contentContainerStyle={styles.modalCard}
          >
            <Text style={styles.modalHeading}>🗓️ إضافة موعد متكرر بالجدول</Text>

            <Text style={styles.inputLabel}>اختر الابن:</Text>
            <View style={styles.choiceChipsWrap}>
              {children.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.choiceChipItem,
                    selectedStudent === c.id && styles.choiceChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedStudent(c.id);
                    const acts = getChildActivities(c.id);
                    setSelectedActivityId(acts.length > 0 ? acts[0].id : '');
                  }}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      selectedStudent === c.id && styles.choiceChipTextSelected,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>اختر المادة:</Text>
            <View style={styles.choiceChipsWrap}>
              {getChildActivities(selectedStudent).map((act) => (
                <TouchableOpacity
                  key={act.id}
                  style={[
                    styles.choiceChipItem,
                    selectedActivityId === act.id && styles.choiceChipSelected,
                  ]}
                  onPress={() => setSelectedActivityId(act.id)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      selectedActivityId === act.id && styles.choiceChipTextSelected,
                    ]}
                  >
                    {act.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>اختر اليوم:</Text>
            <View style={styles.choiceChipsWrap}>
              {DAYS_OF_WEEK.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  style={[
                    styles.choiceChipItem,
                    selectedDay === d.id && styles.choiceChipSelected,
                  ]}
                  onPress={() => setSelectedDay(d.id)}
                >
                  <Text
                    style={[
                      styles.choiceChipText,
                      selectedDay === d.id && styles.choiceChipTextSelected,
                    ]}
                  >
                    {d.ar}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>وقت الحصة (مثال 16:00 أو 18:30):</Text>
            <RNTextInput
              value={selectedScheduleTime}
              onChangeText={setSelectedScheduleTime}
              placeholder="16:00"
              style={styles.nativeInput}
            />

            <View style={styles.modalBtnsRow}>
              <Button mode="contained" onPress={addSchedule} style={styles.modalSaveBtn}>
                إضافة للجدول
              </Button>
              <Button mode="outlined" onPress={() => setScheduleModalVisible(false)}>
                إلغاء
              </Button>
            </View>
          </Modal>
        </Portal>

        {/* Modal: Settings */}
        <Portal>
          <Modal
            visible={settingsModalVisible}
            onDismiss={() => setSettingsModalVisible(false)}
            contentContainerStyle={styles.modalCard}
          >
            <Text style={styles.modalHeading}>⚙️ إعدادات التطبيق والأسرة</Text>

            <Text style={styles.inputLabel}>اسم العائلة / عنوان التطبيق:</Text>
            <RNTextInput
              value={familyNameInput}
              onChangeText={setFamilyNameInput}
              placeholder="مثال: عائلة الوزير، أسرة أحمد"
              style={styles.nativeInput}
            />

            <Text style={styles.inputLabel}>العملة المستخدمة:</Text>
            <RNTextInput
              value={currencyInput}
              onChangeText={setCurrencyInput}
              placeholder="EGP, SAR, USD, EUR..."
              style={styles.nativeInput}
            />

            <View style={styles.modalBtnsRow}>
              <Button mode="contained" onPress={saveSettings} style={styles.modalSaveBtn}>
                حفظ الإعدادات
              </Button>
              <Button mode="outlined" onPress={() => setSettingsModalVisible(false)}>
                إلغاء
              </Button>
            </View>
          </Modal>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 14,
    paddingBottom: 40,
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    elevation: 2,
  },
  topBarRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  saveBadge: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtnSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  headerBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
  },
  headerBtnPrimary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  headerBtnPrimaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  monthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthNavBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  monthTitleWrap: {
    alignItems: 'center',
  },
  monthTitleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  monthSubHint: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  summaryBanner: {
    marginTop: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryCol: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summaryRevenue: {
    color: '#34D399',
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    textAlign: 'center',
  },
  bigAddBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bigAddBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  childCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  childHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childAvatarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  childAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  childNameBox: {
    flex: 1,
  },
  childNameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  childSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  childTopRight: {
    alignItems: 'flex-end',
  },
  priceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 4,
  },
  priceBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  childMiniActions: {
    flexDirection: 'row',
    gap: 6,
  },
  miniIconBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  miniIconText: {
    fontSize: 13,
  },
  activitiesContainer: {
    marginTop: 12,
  },
  sectionMiniTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 6,
  },
  actPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actPillText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  addActPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
  },
  addActPillText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: 'bold',
  },
  schedulePreviewRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  schedulePreviewTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  scheduleChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  scheduleBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleBadgeText: {
    fontSize: 11,
    color: '#334155',
  },
  scheduleDeleteText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: 'bold',
  },
  childActionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  btnAction: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActionPrimary: {
    backgroundColor: '#2563EB',
  },
  btnActionPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnActionSecondary: {
    backgroundColor: '#10B981',
  },
  btnActionSecondaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnActionOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  btnActionOutlineText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: 'bold',
  },
  classesLogContainer: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logDivider: {
    marginBottom: 8,
  },
  logHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyLogText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 8,
  },
  classLogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  classLogInfo: {
    flex: 1,
  },
  classLogDate: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  classLogAct: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  classLogEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  classLogPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#059669',
  },
  deleteClassBtn: {
    padding: 4,
  },
  deleteClassBtnText: {
    fontSize: 13,
  },
  globalActionsRow: {
    marginTop: 10,
    gap: 10,
  },
  globalBtnPrimary: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  globalBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  globalBtnSecondary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  globalBtnSecondaryText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
  },
  modalHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalNotice: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 10,
    marginBottom: 6,
  },
  nativeInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
  },
  choiceChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  choiceChipItem: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choiceChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  choiceChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '500',
  },
  choiceChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalSaveBtn: {
    backgroundColor: '#2563EB',
  },
});

export default StudentClassManagementApp;