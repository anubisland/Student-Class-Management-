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
  IconButton,
  Divider,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    secondary: '#EC4899',
    surface: '#FFFFFF',
    background: '#F8FAFC',
  },
};

const StudentClassManagementApp = () => {
  // State management
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

  // Modal states
  const [childModalVisible, setChildModalVisible] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [childNameInput, setChildNameInput] = useState('');
  const [childColorInput, setChildColorInput] = useState('#3B82F6');

  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [activityChildId, setActivityChildId] = useState('');
  const [activityNameInput, setActivityNameInput] = useState('');
  const [activityPriceInput, setActivityPriceInput] = useState('50');

  const [classModalVisible, setClassModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('kareem');
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [newClassDate, setNewClassDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedHour, setSelectedHour] = useState(16);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedScheduleHour, setSelectedScheduleHour] = useState(16);
  const [selectedScheduleMinute, setSelectedScheduleMinute] = useState(0);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());
  const [customPriceInput, setCustomPriceInput] = useState('');

  const [expandedClasses, setExpandedClasses] = useState({});

  const toggleClassDetails = (studentId) => {
    setExpandedClasses((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const calendarDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setSaveStatus('Loading...');
      await loadData();
      setCurrentMonthToNow();
      setSaveStatus('✓ Data Loaded');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Initialization error:', error);
      setSaveStatus('✗ Load Failed');
    } finally {
      setLoading(false);
    }
  };

  // Database operations
  const saveToDatabase = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      setSaveStatus('✓ Saved');
      setTimeout(() => setSaveStatus(''), 2000);
      return true;
    } catch (error) {
      console.error(`[SAVE] Error saving ${key}:`, error);
      setSaveStatus('✗ Save Failed');
      setTimeout(() => setSaveStatus(''), 3000);
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
      setSettings(savedSettings || { familyName: '', currency: 'EGP' });
      setChildren(savedChildren);
      setActivities(savedActivities || []);
      setClasses(savedClasses || {});
      setSchedules(savedSchedules || {});
      setSelectedStudent(savedChildren[0].id);
    } else {
      // Check for legacy data
      const legacyPrices = await loadFromDatabase('student-prices', null);
      const legacyClasses = await loadFromDatabase('student-classes', null);
      const legacySchedules = await loadFromDatabase('student-schedules', null);

      if (legacyPrices || legacyClasses || legacySchedules) {
        const initialChildren = [
          { id: 'kareem', name: 'كريم (Kareem)', color: '#3B82F6' },
          { id: 'saraHana', name: 'سارة هناء (Sara_Hana)', color: '#EC4899' },
        ];
        const kPrice = legacyPrices?.kareem ? parseFloat(legacyPrices.kareem) : 25;
        const sPrice = legacyPrices?.saraHana ? parseFloat(legacyPrices.saraHana) : 30;

        const initialActs = [
          { id: 'act_k', childId: 'kareem', name: 'General Classes', price: kPrice },
          { id: 'act_s', childId: 'saraHana', name: 'General Classes', price: sPrice },
        ];

        setChildren(initialChildren);
        setActivities(initialActs);
        setClasses(legacyClasses || {});
        setSchedules(legacySchedules || {});

        await saveToDatabase('family_children', initialChildren);
        await saveToDatabase('family_activities', initialActs);
        await saveToDatabase('family_classes', legacyClasses || {});
        await saveToDatabase('family_schedules', legacySchedules || {});
      } else {
        // Defaults
        const defChildren = [
          { id: 'kareem', name: 'كريم (Kareem)', color: '#3B82F6' },
          { id: 'saraHana', name: 'سارة هناء (Sara_Hana)', color: '#EC4899' },
        ];
        setChildren(defChildren);
        setSelectedStudent('kareem');
      }
    }
  };

  const persistAll = async (newChildren, newActs, newClasses, newSchedules, newSettings) => {
    if (newChildren) await saveToDatabase('family_children', newChildren);
    if (newActs) await saveToDatabase('family_activities', newActs);
    if (newClasses) await saveToDatabase('family_classes', newClasses);
    if (newSchedules) await saveToDatabase('family_schedules', newSchedules);
    if (newSettings) await saveToDatabase('family_settings', newSettings);
  };

  // Date helpers
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
    const [year, month] = currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);
    const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
  };

  const getFormattedTime = () => {
    const hourStr = String(selectedHour).padStart(2, '0');
    const minStr = String(selectedMinute).padStart(2, '0');
    return `${hourStr}:${minStr}`;
  };

  const getFormattedScheduleTime = () => {
    const hourStr = String(selectedScheduleHour).padStart(2, '0');
    const minStr = String(selectedScheduleMinute).padStart(2, '0');
    return `${hourStr}:${minStr}`;
  };

  const formatMoney = (amount) => {
    const curr = settings?.currency || 'EGP';
    return `${Number(amount || 0).toFixed(2)} ${curr}`;
  };

  // Children & Activities helpers
  const getChildById = (id) => children.find((c) => c.id === id);
  const getChildActivities = (childId) => activities.filter((a) => a.childId === childId);
  const getActivityById = (id) => activities.find((a) => a.id === id);

  const getChildDefaultPrice = (childId) => {
    const childActs = getChildActivities(childId);
    return childActs.length > 0 ? childActs[0].price : 50;
  };

  // Add / Edit Child
  const saveChild = async () => {
    if (!childNameInput.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الابن/الابنة');
      return;
    }

    let updated;
    if (editingChildId) {
      updated = children.map((c) =>
        c.id === editingChildId ? { ...c, name: childNameInput.trim(), color: childColorInput } : c
      );
    } else {
      const newId = 'child_' + Date.now();
      const newChild = { id: newId, name: childNameInput.trim(), color: childColorInput };
      updated = [...children, newChild];

      // Default activity
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
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من حذف هذا الابن وجميع بياناته؟', [
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

  // Add Activity
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
    const updated = activities.filter((a) => a.id !== actId);
    setActivities(updated);
    await saveToDatabase('family_activities', updated);
  };

  // Schedule Management
  const addSchedule = async () => {
    const childActs = getChildActivities(selectedStudent);
    const actId = selectedActivityId || (childActs.length > 0 ? childActs[0].id : '');

    const newSchedule = {
      id: Date.now(),
      childId: selectedStudent,
      activityId: actId,
      day: selectedDay,
      time: getFormattedScheduleTime(),
    };

    const currentSchedules = { ...schedules };
    if (!currentSchedules[selectedStudent]) {
      currentSchedules[selectedStudent] = [];
    }
    currentSchedules[selectedStudent].push(newSchedule);

    setSchedules(currentSchedules);
    await saveToDatabase('family_schedules', currentSchedules);
    setScheduleModalVisible(false);
  };

  const removeSchedule = async (studentId, scheduleId) => {
    const currentSchedules = { ...schedules };
    if (currentSchedules[studentId]) {
      currentSchedules[studentId] = currentSchedules[studentId].filter((s) => s.id !== scheduleId);
      setSchedules(currentSchedules);
      await saveToDatabase('family_schedules', currentSchedules);
    }
  };

  // Classes & Sessions
  const addClass = async () => {
    const dateStr = formatDate(newClassDate);
    const timeStr = getFormattedTime();

    const currentClasses = { ...classes };
    if (!currentClasses[selectedStudent]) {
      currentClasses[selectedStudent] = [];
    }

    const exists = currentClasses[selectedStudent].some((c) => c.date === dateStr && c.time === timeStr);
    if (exists) {
      Alert.alert('تنبيه', 'توجد حصة بالفعل في نفس التاريخ والوقت لهذا الابن');
      return;
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
  };

  const removeClass = async (studentId, classId) => {
    const currentClasses = { ...classes };
    if (currentClasses[studentId]) {
      currentClasses[studentId] = currentClasses[studentId].filter((c) => c.id !== classId);
      setClasses(currentClasses);
      await saveToDatabase('family_classes', currentClasses);
    }
  };

  const generateMonthlyClasses = async (studentId) => {
    const studentSchedules = schedules[studentId] || [];
    const child = getChildById(studentId);
    const childName = child ? child.name : studentId;

    if (studentSchedules.length === 0) {
      Alert.alert('تنبيه', `لا توجد مواعيد أسبوعية مسجلة لـ ${childName}`);
      return;
    }

    const [year, month] = currentMonth.split('-');
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

  // Share report via WhatsApp or system share sheet
  const shareMonthlyReport = async (studentId = null) => {
    let text = `📅 تقرير الحصص والأنشطة - ${getMonthName(currentMonth)}\n`;
    if (settings.familyName) text += `🏠 ${settings.familyName}\n`;
    text += `===================================\n\n`;

    const targetChildren = studentId ? children.filter((c) => c.id === studentId) : children;

    targetChildren.forEach((child) => {
      const list = getMonthlyClasses(child.id);
      const total = getStudentMonthlyTotal(child.id);
      text += `👤 ${child.name}\n`;
      text += `إجمالي الحصص: ${list.length}\n`;
      text += `المجموع: ${formatMoney(total)}\n`;
      if (list.length > 0) {
        list.forEach((c, idx) => {
          const act = getActivityById(c.activityId);
          const actName = act ? `[${act.name}] ` : '';
          text += `  ${idx + 1}. ${c.date} @ ${c.time} ${actName}(${formatMoney(c.price)})\n`;
        });
      }
      text += `-----------------------------------\n\n`;
    });

    if (!studentId) {
      text += `📊 المجموع الكلي للأسرة: ${formatMoney(getTotalMonthlyRevenue())} (${getTotalMonthlyClassesCount()} حصة)\n`;
    }

    try {
      await Share.share({ message: text, title: 'تقرير المصاريف والحصص الشهرية' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title={settings.familyName || 'إدارة حصص وأنشطة الأسرة'}
          subtitle={saveStatus || 'Student & Activity Manager'}
          titleStyle={styles.headerTitle}
        />
        <IconButton icon="account-plus" onPress={() => { setEditingChildId(null); setChildNameInput(''); setChildModalVisible(true); }} />
        <IconButton icon="share-variant" onPress={() => shareMonthlyReport()} />
      </Appbar.Header>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Month Selector Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.monthSelectorRow}>
              <IconButton icon="chevron-right" size={24} onPress={() => navigateMonth(1)} />
              <View style={styles.monthDisplayContainer}>
                <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
              </View>
              <IconButton icon="chevron-left" size={24} onPress={() => navigateMonth(-1)} />
            </View>

            {/* Total Banner */}
            <Surface style={styles.totalBanner}>
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>إجمالي الحصص</Text>
                <Text style={styles.totalValue}>{getTotalMonthlyClassesCount()}</Text>
              </View>
              <View style={styles.totalDivider} />
              <View style={styles.totalItem}>
                <Text style={styles.totalLabel}>المبلغ المستحق</Text>
                <Text style={[styles.totalValue, styles.revenueText]}>
                  {formatMoney(getTotalMonthlyRevenue())}
                </Text>
              </View>
            </Surface>
          </Card.Content>
        </Card>

        {/* Children Management & Stats */}
        {children.map((child) => {
          const monthlyClasses = getMonthlyClasses(child.id);
          const childTotal = getStudentMonthlyTotal(child.id);
          const childActs = getChildActivities(child.id);
          const isExpanded = expandedClasses[child.id];

          return (
            <Card key={child.id} style={[styles.card, { borderLeftColor: child.color || '#3B82F6', borderLeftWidth: 5 }]}>
              <Card.Content>
                <View style={styles.childHeader}>
                  <View style={styles.childNameWrap}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.childSubStats}>
                      {monthlyClasses.length} حصة • {formatMoney(childTotal)}
                    </Text>
                  </View>
                  <View style={styles.childActions}>
                    <IconButton
                      icon="plus-circle"
                      size={20}
                      iconColor="#3B82F6"
                      onPress={() => {
                        setSelectedStudent(child.id);
                        setClassModalVisible(true);
                      }}
                    />
                    <IconButton
                      icon="lightning-bolt"
                      size={20}
                      iconColor="#10B981"
                      onPress={() => generateMonthlyClasses(child.id)}
                    />
                    <IconButton
                      icon={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      onPress={() => toggleClassDetails(child.id)}
                    />
                  </View>
                </View>

                {/* Activities Chips */}
                <View style={styles.activitiesRow}>
                  {childActs.map((act) => (
                    <Chip
                      key={act.id}
                      style={styles.actChip}
                      onClose={() => deleteActivity(act.id)}
                    >
                      {act.name} ({formatMoney(act.price)})
                    </Chip>
                  ))}
                  <Chip
                    icon="plus"
                    style={styles.addActChip}
                    onPress={() => {
                      setActivityChildId(child.id);
                      setActivityModalVisible(true);
                    }}
                  >
                    نشاط جديد
                  </Chip>
                </View>

                {/* Expanded Session Logs */}
                {isExpanded && (
                  <View style={styles.classesListContainer}>
                    <Divider style={styles.divider} />
                    <Text style={styles.classesListTitle}>سجل الحصص لهذا الشهر:</Text>
                    {monthlyClasses.length === 0 ? (
                      <Text style={styles.emptyText}>لا توجد حصص مسجلة</Text>
                    ) : (
                      monthlyClasses.map((cls) => {
                        const act = getActivityById(cls.activityId);
                        return (
                          <View key={cls.id} style={styles.classRow}>
                            <View>
                              <Text style={styles.classDate}>{cls.date} @ {cls.time}</Text>
                              {act && <Text style={styles.classActName}>{act.name}</Text>}
                            </View>
                            <View style={styles.classRight}>
                              <Text style={styles.classPrice}>{formatMoney(cls.price)}</Text>
                              <IconButton
                                icon="delete-outline"
                                size={18}
                                iconColor="#EF4444"
                                onPress={() => removeClass(child.id, cls.id)}
                              />
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {/* Quick Actions Footer */}
        <View style={styles.footerActions}>
          <Button
            mode="contained"
            icon="calendar-clock"
            style={styles.actionBtn}
            onPress={() => setScheduleModalVisible(true)}
          >
            إضافة جدول أسبوعي
          </Button>
          <Button
            mode="outlined"
            icon="share"
            style={styles.actionBtn}
            onPress={() => shareMonthlyReport()}
          >
            مشاركة التقرير
          </Button>
        </View>
      </ScrollView>

      {/* Add Child Modal */}
      <Portal>
        <Modal
          visible={childModalVisible}
          onDismiss={() => setChildModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>إضافة ابن جديد</Text>
          <TextInput
            label="اسم الابن / الابنة"
            value={childNameInput}
            onChangeText={setChildNameInput}
            style={styles.input}
          />
          <Button mode="contained" onPress={saveChild} style={styles.modalBtn}>
            حفظ
          </Button>
        </Modal>
      </Portal>

      {/* Add Activity Modal */}
      <Portal>
        <Modal
          visible={activityModalVisible}
          onDismiss={() => setActivityModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>إضافة مادة / نشاط</Text>
          <TextInput
            label="اسم النشاط (مثال: إنجليزي، سباحة)"
            value={activityNameInput}
            onChangeText={setActivityNameInput}
            style={styles.input}
          />
          <TextInput
            label="سعر الحصة / الجلسة"
            value={activityPriceInput}
            onChangeText={setActivityPriceInput}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button mode="contained" onPress={saveActivity} style={styles.modalBtn}>
            حفظ النشاط
          </Button>
        </Modal>
      </Portal>

      {/* Add Extra Class Modal */}
      <Portal>
        <Modal
          visible={classModalVisible}
          onDismiss={() => setClassModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>إضافة حصة إضافية</Text>
          <Text style={styles.modalSubtitle}>التاريخ: {formatDate(newClassDate)}</Text>
          <TextInput
            label="سعر مخصص (اختياري)"
            value={customPriceInput}
            onChangeText={setCustomPriceInput}
            keyboardType="numeric"
            placeholder="سعر النشاط التلقائي"
            style={styles.input}
          />
          <Button mode="contained" onPress={addClass} style={styles.modalBtn}>
            إضافة الحصة
          </Button>
        </Modal>
      </Portal>

      {/* Add Schedule Modal */}
      <Portal>
        <Modal
          visible={scheduleModalVisible}
          onDismiss={() => setScheduleModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>إضافة موعد أسبوعي متكرر</Text>
          <View style={styles.chipRow}>
            {children.map((c) => (
              <Chip
                key={c.id}
                selected={selectedStudent === c.id}
                onPress={() => setSelectedStudent(c.id)}
                style={styles.choiceChip}
              >
                {c.name}
              </Chip>
            ))}
          </View>
          <View style={styles.chipRow}>
            {daysOfWeek.map((day) => (
              <Chip
                key={day}
                selected={selectedDay === day}
                onPress={() => setSelectedDay(day)}
                style={styles.choiceChip}
              >
                {day}
              </Chip>
            ))}
          </View>
          <Button mode="contained" onPress={addSchedule} style={styles.modalBtn}>
            إضافة للجدول
          </Button>
        </Modal>
      </Portal>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthDisplayContainer: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  totalBanner: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  totalItem: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  revenueText: {
    color: '#34D399',
  },
  totalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#334155',
  },
  childHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childNameWrap: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  childSubStats: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  childActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  actChip: {
    backgroundColor: '#EFF6FF',
  },
  addActChip: {
    backgroundColor: '#F1F5F9',
  },
  classesListContainer: {
    marginTop: 10,
  },
  divider: {
    marginVertical: 8,
  },
  classesListTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  classDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1E293B',
  },
  classActName: {
    fontSize: 11,
    color: '#2563EB',
  },
  classRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#059669',
  },
  emptyText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    paddingVertical: 4,
  },
  footerActions: {
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    borderRadius: 12,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  modalBtn: {
    marginTop: 8,
    borderRadius: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  choiceChip: {
    marginBottom: 4,
  },
});

export default StudentClassManagementApp;