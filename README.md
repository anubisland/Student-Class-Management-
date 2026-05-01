# Student Class Management System

A comprehensive application for managing classes, schedules, and monthly reports for two students: **Kareem** and **Sara_Hana**. Available as both a **web application** and a **mobile app** (Android/iOS).

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
├── index.html              # Web app HTML interface
├── script.js               # Web app JavaScript
├── README.md               # This documentation
├── mobile-app/             # React Native mobile app
│   ├── App.js              # Main mobile app component
│   ├── app.json            # App configuration
│   ├── package.json        # Dependencies
│   └── android/            # Android native code
└── react-native-app/       # Alternative React Native implementation
```

## Mobile App

The mobile app provides the same functionality as the web app, built with React Native for Android and iOS.

### Building the Android APK

Due to Windows path length limitations with React Native's new architecture, build from a short path:

```bash
# 1. Copy project to short path
mkdir C:\temp\student-app
xcopy /E mobile-app C:\temp\student-app

# 2. Install dependencies
cd C:\temp\student-app
npm install

# 3. Create local.properties (use forward slashes)
echo sdk.dir=C:/Users/YOUR_USERNAME/AppData/Local/Android/Sdk > android/local.properties

# 4. Build release APK
cd android
.\gradlew.bat assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### Installing on Emulator/Device

```bash
adb install -r app-release.apk
adb shell am start -n com.studentapp/.MainActivity
```

### Mobile App Features
- All web app features in a native mobile interface
- AsyncStorage for persistent local data
- Material Design UI with React Native Paper
- Share reports via native sharing
- Works offline

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

---

## CI/CD Pipelines

[![Web App CI](https://github.com/anubisland/Student-Class-Management-/actions/workflows/web-app-ci.yml/badge.svg)](https://github.com/anubisland/Student-Class-Management-/actions/workflows/web-app-ci.yml)
[![Build Android APK](https://github.com/anubisland/Student-Class-Management-/actions/workflows/build-android.yml/badge.svg)](https://github.com/anubisland/Student-Class-Management-/actions/workflows/build-android.yml)
[![Release](https://github.com/anubisland/Student-Class-Management-/actions/workflows/release.yml/badge.svg)](https://github.com/anubisland/Student-Class-Management-/actions/workflows/release.yml)

All pipelines run on GitHub Actions (`ubuntu-latest`).

| Workflow | Trigger | What it does |
|---|---|---|
| `web-app-ci.yml` | Push / PR → `main`, `develop` (path-filtered: `script.js`, `index.html`, `__tests__/**`) | Jest tests with coverage report (artifact: `web-app-coverage`) |
| `build-android.yml` | Push / PR → `main` | Android APK build → upload artifact (`app-release`) |
| `build-ios.yml` | Push / PR → `main` | iOS build |
| `test-coverage.yml` | Push / PR → `main`, `develop` (path-filtered: `mobile-app/**`) | Mobile test coverage, posts results to PR |
| `deploy-staging.yml` | Push → `main` (path-filtered: `index.html`, `script.js`) | Deploy web app to GitHub Pages |
| `release.yml` | Tag `v*.*.*` or manual dispatch | Android APK build → GitHub Release with APK attached |
| `release-schedule.yml` | Scheduled (every 2 days) or manual dispatch | Automated release cadence |

### Artifacts

- **Android APK**: available as workflow artifact `app-release` on every push to `main`
- **Web app coverage**: uploaded as `web-app-coverage` artifact (retained 14 days)
- **GitHub Release**: created on tag `v*.*.*` push; download `app-release.apk` to install on Android (enable "Install from unknown sources" in device settings)

Perfect for tutors, teachers, or anyone managing regular student classes with pricing and reporting needs!