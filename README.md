# Student Class Management System

A comprehensive web application for managing classes, schedules, and monthly reports for two students: **Kareem** and **Sara_Hana**.

## Features

### 🎯 **Core Features**
- **Student Management**: Separate tracking for Kareem and Sara_Hana
- **Monthly Scheduling**: Set up recurring weekly schedules for each student
- **Automatic Class Generation**: Generate all classes for a month based on schedules
- **Manual Class Addition**: Add extra classes outside the regular schedule
- **Time Tracking**: Record both date and time for each class
- **Pricing Management**: Customizable price per class for each student
- **Persistent Storage**: All data saved locally in browser database

### 📊 **Monthly Overview**
- Current month statistics at a glance
- Total classes and revenue for each student
- Combined totals for both students
- Month selector to view any period

### 📅 **Schedule Management**
- Set up recurring weekly schedules (e.g., Monday 9:00 AM, Wednesday 2:00 PM)
- Multiple schedule entries per student
- One-click generation of all monthly classes from schedules
- Easy schedule modification and deletion

### 📝 **Reporting System**
- Individual monthly reports for each student
- Combined monthly report for both students
- Detailed class lists with dates and times
- Downloadable text reports
- Revenue calculations and summaries

### 💾 **Database Features**
- Persistent local storage using browser localStorage
- Automatic save after every change
- Data survives browser restarts and page refreshes
- Visual save status indicators
- Error handling for storage operations

## How to Use

### Initial Setup
1. **Set Prices**: Configure the price per class for each student in the "Price Settings" section
2. **Create Schedules**: Add recurring weekly schedules for regular classes
3. **Generate Classes**: Use the "Generate Classes" button to create all classes for the month

### Daily Operations
1. **Add Extra Classes**: Use the "Add Extra Classes" section for makeup classes or additional sessions
2. **View Classes**: Check the "Class Details" section to see all classes for the selected month
3. **Delete Classes**: Remove individual classes if needed
4. **Change Month**: Use the month selector to view different periods

### Monthly Reports
1. **View Reports**: Check individual and combined reports in the "Monthly Reports" section
2. **Download Reports**: Save reports as text files for record-keeping
3. **Monitor Revenue**: Track total classes and revenue for each student

## Technical Details

### Data Storage
- **student-prices**: Price per class for each student
- **student-classes**: All class records with dates and times
- **student-schedules**: Recurring weekly schedules for each student

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses HTML5 localStorage for data persistence

### File Structure
```
Student-Class-Management-/
├── index.html          # Main HTML interface
├── script.js          # JavaScript functionality
└── README.md          # This documentation file
```

## Features in Detail

### Monthly Schedule System
Set up recurring schedules like:
- **Kareem**: Monday 9:00 AM, Wednesday 2:00 PM, Friday 10:00 AM
- **Sara_Hana**: Tuesday 11:00 AM, Thursday 3:00 PM, Saturday 9:00 AM

Then generate all classes for any month with one click!

### Smart Date Handling
- Timezone-safe date handling
- Proper date parsing and display
- Sorted class lists (most recent first)
- Duplicate prevention

### Comprehensive Reports
Each report includes:
- Student name and month
- Total number of classes
- Price per class
- Total monthly amount
- Detailed class list with dates and times
- Generation timestamp

### Auto-Save System
- Automatic save after every change
- Visual confirmation when data is saved
- Error handling if save fails
- Loading indicator on app startup

## Getting Started

1. **Open the Application**: Open `index.html` in your web browser
2. **Set Prices**: Enter the price per class for each student
3. **Add Schedules**: Create weekly recurring schedules
4. **Generate Classes**: Create monthly classes from schedules
5. **Add Extra Classes**: Use for additional or makeup sessions
6. **Generate Reports**: Download monthly reports for record-keeping

## Data Safety

- All data is stored locally in your browser
- Data persists across browser sessions
- No data is sent to external servers
- Backup by downloading monthly reports

## Updates and Improvements

This system includes all improvements from the Claude conversation:
- ✅ Fixed timezone date issues
- ✅ Added time tracking
- ✅ Monthly schedule system
- ✅ Automatic class generation
- ✅ Persistent database storage
- ✅ Combined reporting
- ✅ Name correction (Kareem)
- ✅ Enhanced user interface
- ✅ Comprehensive error handling

Perfect for tutors, teachers, or anyone managing regular student classes with pricing and reporting needs!