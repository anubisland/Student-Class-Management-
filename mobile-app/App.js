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
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  
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
            <Button 
              mode="outlined" 
              onPress={() => setMonthPickerVisible(true)}
              style={styles.monthSelector}
            >
              Select Month: {getMonthName(currentMonth)}
            </Button>
            
            <Text variant="headlineLarge" style={styles.currentMonth}>
              {getMonthName(currentMonth)}
            </Text>
            
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
        {students.map(student => (
          <Card key={student.key} style={styles.card}>
            <Card.Title 
              title={`${student.name}'s Classes`}
              titleStyle={{ color: student.color }}
            />
            <Card.Content>
              <Text>Classes this month: {getStudentStats(student.key, currentMonth).classCount}</Text>
              <View style={styles.classesPreview}>
                {getMonthlyClasses(student.key, currentMonth).slice(0, 3).map(cls => (
                  <Chip 
                    key={cls.id} 
                    style={styles.classChip}
                    textStyle={styles.classChipText}
                  >
                    {formatDisplayDate(cls.date, cls.time)}
                  </Chip>
                ))}
                {getMonthlyClasses(student.key, currentMonth).length > 3 && (
                  <Text style={styles.moreClasses}>
                    +{getMonthlyClasses(student.key, currentMonth).length - 3} more
                  </Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))}

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
            onPress={() => {
              // Time picker will be handled by DateTimePicker
            }}
            style={styles.timeButton}
          >
            Time: {newScheduleTime.toTimeString().substring(0, 5)}
          </Button>
          
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
            onPress={() => {
              // Date picker will be handled by DateTimePicker
            }}
            style={styles.dateButton}
          >
            Date: {formatDate(newClassDate)}
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => {
              // Time picker will be handled by DateTimePicker
            }}
            style={styles.timeButton}
          >
            Time: {newClassTime.toTimeString().substring(0, 5)}
          </Button>
          
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
        onPress={() => {
          // Show class details - you could implement another modal here
        }}
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
  monthSelector: {
    marginBottom: 16,
  },
  currentMonth: {
    textAlign: 'center',
    color: '#3B82F6',
    fontWeight: 'bold',
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
  classesPreview: {
    marginTop: 8,
  },
  classChip: {
    marginVertical: 2,
    marginRight: 8,
  },
  classChipText: {
    fontSize: 12,
  },
  moreClasses: {
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 8,
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