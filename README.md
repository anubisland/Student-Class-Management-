# Family Class & Activity Management System (نظام إدارة حصص وأنشطة الأسرة)

A comprehensive application for managing children's classes, activities, weekly recurring schedules, and monthly financial reports for any family with any number of children. Available as both a **web application** and a **mobile app** (Android/iOS).

---

## 🌟 Key Features

### 👨‍👩‍👧‍👦 **1. Dynamic Children & Family Management**
- **Unlimited Children**: Add, edit, and manage profiles for any number of children (e.g., 3, 4, 5+ kids).
- **Custom Theme Colors**: Distinct color badges for each child for quick identification.
- **Family Profile**: Customize family name (e.g., *أسرة أحمد / Ahmed Family*) and preferred currency (EGP, SAR, AED, KWD, QAR, USD, EUR, GBP).

### 🎨 **2. Activities & Custom Pricing**
- **Multiple Activities per Child**: Add specific subjects or sports (e.g., English, Swimming, Math, Piano, Quran).
- **Flexible Pricing**: Assign individual prices per session/class for each activity and instructor name.
- **Dynamic Calculation**: Monthly totals automatically calculate based on actual session rates.

### 📅 **3. Smart Recurring Schedules & Auto-Generation**
- **Weekly Schedule Planner**: Set recurring weekly schedules per child and activity (e.g., Monday 5:00 PM, Thursday 4:00 PM).
- **One-Click Month Generation**: Automatically generate all month sessions for a specific child or all children simultaneously.
- **Duplicate Prevention & Timezone Safety**: Guarantees accurate dates and times without duplicate sessions.

### ➕ **4. Extra & Makeup Sessions**
- Add ad-hoc or makeup sessions outside the regular schedule.
- Override or specify custom prices per individual session.

### 📊 **5. Session Logs & Attendance Tracking**
- Filter sessions by child or view all.
- Mark session status as **Completed** or **Cancelled**.
- Delete or modify sessions with real-time total updates.

### 📑 **6. Monthly Reports, Invoicing & Exporting**
- **Individual Child Invoices**: Breakdown of sessions, price per activity, and total monthly sum.
- **Combined Family Financial Summary**: Consolidated monthly report of total expenditure and session counts.
- **Multiple Export Options**:
  - 📥 **Download Plain-Text Reports** (.txt)
  - 📊 **Export CSV for Excel** (.csv)
  - 💬 **One-Click Share to WhatsApp**
  - 🖨️ **Printable View & PDF Export**

### 💾 **7. Backup, Restore & Offline-First**
- **JSON Data Backup**: Export complete family data into a single `.json` backup file.
- **JSON Data Restore**: Import and restore your database instantly on any computer or browser.
- **100% Offline & Private**: All data resides securely in browser/device storage without external tracking.
- **Automatic Migration**: Automatically migrates previous legacy records seamlessly upon launch.

---

## 🚀 Getting Started

### 🌐 Web Application
1. Simply open [`index.html`](file:///index.html) in any modern browser (Chrome, Firefox, Safari, Edge).
2. Click **➕ Add Child** to add your children.
3. Add activities and pricing for each child.
4. Set up weekly recurring schedules and click **⚡ Generate Month Sessions**.
5. Switch languages anytime using the **EN | عر** toggle button in the header.

### 📱 Mobile App (Android / iOS)
The mobile app is built with **React Native** & **React Native Paper**.

To run or build:
```bash
cd mobile-app
npm install
npm run android # or npm run ios
```

---

## 🧪 Testing & CI/CD

Run the automated test suite with Jest:
```bash
npm test
```
- **Web App CI**: Automated Jest unit tests on every push.
- **Android APK Build**: Automated APK artifact builds on GitHub Actions.

---

Designed with ❤️ for families and tutors to make scheduling and financial tracking effortless.