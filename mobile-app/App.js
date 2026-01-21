import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Alert,
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
  FAB,
  Portal,
  Modal,
  List,
  Divider,
  Surface,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#3B82F6',
    secondary: '#EC4899',
    surface: '#FFFFFF',
    background: '#F9FAFB',
  },
};

const StudentClassManagementApp = () => {
  // State management
  const [prices, setPrices] = useState({ kareem: '25.00', saraHana: '30.00' });
  const [classes, setClasses] = useState({ kareem: [], saraHana: [] });
  const [schedules, setSchedules] = useState({ kareem: [], saraHana: [] });
  const [currentMonth, setCurrentMonth] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [classDetailsModalVisible, setClassDetailsModalVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  // Date/Time picker states
  const [scheduleTimePickerVisible, setScheduleTimePickerVisible] = useState(false);
  const [classDatePickerVisible, setClassDatePickerVisible] = useState(false);
  const [classTimePickerVisible, setClassTimePickerVisible] = useState(false);
  
  // Form states
  const [selectedStudent, setSelectedStudent] = useState('kareem');
  const [newScheduleDay, setNewScheduleDay] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState(new Date());
  const [newClassDate, setNewClassDate] = useState(new Date());
  const [newClassTime, setNewClassTime] = useState(new Date());
  const [monthPickerDate, setMonthPickerDate] = useState(new Date());

  const students = [
    { key: 'kareem', name: 'Kareem', color: '#3B82F6' },
    { key: 'saraHana', name: 'Sara_Hana', color: '#EC4899' }
  ];

  const weekDays = [
    'sunday', 'monday', 'tuesday', 'wednesday', 
    'thursday', 'friday', 'saturday'
  ];

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
      console.error('Save error:', error);
      setSaveStatus('✗ Save Failed');
      return false;
    }
  };

  const loadFromDatabase = async (key, defaultValue = {}) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('Load error:', error);
      return defaultValue;
    }
  };

  const loadData = async () => {
    const loadedPrices = await loadFromDatabase('student-prices', {
      kareem: '25.00',
      saraHana: '30.00'
    });
    
    const loadedClasses = await loadFromDatabase('student-classes', {
      kareem: [],
      saraHana: []
    });
    
    const loadedSchedules = await loadFromDatabase('student-schedules', {
      kareem: [],
      saraHana: []
    });

    setPrices(loadedPrices);
    setClasses(loadedClasses);
    setSchedules(loadedSchedules);
  };

  // Date helpers
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString, timeString = null) => {
    const date = new Date(dateString + 'T00:00:00');
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    let formatted = date.toLocaleDateString('en-US', options);
    if (timeString) {
      formatted += ` at ${timeString}`;
    }
    return formatted;
  };

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const setCurrentMonthToNow = () => {
    const now = new Date();
    const monthString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthString);
    setMonthPickerDate(now);
  };

  // Schedule management
  const addSchedule = async () => {
    if (!newScheduleDay) {
      Alert.alert('Error', 'Please select a day');
      return;
    }

    const timeString = newScheduleTime.toTimeString().substring(0, 5);
    const newSchedule = {
      id: Date.now(),
      day: newScheduleDay,
      time: timeString
    };

    const updatedSchedules = {
      ...schedules,
      [selectedStudent]: [...(schedules[selectedStudent] || []), newSchedule]
    };

    setSchedules(updatedSchedules);
    await saveToDatabase('student-schedules', updatedSchedules);

    setNewScheduleDay('');
    setNewScheduleTime(new Date());
    setScheduleModalVisible(false);
  };

  const removeSchedule = async (student, scheduleId) => {
    const updatedSchedules = {
      ...schedules,
      [student]: schedules[student].filter(s => s.id !== scheduleId)
    };

    setSchedules(updatedSchedules);
    await saveToDatabase('student-schedules', updatedSchedules);
  };

  // Class management
  const addClass = async () => {
    const dateString = formatDate(newClassDate);
    const timeString = newClassTime.toTimeString().substring(0, 5);

    if (classExists(selectedStudent, dateString, timeString)) {
      Alert.alert('Error', 'A class already exists for this date and time');
      return;
    }

    const newClass = {
      id: Date.now(),
      date: dateString,
      time: timeString,
      timestamp: new Date().toISOString()
    };

    const updatedClasses = {
      ...classes,
      [selectedStudent]: [...(classes[selectedStudent] || []), newClass]
    };

    setClasses(updatedClasses);
    await saveToDatabase('student-classes', updatedClasses);

    setNewClassDate(new Date());
    setNewClassTime(new Date());
    setClassModalVisible(false);
  };

  const removeClass = async (student, classId) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedClasses = {
              ...classes,
              [student]: classes[student].filter(cls => cls.id !== classId)
            };
            setClasses(updatedClasses);
            await saveToDatabase('student-classes', updatedClasses);
          }
        }
      ]
    );
  };

  const classExists = (student, date, time) => {
    if (!classes[student]) return false;
    return classes[student].some(cls => cls.date === date && cls.time === time);
  };

  // Generate classes from schedule
  const generateMonthlyClasses = async (student) => {
    const studentSchedules = schedules[student] || [];
    if (studentSchedules.length === 0) {
      const studentName = students.find(s => s.key === student)?.name;
      Alert.alert('Error', `No schedules set for ${studentName}`);
      return;
    }

    const [year, month] = currentMonth.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    
    let generatedCount = 0;
    const dayMap = {
      'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
      'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const newClasses = [];
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      studentSchedules.forEach(schedule => {
        if (dayMap[schedule.day] === dayOfWeek) {
          const dateString = formatDate(date);
          
          if (!classExists(student, dateString, schedule.time)) {
            newClasses.push({
              id: Date.now() + Math.random(),
              date: dateString,
              time: schedule.time,
              timestamp: new Date().toISOString()
            });
            generatedCount++;
          }
        }
      });
    }

    if (newClasses.length > 0) {
      const updatedClasses = {
        ...classes,
        [student]: [...(classes[student] || []), ...newClasses]
      };
      setClasses(updatedClasses);
      await saveToDatabase('student-classes', updatedClasses);
    }

    const studentName = students.find(s => s.key === student)?.name;
    const monthName = getMonthName(currentMonth);
    Alert.alert('Success', `Generated ${generatedCount} classes for ${studentName} in ${monthName}`);
  };

  // Report generation
  const generateReport = async (type) => {
    let reportText = '';
    let filename = '';
    const monthName = getMonthName(currentMonth).replace(' ', '_');

    if (type === 'combined') {
      reportText = generateCombinedReportText();
      filename = `Combined_Report_${monthName}.txt`;
    } else {
      reportText = generateReportText(type);
      const studentName = students.find(s => s.key === type)?.name;
      filename = `${studentName}_Report_${monthName}.txt`;
    }

    try {
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, reportText);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Report generation error:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const generateReportText = (student) => {
    const monthlyClasses = getMonthlyClasses(student, currentMonth);
    const studentPrice = parseFloat(prices[student]) || 0;
    const total = monthlyClasses.length * studentPrice;
    const studentName = students.find(s => s.key === student)?.name;
    const monthName = getMonthName(currentMonth);
    
    let report = `${studentName} - Monthly Report\n`;
    report += `Month: ${monthName}\n`;
    report += `${'='.repeat(40)}\n\n`;
    report += `Summary:\n`;
    report += `- Total Classes: ${monthlyClasses.length}\n`;
    report += `- Price per Class: $${studentPrice.toFixed(2)}\n`;
    report += `- Total Amount: $${total.toFixed(2)}\n\n`;
    
    if (monthlyClasses.length > 0) {
      report += `Class Details:\n`;
      report += `${'='.repeat(20)}\n`;
      
      monthlyClasses.forEach((cls, index) => {
        report += `${index + 1}. Date: ${cls.date} at ${cls.time}\n`;
      });
    }
    
    report += `\n${'='.repeat(40)}\n`;
    report += `Report generated on: ${new Date().toLocaleString()}\n`;
    
    return report;
  };

  const generateCombinedReportText = () => {
    const monthName = getMonthName(currentMonth);
    const kareemClasses = getMonthlyClasses('kareem', currentMonth);
    const saraHanaClasses = getMonthlyClasses('saraHana', currentMonth);
    const kareemTotal = kareemClasses.length * (parseFloat(prices.kareem) || 0);
    const saraHanaTotal = saraHanaClasses.length * (parseFloat(prices.saraHana) || 0);
    const grandTotal = kareemTotal + saraHanaTotal;
    
    let report = `Combined Monthly Report\n`;
    report += `Month: ${monthName}\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    // Kareem section
    report += `KAREEM\n`;
    report += `${'='.repeat(20)}\n`;
    report += `Total Classes: ${kareemClasses.length}\n`;
    report += `Price per Class: $${(parseFloat(prices.kareem) || 0).toFixed(2)}\n`;
    report += `Total Amount: $${kareemTotal.toFixed(2)}\n\n`;
    
    if (kareemClasses.length > 0) {
      report += `Classes:\n`;
      kareemClasses.forEach((cls, index) => {
        report += `${index + 1}. ${cls.date} at ${cls.time}\n`;
      });
      report += '\n';
    }
    
    // Sara_Hana section
    report += `SARA_HANA\n`;
    report += `${'='.repeat(20)}\n`;
    report += `Total Classes: ${saraHanaClasses.length}\n`;
    report += `Price per Class: $${(parseFloat(prices.saraHana) || 0).toFixed(2)}\n`;
    report += `Total Amount: $${saraHanaTotal.toFixed(2)}\n\n`;
    
    if (saraHanaClasses.length > 0) {
      report += `Classes:\n`;
      saraHanaClasses.forEach((cls, index) => {
        report += `${index + 1}. ${cls.date} at ${cls.time}\n`;
      });
      report += '\n';
    }
    
    // Summary
    report += `SUMMARY\n`;
    report += `${'='.repeat(20)}\n`;
    report += `Total Classes (Both Students): ${kareemClasses.length + saraHanaClasses.length}\n`;
    report += `Grand Total Revenue: $${grandTotal.toFixed(2)}\n\n`;
    
    report += `${'='.repeat(50)}\n`;
    report += `Report generated on: ${new Date().toLocaleString()}\n`;
    
    return report;
  };

  // Helper functions
  const getMonthlyClasses = (student, month) => {
    if (!classes[student]) return [];
    
    return classes[student]
      .filter(cls => cls.date.startsWith(month))
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB - dateA; // Most recent first
      });
  };

  const getStudentStats = (student, month) => {
    const monthlyClasses = getMonthlyClasses(student, month);
    const studentPrice = parseFloat(prices[student]) || 0;
    const total = monthlyClasses.length * studentPrice;
    
    return {
      classCount: monthlyClasses.length,
      total: total,
      classes: monthlyClasses
    };
  };

  const updatePrice = async (student, value) => {
    const updatedPrices = { ...prices, [student]: value };
    setPrices(updatedPrices);
    await saveToDatabase('student-prices', updatedPrices);
  };

  const onMonthChange = (event, selectedDate) => {
    setMonthPickerVisible(false);
    if (selectedDate) {
      const monthString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`;
      setCurrentMonth(monthString);
      setMonthPickerDate(selectedDate);
    }
  };

  // Schedule time picker handler
  const onScheduleTimeChange = (event, selectedTime) => {
    setScheduleTimePickerVisible(false);
    if (selectedTime) {
      setNewScheduleTime(selectedTime);
    }
  };

  // Class date picker handler
  const onClassDateChange = (event, selectedDate) => {
    setClassDatePickerVisible(false);
    if (selectedDate) {
      setNewClassDate(selectedDate);
    }
  };

  // Class time picker handler
  const onClassTimeChange = (event, selectedTime) => {
    setClassTimePickerVisible(false);
    if (selectedTime) {
      setNewClassTime(selectedTime);
    }
  };

  // Month navigation helpers
  const goToPreviousMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month - 2, 1); // month - 2 because month is 1-indexed and we want previous
    const monthString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthString);
    setMonthPickerDate(newDate);
  };

  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newDate = new Date(year, month, 1); // month because it's already 1-indexed and we want next
    const monthString = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(monthString);
    setMonthPickerDate(newDate);
  };

  const goToCurrentMonth = () => {
    setCurrentMonthToNow();
  };

  // Calculate totals
  const kareemStats = getStudentStats('kareem', currentMonth);
  const saraHanaStats = getStudentStats('saraHana', currentMonth);
  const totalClasses = kareemStats.classCount + saraHanaStats.classCount;
  const totalRevenue = kareemStats.total + saraHanaStats.total;

  if (loading) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <Appbar.Header>
        <Appbar.Content title="Student Class Management" />
        <Appbar.Action 
          icon="database" 
          onPress={() => {}} 
        />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        {/* Status */}
        {saveStatus ? (
          <Surface style={styles.statusCard}>
            <Text style={[
              styles.statusText,
              { color: saveStatus.includes('✓') ? '#10B981' : 
                       saveStatus.includes('✗') ? '#EF4444' : '#F59E0B' }
            ]}>
              {saveStatus}
            </Text>
          </Surface>
        ) : null}

        {/* Monthly Overview */}
        <Card style={styles.card}>
          <Card.Title title="Monthly Overview" />
          <Card.Content>
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <Button
                mode="contained"
                onPress={goToPreviousMonth}
                style={styles.monthNavButton}
                compact
                icon="chevron-left"
              >
                Prev
              </Button>

              <Button
                mode="outlined"
                onPress={() => setMonthPickerVisible(true)}
                style={styles.monthSelectorCenter}
              >
                {getMonthName(currentMonth)}
              </Button>

              <Button
                mode="contained"
                onPress={goToNextMonth}
                style={styles.monthNavButton}
                compact
                icon="chevron-right"
                contentStyle={styles.monthNavButtonRight}
              >
                Next
              </Button>
            </View>

            <Button
              mode="text"
              onPress={goToCurrentMonth}
              style={styles.todayButton}
              compact
            >
              Go to Current Month
            </Button>
            
            <View style={styles.statsContainer}>
              <Surface style={[styles.studentCard, { backgroundColor: '#EBF8FF' }]}>
                <Text variant="headlineSmall" style={{ color: '#1E40AF' }}>Kareem</Text>
                <Text>Classes this month: {kareemStats.classCount}</Text>
                <Text style={{ color: '#10B981' }}>Monthly total: ${kareemStats.total.toFixed(2)}</Text>
              </Surface>
              
              <Surface style={[styles.studentCard, { backgroundColor: '#FDF2F8' }]}>
                <Text variant="headlineSmall" style={{ color: '#BE185D' }}>Sara_Hana</Text>
                <Text>Classes this month: {saraHanaStats.classCount}</Text>
                <Text style={{ color: '#10B981' }}>Monthly total: ${saraHanaStats.total.toFixed(2)}</Text>
              </Surface>
            </View>
            
            <Surface style={styles.totalCard}>
              <View style={styles.totalRow}>
                <Text variant="titleLarge">Total Classes:</Text>
                <Text variant="headlineSmall" style={{ color: '#3B82F6' }}>{totalClasses}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text variant="titleLarge">Total Revenue:</Text>
                <Text variant="headlineSmall" style={{ color: '#10B981' }}>${totalRevenue.toFixed(2)}</Text>
              </View>
            </Surface>
          </Card.Content>
        </Card>

        {/* Student Classes Overview */}
        {students.map(student => {
          const studentClasses = getMonthlyClasses(student.key, currentMonth);
          const stats = getStudentStats(student.key, currentMonth);
          return (
            <Card
              key={student.key}
              style={styles.card}
              onPress={() => {
                setSelectedStudent(student.key);
                setClassDetailsModalVisible(true);
              }}
            >
              <Card.Title
                title={`${student.name}'s Classes`}
                titleStyle={{ color: student.color }}
                subtitle={`Tap to view all classes`}
                subtitleStyle={styles.cardSubtitle}
                right={(props) => (
                  <Text style={[styles.classCountBadge, { backgroundColor: student.color }]}>
                    {stats.classCount}
                  </Text>
                )}
              />
              <Card.Content>
                <View style={styles.studentStatsRow}>
                  <Text>Classes: {stats.classCount}</Text>
                  <Text style={{ color: '#10B981' }}>Total: ${stats.total.toFixed(2)}</Text>
                </View>

                {studentClasses.length > 0 ? (
                  <>
                    <Text style={styles.recentClassesLabel}>Recent classes:</Text>
                    <View style={styles.classesPreview}>
                      {studentClasses.slice(0, 3).map(cls => (
                        <Chip
                          key={cls.id}
                          style={[styles.classChip, { borderColor: student.color }]}
                          textStyle={styles.classChipText}
                          icon="calendar"
                          compact
                        >
                          {cls.date} @ {cls.time}
                        </Chip>
                      ))}
                    </View>
                    {studentClasses.length > 3 && (
                      <Button
                        mode="text"
                        onPress={() => {
                          setSelectedStudent(student.key);
                          setClassDetailsModalVisible(true);
                        }}
                        style={styles.viewAllButton}
                        compact
                      >
                        View all {studentClasses.length} classes →
                      </Button>
                    )}
                  </>
                ) : (
                  <Text style={styles.noClassesPreview}>No classes scheduled this month</Text>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={styles.actionButtonsContainer}>
              <Button 
                mode="contained" 
                onPress={() => setPriceModalVisible(true)}
                style={[styles.actionButton, { backgroundColor: '#6366F1' }]}
              >
                Set Prices
              </Button>
              <Button 
                mode="contained" 
                onPress={() => setScheduleModalVisible(true)}
                style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
              >
                Add Schedule
              </Button>
              <Button 
                mode="contained" 
                onPress={() => setClassModalVisible(true)}
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
              >
                Add Class
              </Button>
              <Button 
                mode="contained" 
                onPress={() => setReportModalVisible(true)}
                style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
              >
                Reports
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Generate Classes */}
        <Card style={styles.card}>
          <Card.Title title="Generate Monthly Classes" />
          <Card.Content>
            <View style={styles.generateContainer}>
              <Button 
                mode="contained" 
                onPress={() => generateMonthlyClasses('kareem')}
                style={[styles.generateButton, { backgroundColor: '#3B82F6' }]}
              >
                Generate Classes for Kareem
              </Button>
              <Button 
                mode="contained" 
                onPress={() => generateMonthlyClasses('saraHana')}
                style={[styles.generateButton, { backgroundColor: '#EC4899' }]}
              >
                Generate Classes for Sara_Hana
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modals */}
      
      {/* Price Setting Modal */}
      <Portal>
        <Modal 
          visible={priceModalVisible} 
          onDismiss={() => setPriceModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Price Settings</Text>
          
          <TextInput
            label="Kareem - Price per Class"
            value={prices.kareem}
            onChangeText={(text) => updatePrice('kareem', text)}
            keyboardType="numeric"
            left={<TextInput.Icon icon="currency-usd" />}
            style={styles.priceInput}
          />
          
          <TextInput
            label="Sara_Hana - Price per Class"
            value={prices.saraHana}
            onChangeText={(text) => updatePrice('saraHana', text)}
            keyboardType="numeric"
            left={<TextInput.Icon icon="currency-usd" />}
            style={styles.priceInput}
          />
          
          <Button 
            mode="contained" 
            onPress={() => setPriceModalVisible(false)}
            style={styles.modalButton}
          >
            Done
          </Button>
        </Modal>
      </Portal>

      {/* Schedule Modal */}
      <Portal>
        <Modal 
          visible={scheduleModalVisible} 
          onDismiss={() => setScheduleModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Add Schedule</Text>
          
          <Text style={styles.modalLabel}>Select Student:</Text>
          <View style={styles.studentSelector}>
            {students.map(student => (
              <Chip
                key={student.key}
                selected={selectedStudent === student.key}
                onPress={() => setSelectedStudent(student.key)}
                style={styles.studentChip}
              >
                {student.name}
              </Chip>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Select Day:</Text>
          <View style={styles.daySelector}>
            {weekDays.map(day => (
              <Chip
                key={day}
                selected={newScheduleDay === day}
                onPress={() => setNewScheduleDay(day)}
                style={styles.dayChip}
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </Chip>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setScheduleTimePickerVisible(true)}
            style={styles.timeButton}
            icon="clock-outline"
          >
            Time: {newScheduleTime.toTimeString().substring(0, 5)}
          </Button>

          {scheduleTimePickerVisible && (
            <DateTimePicker
              value={newScheduleTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onScheduleTimeChange}
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setScheduleModalVisible(false)}
              style={styles.modalButtonHalf}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addSchedule}
              style={styles.modalButtonHalf}
            >
              Add Schedule
            </Button>
          </View>
          
          {/* Show existing schedules */}
          <Text variant="titleMedium" style={styles.existingSchedulesTitle}>
            Existing Schedules for {students.find(s => s.key === selectedStudent)?.name}:
          </Text>
          {(schedules[selectedStudent] || []).map(schedule => (
            <View key={schedule.id} style={styles.scheduleItem}>
              <Text>{schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)} at {schedule.time}</Text>
              <Button
                mode="text"
                textColor="#EF4444"
                onPress={() => removeSchedule(selectedStudent, schedule.id)}
              >
                Remove
              </Button>
            </View>
          ))}
        </Modal>
      </Portal>

      {/* Add Class Modal */}
      <Portal>
        <Modal 
          visible={classModalVisible} 
          onDismiss={() => setClassModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Add Extra Class</Text>
          
          <Text style={styles.modalLabel}>Select Student:</Text>
          <View style={styles.studentSelector}>
            {students.map(student => (
              <Chip
                key={student.key}
                selected={selectedStudent === student.key}
                onPress={() => setSelectedStudent(student.key)}
                style={styles.studentChip}
              >
                {student.name}
              </Chip>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={() => setClassDatePickerVisible(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            Date: {formatDate(newClassDate)}
          </Button>

          {classDatePickerVisible && (
            <DateTimePicker
              value={newClassDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onClassDateChange}
            />
          )}

          <Button
            mode="outlined"
            onPress={() => setClassTimePickerVisible(true)}
            style={styles.timeButton}
            icon="clock-outline"
          >
            Time: {newClassTime.toTimeString().substring(0, 5)}
          </Button>

          {classTimePickerVisible && (
            <DateTimePicker
              value={newClassTime}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onClassTimeChange}
            />
          )}

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setClassModalVisible(false)}
              style={styles.modalButtonHalf}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={addClass}
              style={styles.modalButtonHalf}
            >
              Add Class
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Class Details Modal (Full List) */}
      <Portal>
        <Modal
          visible={classDetailsModalVisible}
          onDismiss={() => setClassDetailsModalVisible(false)}
          contentContainerStyle={styles.modalLarge}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            All Classes - {getMonthName(currentMonth)}
          </Text>

          <Text style={styles.modalLabel}>Select Student:</Text>
          <View style={styles.studentSelector}>
            {students.map(student => (
              <Chip
                key={student.key}
                selected={selectedStudent === student.key}
                onPress={() => setSelectedStudent(student.key)}
                style={styles.studentChip}
              >
                {student.name}
              </Chip>
            ))}
          </View>

          <Surface style={styles.classListHeader}>
            <Text variant="titleMedium" style={{ color: students.find(s => s.key === selectedStudent)?.color }}>
              {students.find(s => s.key === selectedStudent)?.name}'s Classes
            </Text>
            <Text>Total: {getMonthlyClasses(selectedStudent, currentMonth).length} classes</Text>
          </Surface>

          <ScrollView style={styles.classListScroll}>
            {getMonthlyClasses(selectedStudent, currentMonth).length === 0 ? (
              <Text style={styles.noClassesText}>No classes scheduled for this month</Text>
            ) : (
              getMonthlyClasses(selectedStudent, currentMonth).map((cls, index) => (
                <Surface key={cls.id} style={styles.classListItem}>
                  <View style={styles.classListItemContent}>
                    <Text variant="titleSmall">{index + 1}. {formatDisplayDate(cls.date)}</Text>
                    <Text style={styles.classTimeText}>at {cls.time}</Text>
                  </View>
                  <Button
                    mode="text"
                    textColor="#EF4444"
                    onPress={() => removeClass(selectedStudent, cls.id)}
                    compact
                  >
                    Delete
                  </Button>
                </Surface>
              ))
            )}
          </ScrollView>

          <Button
            mode="contained"
            onPress={() => setClassDetailsModalVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Reports Modal */}
      <Portal>
        <Modal
          visible={reportModalVisible}
          onDismiss={() => setReportModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Monthly Reports</Text>
          <Text variant="titleMedium" style={styles.reportMonth}>
            {getMonthName(currentMonth)}
          </Text>
          
          {/* Individual Reports */}
          {students.map(student => {
            const stats = getStudentStats(student.key, currentMonth);
            return (
              <Surface key={student.key} style={styles.reportCard}>
                <Text variant="titleMedium" style={{ color: student.color }}>
                  {student.name}'s Report
                </Text>
                <Text>Total Classes: {stats.classCount}</Text>
                <Text>Price per Class: ${(parseFloat(prices[student.key]) || 0).toFixed(2)}</Text>
                <Text style={{ color: '#10B981' }}>
                  Total Amount: ${stats.total.toFixed(2)}
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => generateReport(student.key)}
                  style={styles.reportButton}
                >
                  Download {student.name}'s Report
                </Button>
              </Surface>
            );
          })}
          
          {/* Combined Report */}
          <Surface style={styles.reportCard}>
            <Text variant="titleMedium">Combined Report</Text>
            <Text>Total Classes: {totalClasses}</Text>
            <Text style={{ color: '#10B981' }}>Grand Total: ${totalRevenue.toFixed(2)}</Text>
            <Button
              mode="outlined"
              onPress={() => generateReport('combined')}
              style={styles.reportButton}
            >
              Download Combined Report
            </Button>
          </Surface>
          
          <Button 
            mode="contained" 
            onPress={() => setReportModalVisible(false)}
            style={styles.modalButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>

      {/* Date/Time Pickers */}
      {monthPickerVisible && (
        <DateTimePicker
          value={monthPickerDate}
          mode="date"
          display="default"
          onChange={onMonthChange}
        />
      )}

      {/* Class Details FAB */}
      <FAB
        style={styles.fab}
        icon="calendar-multiple"
        label="View Classes"
        onPress={() => setClassDetailsModalVisible(true)}
      />
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  statusText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthNavButton: {
    flex: 0.25,
  },
  monthNavButtonRight: {
    flexDirection: 'row-reverse',
  },
  monthSelectorCenter: {
    flex: 0.45,
  },
  todayButton: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studentCard: {
    flex: 0.48,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  totalCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: '#F3F4F6',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  classCountBadge: {
    color: 'white',
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 16,
    fontSize: 16,
    overflow: 'hidden',
  },
  studentStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recentClassesLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  classesPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  classChip: {
    marginVertical: 2,
    marginRight: 4,
    borderWidth: 1,
  },
  classChipText: {
    fontSize: 11,
  },
  viewAllButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  noClassesPreview: {
    fontStyle: 'italic',
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    marginVertical: 4,
  },
  generateContainer: {
    gap: 12,
  },
  generateButton: {
    marginVertical: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalLarge: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  classListHeader: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    backgroundColor: '#F3F4F6',
  },
  classListScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  classListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  classListItemContent: {
    flex: 1,
  },
  classTimeText: {
    color: '#6B7280',
    fontSize: 14,
  },
  noClassesText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
    padding: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  priceInput: {
    marginBottom: 16,
  },
  studentSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  studentChip: {
    margin: 4,
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayChip: {
    margin: 4,
  },
  timeButton: {
    marginVertical: 8,
  },
  dateButton: {
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    marginTop: 16,
  },
  modalButtonHalf: {
    width: '48%',
  },
  existingSchedulesTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  reportMonth: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#3B82F6',
  },
  reportCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  reportButton: {
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
  },
  bottomPadding: {
    height: 100,
  },
});

export default StudentClassManagementApp;