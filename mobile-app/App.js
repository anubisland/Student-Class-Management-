import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  Alert,
  Share,
  PermissionsAndroid,
  Platform,
  Linking,
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
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [classModalVisible, setClassModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  
  // Form states
  const [selectedStudent, setSelectedStudent] = useState('kareem');
  const [newClassDate, setNewClassDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [selectedClassTime, setSelectedClassTime] = useState('10:00');
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedScheduleHour, setSelectedScheduleHour] = useState(10);
  const [selectedScheduleMinute, setSelectedScheduleMinute] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeInputMode, setTimeInputMode] = useState('selector'); // 'selector' or 'input'
  const [scheduleTimeInputMode, setScheduleTimeInputMode] = useState('selector');
  const [timeInputText, setTimeInputText] = useState('10:00');
  const [scheduleTimeInputText, setScheduleTimeInputText] = useState('10:00');
  const [showQuickMinutes, setShowQuickMinutes] = useState(true);

  const students = [
    { key: 'kareem', name: 'Kareem', color: '#3B82F6' },
    { key: 'saraHana', name: 'Sara_Hana', color: '#EC4899' }
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const hours = Array.from({length: 24}, (_, i) => i);
  const minutes = Array.from({length: 60}, (_, i) => i);
  const quickMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

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
      console.log(`[SAVE] Attempting to save key: ${key}`);
      console.log(`[SAVE] Data to save:`, JSON.stringify(data, null, 2));
      
      const dataString = JSON.stringify(data);
      await AsyncStorage.setItem(key, dataString);
      
      // Verify save by reading back
      const savedData = await AsyncStorage.getItem(key);
      console.log(`[SAVE] Successfully saved and verified ${key}`);
      
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
  };

  const navigateMonth = (direction) => {
    const [year, month] = currentMonth.split('-');
    const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);
    const newMonthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewClassDate(selectedDate);
    }
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

  // Handle time input changes for manual time entry
  const handleTimeInputChange = (text, isSchedule = false) => {
    // Allow only numbers and colon
    const cleanedText = text.replace(/[^0-9:]/g, '');

    if (isSchedule) {
      setScheduleTimeInputText(cleanedText);
    } else {
      setTimeInputText(cleanedText);
    }

    // Parse the time if it's in valid format (HH:MM)
    const timeMatch = cleanedText.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const mins = parseInt(timeMatch[2], 10);

      if (hours >= 0 && hours <= 23 && mins >= 0 && mins <= 59) {
        if (isSchedule) {
          setSelectedScheduleHour(hours);
          setSelectedScheduleMinute(mins);
        } else {
          setSelectedHour(hours);
          setSelectedMinute(mins);
        }
      }
    }
  };

  // Schedule management
  const addSchedule = () => {
    console.log('=== ADD SCHEDULE BUTTON PRESSED ===');
    console.log('selectedStudent:', selectedStudent);
    console.log('selectedDay:', selectedDay);
    console.log('selectedScheduleHour:', selectedScheduleHour);
    console.log('selectedScheduleMinute:', selectedScheduleMinute);
    
    // Get student name for display
    const studentName = students.find(s => s.key === selectedStudent)?.name;
    console.log('studentName:', studentName);
    
    // Format the time
    const formattedTime = getFormattedScheduleTime();
    console.log('formattedTime:', formattedTime);
    
    // Create the new schedule object
    const newSchedule = {
      id: Date.now(),
      day: selectedDay,
      time: formattedTime,
      student: selectedStudent
    };
    
    console.log('newSchedule created:', newSchedule);
    
    // Get current schedules from state
    const currentSchedules = { ...schedules };
    console.log('currentSchedules before:', currentSchedules);
    
    // Initialize array if it doesn't exist
    if (!currentSchedules[selectedStudent]) {
      currentSchedules[selectedStudent] = [];
    }
    
    // Add the new schedule
    currentSchedules[selectedStudent].push(newSchedule);
    console.log('currentSchedules after adding:', currentSchedules);
    
    // Update state immediately
    setSchedules(currentSchedules);
    console.log('State updated with setSchedules');
    
    // Save to AsyncStorage
    AsyncStorage.setItem('student-schedules', JSON.stringify(currentSchedules))
      .then(() => {
        console.log('Successfully saved to AsyncStorage');
        setScheduleModalVisible(false);
        Alert.alert(
          'Schedule Added!',
          `${studentName}: ${selectedDay} at ${formattedTime}`
        );
      })
      .catch((error) => {
        console.error('Failed to save to AsyncStorage:', error);
        Alert.alert('Error', 'Failed to save schedule');
      });
  };

  // Remove a schedule
  const removeSchedule = async (studentKey, scheduleId) => {
    const studentName = students.find(s => s.key === studentKey)?.name;

    Alert.alert(
      'Remove Schedule',
      `Are you sure you want to remove this schedule for ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedSchedules = { ...schedules };
            updatedSchedules[studentKey] = (updatedSchedules[studentKey] || []).filter(
              s => s.id !== scheduleId
            );

            setSchedules(updatedSchedules);
            await saveToDatabase('student-schedules', updatedSchedules);
            Alert.alert('Success', 'Schedule removed!');
          }
        }
      ]
    );
  };

  // Remove a class
  const removeClass = async (studentKey, classId) => {
    const studentName = students.find(s => s.key === studentKey)?.name;

    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete this class for ${studentName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedClasses = { ...classes };
            updatedClasses[studentKey] = (updatedClasses[studentKey] || []).filter(
              c => c.id !== classId
            );

            setClasses(updatedClasses);
            await saveToDatabase('student-classes', updatedClasses);
            Alert.alert('Success', 'Class deleted!');
          }
        }
      ]
    );
  };

  const generateClassesForStudent = async (studentKey) => {
    try {
      console.log('=== Generating classes for student:', studentKey);
      console.log('Current schedules:', schedules);
      console.log('Student schedules:', schedules[studentKey]);
      console.log('Current month:', currentMonth);
      
      // Validate current month
      if (!currentMonth) {
        Alert.alert('Error', 'Please navigate to a month first');
        return;
      }
      
      // Get student schedules
      const studentSchedules = schedules[studentKey] || [];
      console.log('Found', studentSchedules.length, 'schedules for', studentKey);
      
      if (studentSchedules.length === 0) {
        const studentName = students.find(s => s.key === studentKey)?.name;
        Alert.alert('No Schedules', `Please add schedules for ${studentName} first using the "Add Schedule" button.`);
        return;
      }
      
      // Parse current month
      const [year, month] = currentMonth.split('-');
      const yearInt = parseInt(year);
      const monthInt = parseInt(month);
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
      
      console.log(`Processing ${getMonthName(currentMonth)} - ${daysInMonth} days`);
      
      // Generate classes
      let totalGenerated = 0;
      const updatedClasses = { ...classes };
      if (!updatedClasses[studentKey]) {
        updatedClasses[studentKey] = [];
      }
      
      // Process each schedule
      studentSchedules.forEach((schedule, scheduleIndex) => {
        console.log(`Processing schedule ${scheduleIndex + 1}:`, schedule);
        
        // Check each day in the month
        for (let day = 1; day <= daysInMonth; day++) {
          const checkDate = new Date(yearInt, monthInt - 1, day);
          const dayOfWeek = checkDate.toLocaleDateString('en-US', { weekday: 'long' });
          
          if (dayOfWeek === schedule.day) {
            const dateString = formatDate(checkDate);
            console.log(`Found ${schedule.day} on ${dateString}`);
            
            // Check if class already exists
            const existingClass = updatedClasses[studentKey].find(
              cls => cls.date === dateString && cls.time === schedule.time
            );
            
            if (!existingClass) {
              const newClass = {
                id: `class_${studentKey}_${dateString}_${schedule.time}_${Date.now()}_${Math.random().toString(36).substring(2)}`,
                date: dateString,
                time: schedule.time,
                student: studentKey,
                timestamp: new Date().toISOString(),
                generated: true
              };
              
              updatedClasses[studentKey].push(newClass);
              totalGenerated++;
              console.log('Generated class:', newClass);
            } else {
              console.log('Class already exists for', dateString, schedule.time);
            }
          }
        }
      });
      
      console.log(`Total classes generated: ${totalGenerated}`);
      
      // Save to state and database
      setClasses(updatedClasses);
      const saveResult = await saveToDatabase('student-classes', updatedClasses);
      
      if (saveResult) {
        const studentName = students.find(s => s.key === studentKey)?.name;
        if (totalGenerated > 0) {
          Alert.alert('Success!', `Generated ${totalGenerated} classes for ${studentName} in ${getMonthName(currentMonth)}`);
        } else {
          Alert.alert('Info', `No new classes to generate for ${studentName}. All scheduled classes already exist.`);
        }
      } else {
        Alert.alert('Error', 'Failed to save classes to database');
      }
      
    } catch (error) {
      console.error('Generate classes error:', error);
      Alert.alert('Error', `Failed to generate classes: ${error.message}`);
    }
  };

  const generateClasses = async () => {
    try {
      console.log('Current schedules:', schedules);
      console.log('Current month:', currentMonth);
      
      // Validate inputs
      if (!currentMonth) {
        Alert.alert('Error', 'Please select a month first');
        return;
      }
      
      const hasSchedules = Object.values(schedules).some(arr => arr && arr.length > 0);
      if (!hasSchedules) {
        Alert.alert('No Schedules', 'Please add schedules first before generating classes');
        return;
      }
      
      const [year, month] = currentMonth.split('-');
      const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
      console.log('Days in month:', daysInMonth, 'for', year, month);
      
      const generatedClasses = { ...classes };
      let totalGenerated = 0;

      // Generate classes for each student based on their schedules
      Object.keys(schedules).forEach(studentKey => {
        const studentSchedules = schedules[studentKey] || [];
        console.log(`Processing ${studentKey} schedules:`, studentSchedules);
        
        studentSchedules.forEach(schedule => {
          console.log(`Processing schedule:`, schedule);
          
          // Find all dates in the month that match this day of the week
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(parseInt(year), parseInt(month) - 1, day);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            
            if (dayName === schedule.day) {
              const dateString = formatDate(date);
              console.log(`Found matching day: ${dateString} (${dayName})`);
              
              // Check if class already exists for this date/time
              const existingClass = generatedClasses[studentKey]?.find(
                cls => cls.date === dateString && cls.time === schedule.time
              );
              
              if (!existingClass) {
                const newClass = {
                  id: `generated_${studentKey}_${dateString}_${schedule.time}_${Date.now()}_${Math.random()}`,
                  date: dateString,
                  time: schedule.time,
                  timestamp: new Date().toISOString(),
                  generated: true,
                  student: studentKey
                };
                
                if (!generatedClasses[studentKey]) {
                  generatedClasses[studentKey] = [];
                }
                generatedClasses[studentKey].push(newClass);
                totalGenerated++;
                console.log('Generated class:', newClass);
              } else {
                console.log('Class already exists for', dateString, schedule.time);
              }
            }
          }
        });
      });

      console.log('Total generated:', totalGenerated);
      console.log('Final classes:', generatedClasses);

      setClasses(generatedClasses);
      const saved = await saveToDatabase('student-classes', generatedClasses);
      
      if (saved) {
        if (totalGenerated > 0) {
          Alert.alert('Success', `Generated ${totalGenerated} classes for ${getMonthName(currentMonth)}!`);
        } else {
          Alert.alert('Info', 'No new classes to generate. All scheduled classes already exist.');
        }
      } else {
        throw new Error('Failed to save classes to database');
      }
    } catch (error) {
      console.error('Generate classes error:', error);
      Alert.alert('Error', 'Failed to generate classes: ' + error.message);
    }
  };

  // Class management
  const addClass = async () => {
    const dateString = formatDate(newClassDate);
    const timeString = getFormattedTime();

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
    setSelectedHour(10);
    setSelectedMinute(0);
    setClassModalVisible(false);
    Alert.alert('Success', 'Class added successfully!');
  };

  // Report generation
  const generateReport = async (type) => {
    const monthName = getMonthName(currentMonth);
    let reportText = `Student Class Management Report\n${monthName}\n\n`;
    
    if (type === 'combined') {
      reportText += 'Combined Report\n';
      reportText += `Kareem: ${getMonthlyClasses('kareem', currentMonth).length} classes\n`;
      reportText += `Sara_Hana: ${getMonthlyClasses('saraHana', currentMonth).length} classes\n`;
    } else {
      const student = students.find(s => s.key === type);
      const monthlyClasses = getMonthlyClasses(type, currentMonth);
      const studentPrice = parseFloat(prices[type]) || 0;
      const total = monthlyClasses.length * studentPrice;
      
      reportText += `${student?.name} Report\n`;
      reportText += `Total Classes: ${monthlyClasses.length}\n`;
      reportText += `Price per Class: $${studentPrice.toFixed(2)}\n`;
      reportText += `Total Amount: $${total.toFixed(2)}\n`;
    }

    try {
      await Share.share({
        message: reportText,
        title: `${monthName} Report`,
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const downloadReport = async (type) => {
    const monthName = getMonthName(currentMonth);
    let reportContent = `Student Class Management Report\n${monthName}\n${'='.repeat(50)}\n\n`;
    let fileName = '';
    
    if (type === 'combined') {
      const kareemClasses = getMonthlyClasses('kareem', currentMonth);
      const saraHanaClasses = getMonthlyClasses('saraHana', currentMonth);
      const kareemPrice = parseFloat(prices.kareem) || 0;
      const saraHanaPrice = parseFloat(prices.saraHana) || 0;
      const kareemTotal = kareemClasses.length * kareemPrice;
      const saraHanaTotal = saraHanaClasses.length * saraHanaPrice;
      const grandTotal = kareemTotal + saraHanaTotal;
      
      fileName = `Combined_Report_${monthName.replace(' ', '_')}.txt`;
      reportContent += `COMBINED MONTHLY REPORT\n\n`;
      reportContent += `Kareem:\n`;
      reportContent += `  Classes: ${kareemClasses.length}\n`;
      reportContent += `  Price per Class: $${kareemPrice.toFixed(2)}\n`;
      reportContent += `  Total: $${kareemTotal.toFixed(2)}\n\n`;
      reportContent += `Sara_Hana:\n`;
      reportContent += `  Classes: ${saraHanaClasses.length}\n`;
      reportContent += `  Price per Class: $${saraHanaPrice.toFixed(2)}\n`;
      reportContent += `  Total: $${saraHanaTotal.toFixed(2)}\n\n`;
      reportContent += `${'='.repeat(30)}\n`;
      reportContent += `GRAND TOTAL: $${grandTotal.toFixed(2)}\n`;
    } else {
      const student = students.find(s => s.key === type);
      const monthlyClasses = getMonthlyClasses(type, currentMonth);
      const studentPrice = parseFloat(prices[type]) || 0;
      const total = monthlyClasses.length * studentPrice;
      
      fileName = `${student?.name}_Report_${monthName.replace(' ', '_')}.txt`;
      reportContent += `${student?.name.toUpperCase()} REPORT\n\n`;
      reportContent += `Total Classes: ${monthlyClasses.length}\n`;
      reportContent += `Price per Class: $${studentPrice.toFixed(2)}\n`;
      reportContent += `Total Amount: $${total.toFixed(2)}\n\n`;
      
      if (monthlyClasses.length > 0) {
        reportContent += `CLASS DETAILS:\n`;
        reportContent += `${'='.repeat(30)}\n`;
        monthlyClasses.forEach((cls, index) => {
          reportContent += `${index + 1}. ${cls.date} at ${cls.time}\n`;
        });
      }
    }
    
    reportContent += `\n\nGenerated on: ${new Date().toLocaleString()}\n`;
    reportContent += `Student Class Management App v1.0\n`;

    try {
      // Create a data URI with the report content
      const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(reportContent)}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      
      // For mobile devices, we'll use the Share API with the content
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        await Share.share({
          message: reportContent,
          title: `Download ${fileName}`,
        });
        Alert.alert('Report Ready', `${fileName} is ready to save. Use the share options to save to your device.`);
      } else {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Success', `${fileName} has been downloaded!`);
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download report');
    }
  };

  // Helper functions
  const getMonthlyClasses = (student, month) => {
    if (!classes[student]) return [];
    
    return classes[student]
      .filter((cls) => cls.date.startsWith(month))
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB.getTime() - dateA.getTime();
      });
  };

  const getAvailableMonths = () => {
    const months = new Set();
    
    // Add current month and next 11 months (12 months total)
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthString);
    }
    
    // Add months from existing classes
    Object.values(classes).forEach(studentClasses => {
      studentClasses.forEach(cls => {
        const monthString = cls.date.substring(0, 7); // YYYY-MM format
        months.add(monthString);
      });
    });
    
    return Array.from(months).sort((a, b) => a.localeCompare(b)); // Chronological order (current first)
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
            <View style={styles.monthNavigationContainer}>
              <Button 
                mode="contained" 
                onPress={() => navigateMonth(-1)}
                style={styles.navButton}
                compact
              >
                {"< Prev"}
              </Button>
              
              <Text variant="headlineMedium" style={styles.currentMonthDisplay}>
                {getMonthName(currentMonth)}
              </Text>
              
              <Button 
                mode="contained" 
                onPress={() => navigateMonth(1)}
                style={styles.navButton}
                compact
              >
                Next >
              </Button>
            </View>
            
            <Button 
              mode="text" 
              onPress={setCurrentMonthToNow}
              style={styles.currentMonthButton}
            >
              Go to Current Month
            </Button>
            
            <View style={styles.statsContainer}>
              <Surface style={[styles.studentCard, { backgroundColor: '#EBF8FF' }]}>
                <Text variant="headlineSmall" style={{ color: '#1E40AF' }}>Kareem</Text>
                <Text>Classes: {kareemStats.classCount}</Text>
                <Text style={{ color: '#10B981' }}>Total: ${kareemStats.total.toFixed(2)}</Text>
              </Surface>
              
              <Surface style={[styles.studentCard, { backgroundColor: '#FDF2F8' }]}>
                <Text variant="headlineSmall" style={{ color: '#BE185D' }}>Sara_Hana</Text>
                <Text>Classes: {saraHanaStats.classCount}</Text>
                <Text style={{ color: '#10B981' }}>Total: ${saraHanaStats.total.toFixed(2)}</Text>
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
            <Card key={student.key} style={styles.card}>
              <Card.Title
                title={`${student.name}'s Classes`}
                titleStyle={{ color: student.color }}
              />
              <Card.Content>
                <View style={styles.classStatsRow}>
                  <Text>Classes: {stats.classCount}</Text>
                  <Text style={styles.totalAmount}>Total: ${stats.total.toFixed(2)}</Text>
                </View>

                {studentClasses.length > 0 ? (
                  <View style={styles.classListContainer}>
                    <Text style={styles.classListTitle}>Class Details:</Text>
                    {studentClasses.map((cls, index) => (
                      <Surface key={cls.id} style={styles.classItem}>
                        <View style={styles.classItemRow}>
                          <View style={styles.classItemInfo}>
                            <Text style={styles.classItemDate}>{cls.date}</Text>
                            <Text style={styles.classItemTime}>at {cls.time}</Text>
                          </View>
                          <Button
                            mode="text"
                            onPress={() => removeClass(student.key, cls.id)}
                            textColor="#EF4444"
                            compact
                          >
                            Delete
                          </Button>
                        </View>
                      </Surface>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noClassesText}>No classes scheduled this month</Text>
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
                style={[styles.actionButton, { backgroundColor: '#A855F7' }]}
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

        {/* Generate Monthly Classes */}
        <Card style={styles.card}>
          <Card.Title title="Generate Monthly Classes" />
          <Card.Content>
            {students.map(student => (
              <Button 
                key={student.key}
                mode="contained" 
                onPress={() => generateClassesForStudent(student.key)}
                style={[styles.generateButton, { backgroundColor: student.color }]}
                disabled={!schedules[student.key] || schedules[student.key].length === 0}
              >
                Generate Classes for {student.name}
              </Button>
            ))}
          </Card.Content>
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>

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
            style={styles.priceInput}
          />
          
          <TextInput
            label="Sara_Hana - Price per Class"
            value={prices.saraHana}
            onChangeText={(text) => updatePrice('saraHana', text)}
            keyboardType="numeric"
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

      {/* Add Class Modal */}
      <Portal>
        <Modal 
          visible={classModalVisible} 
          onDismiss={() => setClassModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Add Class</Text>
          
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
          
          <Text style={styles.modalLabel}>Select Date:</Text>
          <TextInput
            label="Date (YYYY-MM-DD)"
            value={formatDate(newClassDate)}
            onChangeText={(text) => {
              // Validate and parse date
              const dateMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
              if (dateMatch) {
                const year = parseInt(dateMatch[1], 10);
                const month = parseInt(dateMatch[2], 10) - 1;
                const day = parseInt(dateMatch[3], 10);
                const parsedDate = new Date(year, month, day);
                if (!isNaN(parsedDate.getTime())) {
                  setNewClassDate(parsedDate);
                }
              }
            }}
            placeholder="YYYY-MM-DD"
            style={styles.dateInput}
            mode="outlined"
          />
          <Text style={styles.dateHint}>Format: YYYY-MM-DD (e.g., 2025-01-21)</Text>
          
          <Text style={styles.modalLabel}>Select Time: {getFormattedTime()}</Text>
          
          <Text style={styles.timeSubLabel}>Hour:</Text>
          <ScrollView style={styles.timeScrollView} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.hourSelector}>
              {hours.map(hour => (
                <Chip
                  key={hour}
                  selected={selectedHour === hour}
                  onPress={() => setSelectedHour(hour)}
                  style={styles.timeChip}
                >
                  {String(hour).padStart(2, '0')}
                </Chip>
              ))}
            </View>
          </ScrollView>
          
          <Text style={styles.timeSubLabel}>Minute:</Text>
          <ScrollView style={styles.timeScrollView} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.minuteSelector}>
              {minutes.map(minute => (
                <Chip
                  key={minute}
                  selected={selectedMinute === minute}
                  onPress={() => setSelectedMinute(minute)}
                  style={styles.timeChip}
                >
                  {String(minute).padStart(2, '0')}
                </Chip>
              ))}
            </View>
          </ScrollView>
          
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
            {daysOfWeek.map(day => (
              <Chip
                key={day}
                selected={selectedDay === day}
                onPress={() => setSelectedDay(day)}
                style={styles.dayChip}
              >
                {day}
              </Chip>
            ))}
          </View>
          
          <Text style={styles.modalLabel}>Select Time: {getFormattedScheduleTime()}</Text>
          
          <View style={styles.timeInputModeContainer}>
            <Button 
              mode={scheduleTimeInputMode === 'selector' ? 'contained' : 'outlined'}
              onPress={() => setScheduleTimeInputMode('selector')}
              style={styles.timeInputModeButton}
              compact
            >
              Selector
            </Button>
            <Button 
              mode={scheduleTimeInputMode === 'input' ? 'contained' : 'outlined'}
              onPress={() => setScheduleTimeInputMode('input')}
              style={styles.timeInputModeButton}
              compact
            >
              Manual Input
            </Button>
          </View>

          {scheduleTimeInputMode === 'input' ? (
            <View style={styles.timeInputContainer}>
              <TextInput
                label="Time (HH:MM)"
                value={scheduleTimeInputText}
                onChangeText={(text) => handleTimeInputChange(text, true)}
                placeholder="10:00"
                keyboardType="numeric"
                style={styles.timeInput}
                mode="outlined"
              />
              <Text style={styles.timeInputHint}>Format: HH:MM (24-hour)</Text>
            </View>
          ) : (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
                <Text style={styles.timeSubLabel}>Hour:</Text>
                <View style={styles.hourSelector}>
                  {hours.map(hour => (
                    <Chip
                      key={hour}
                      selected={selectedScheduleHour === hour}
                      onPress={() => {
                        setSelectedScheduleHour(hour);
                        setScheduleTimeInputText(getFormattedScheduleTime());
                      }}
                      style={styles.timeChip}
                    >
                      {String(hour).padStart(2, '0')}
                    </Chip>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.minuteSelectorContainer}>
                <View style={styles.minuteModeToggle}>
                  <Text style={styles.timeSubLabel}>Minutes:</Text>
                  <Button
                    mode="text"
                    onPress={() => setShowQuickMinutes(!showQuickMinutes)}
                    compact
                  >
                    {showQuickMinutes ? 'Show All' : 'Quick Select'}
                  </Button>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScrollView}>
                  <View style={styles.minuteSelector}>
                    {(showQuickMinutes ? quickMinutes : minutes).map(minute => (
                      <Chip
                        key={minute}
                        selected={selectedScheduleMinute === minute}
                        onPress={() => {
                          setSelectedScheduleMinute(minute);
                          setScheduleTimeInputText(getFormattedScheduleTime());
                        }}
                        style={styles.timeChip}
                      >
                        {String(minute).padStart(2, '0')}
                      </Chip>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
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
          <Text style={styles.modalLabel}>
            Existing Schedules for {students.find(s => s.key === selectedStudent)?.name}:
          </Text>
          {(schedules[selectedStudent] || []).length > 0 ? (
            (schedules[selectedStudent] || []).map(schedule => (
              <Surface key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleRow}>
                  <Text style={styles.scheduleText}>{schedule.day} at {schedule.time}</Text>
                  <Button
                    mode="text"
                    onPress={() => removeSchedule(selectedStudent, schedule.id)}
                    textColor="#EF4444"
                    compact
                  >
                    Remove
                  </Button>
                </View>
              </Surface>
            ))
          ) : (
            <Text style={styles.noScheduleText}>No schedules yet</Text>
          )}
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
                  Share {student.name}'s Report
                </Button>
                <Button
                  mode="contained"
                  onPress={() => downloadReport(student.key)}
                  style={[styles.reportButton, styles.downloadButton]}
                  icon="download"
                >
                  Download Report
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
              Share Combined Report
            </Button>
            <Button
              mode="contained"
              onPress={() => downloadReport('combined')}
              style={[styles.reportButton, styles.downloadButton]}
              icon="download"
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
  monthNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    minWidth: 80,
  },
  currentMonthDisplay: {
    textAlign: 'center',
    color: '#3B82F6',
    fontWeight: 'bold',
    flex: 1,
  },
  currentMonthButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  tapToView: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  classStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalAmount: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  noClassesText: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  generateButton: {
    marginVertical: 4,
    marginHorizontal: 0,
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
  dateButton: {
    marginVertical: 8,
  },
  dateInput: {
    marginBottom: 8,
  },
  dateHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginBottom: 16,
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
  sectionTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#3B82F6',
  },
  scheduleCard: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  schedulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  scheduleChip: {
    margin: 4,
  },
  noScheduleText: {
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 4,
  },
  scheduleActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  scheduleActionButton: {
    width: '48%',
  },
  daySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  dayChip: {
    margin: 2,
  },
  timeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  timeScrollView: {
    maxHeight: 120,
    marginBottom: 16,
  },
  hourSelector: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  minuteSelector: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  timeSubLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  timeChip: {
    margin: 2,
    minWidth: 50,
  },
  monthsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  monthItem: {
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  selectedMonthItem: {
    backgroundColor: '#EBF8FF',
    elevation: 3,
  },
  monthButton: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  monthButtonText: {
    fontSize: 16,
    textAlign: 'left',
  },
  selectedMonthButtonText: {
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 100,
  },
  timeInputModeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'center',
  },
  timeInputModeButton: {
    marginHorizontal: 8,
    minWidth: 100,
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInput: {
    marginBottom: 8,
  },
  timeInputHint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  minuteSelectorContainer: {
    marginTop: 8,
  },
  minuteModeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleText: {
    flex: 1,
    fontSize: 14,
  },
  classListContainer: {
    marginTop: 12,
  },
  classListTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
  },
  classItem: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  classItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classItemInfo: {
    flex: 1,
  },
  classItemDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  classItemTime: {
    fontSize: 12,
    color: '#6366F1',
  },
});

export default StudentClassManagementApp;