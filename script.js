// Student Class Management System - JavaScript

class StudentClassManager {
    constructor() {
        this.students = ['kareem', 'saraHana'];
        this.prices = {};
        this.classes = {};
        this.schedules = {};
        this.currentMonth = '';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setCurrentMonth();
        this.updateDisplay();
    }

    // Database operations
    saveToDatabase(key, data) {
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
            this.showStatus('✓ Saved', 'text-green-600');
            return true;
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus('✗ Save Failed', 'text-red-600');
            return false;
        }
    }

    loadFromDatabase(key, defaultValue = {}) {
        try {
            const data = window.localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Load error:', error);
            return defaultValue;
        }
    }

    loadData() {
        this.showStatus('Loading...', 'text-yellow-600');
        
        this.prices = this.loadFromDatabase('student-prices', {
            kareem: 25.00,
            saraHana: 30.00
        });
        
        this.classes = this.loadFromDatabase('student-classes', {});
        
        this.schedules = this.loadFromDatabase('student-schedules', {
            kareem: [],
            saraHana: []
        });

        // Update UI with loaded data
        document.getElementById('kareemPrice').value = this.prices.kareem || '';
        document.getElementById('saraHanaPrice').value = this.prices.saraHana || '';

        this.showStatus('✓ Data Loaded', 'text-green-600');
    }

    showStatus(message, className) {
        const statusElement = document.getElementById('saveStatus');
        // Clear first so aria-live re-announces even if message is the same
        statusElement.textContent = '';
        requestAnimationFrame(() => {
            statusElement.textContent = message;
            statusElement.className = `text-sm font-medium ${className}`;
        });

        if (message.includes('✓')) {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'text-sm font-medium';
            }, 2000);
        }
    }

    // Date helpers
    getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    parseLocalDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }

    formatDisplayDate(dateString, timeString = null) {
        const date = this.parseLocalDate(dateString);
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
    }

    getMonthName(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }

    setCurrentMonth() {
        const now = new Date();
        this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('monthSelector').value = this.currentMonth;
    }

    setupEventListeners() {
        // Price changes
        document.getElementById('kareemPrice').addEventListener('change', (e) => {
            this.prices.kareem = parseFloat(e.target.value) || 0;
            this.saveToDatabase('student-prices', this.prices);
            this.updateDisplay();
        });

        document.getElementById('saraHanaPrice').addEventListener('change', (e) => {
            this.prices.saraHana = parseFloat(e.target.value) || 0;
            this.saveToDatabase('student-prices', this.prices);
            this.updateDisplay();
        });

        // Month selector
        document.getElementById('monthSelector').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.updateDisplay();
        });

        // Set default dates to today
        const today = this.getLocalDateString(new Date());
        document.getElementById('kareemDate').value = today;
        document.getElementById('saraHanaDate').value = today;
    }

    // Schedule management
    addSchedule(student) {
        const daySelect = document.getElementById(`${student}ScheduleDay`);
        const timeInput = document.getElementById(`${student}ScheduleTime`);
        
        const day = daySelect.value;
        const time = timeInput.value;
        
        if (!day || !time) {
            alert('Please select both day and time');
            return;
        }
        
        const schedule = {
            id: Date.now(),
            day: day,
            time: time
        };
        
        if (!this.schedules[student]) {
            this.schedules[student] = [];
        }
        
        this.schedules[student].push(schedule);
        this.saveToDatabase('student-schedules', this.schedules);
        
        // Reset form
        daySelect.value = '';
        timeInput.value = '09:00';
        
        this.updateScheduleDisplay();
    }

    removeSchedule(student, scheduleId) {
        this.schedules[student] = this.schedules[student].filter(s => s.id !== scheduleId);
        this.saveToDatabase('student-schedules', this.schedules);
        this.updateScheduleDisplay();
    }

    updateScheduleDisplay() {
        this.students.forEach(student => {
            const container = document.getElementById(`${student}ScheduleList`);
            const schedules = this.schedules[student] || [];
            
            if (schedules.length === 0) {
                container.innerHTML = '<p class="text-gray-500 text-sm">No schedules set</p>';
                return;
            }
            
            container.innerHTML = schedules.map(schedule => `
                <div class="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <span class="font-medium">${schedule.day.charAt(0).toUpperCase() + schedule.day.slice(1)} at ${schedule.time}</span>
                    <button type="button" onclick="classManager.removeSchedule('${student}', ${schedule.id})"
                            class="text-red-500 hover:text-red-700 text-sm">
                        Remove
                    </button>
                </div>
            `).join('');
            // Add accessible labels to each Remove button via DOM (avoids XSS-prone inline string interpolation)
            const studentName = student === 'kareem' ? 'Kareem' : 'Sara_Hana';
            container.querySelectorAll('button').forEach((btn, i) => {
                const s = schedules[i];
                const day = s.day.charAt(0).toUpperCase() + s.day.slice(1);
                btn.setAttribute('aria-label', `Remove ${day} at ${s.time} schedule for ${studentName}`);
            });
        });
    }

    // Generate classes from schedule
    generateMonthlyClasses(student) {
        const schedules = this.schedules[student] || [];
        if (schedules.length === 0) {
            alert(`No schedules set for ${student === 'kareem' ? 'Kareem' : 'Sara_Hana'}`);
            return;
        }

        const [year, month] = this.currentMonth.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        
        let generatedCount = 0;
        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dayOfWeek = date.getDay();
            
            schedules.forEach(schedule => {
                if (dayMap[schedule.day] === dayOfWeek) {
                    const dateString = this.getLocalDateString(date);
                    
                    if (!this.classExists(student, dateString, schedule.time)) {
                        this.addClassToDatabase(student, dateString, schedule.time);
                        generatedCount++;
                    }
                }
            });
        }
        
        const studentName = student === 'kareem' ? 'Kareem' : 'Sara_Hana';
        const monthName = this.getMonthName(this.currentMonth);
        alert(`Generated ${generatedCount} classes for ${studentName} in ${monthName}`);
        
        this.updateDisplay();
    }

    classExists(student, date, time) {
        if (!this.classes[student]) return false;
        return this.classes[student].some(cls => cls.date === date && cls.time === time);
    }

    // Class management
    addClass(student) {
        const dateInput = document.getElementById(`${student}Date`);
        const timeInput = document.getElementById(`${student}Time`);
        
        const date = dateInput.value;
        const time = timeInput.value;
        
        if (!date || !time) {
            alert('Please select both date and time');
            return;
        }
        
        if (this.classExists(student, date, time)) {
            alert('A class already exists for this date and time');
            return;
        }
        
        this.addClassToDatabase(student, date, time);
        this.updateDisplay();
        
        // Reset to current date
        const today = this.getLocalDateString(new Date());
        dateInput.value = today;
    }

    addClassToDatabase(student, date, time) {
        if (!this.classes[student]) {
            this.classes[student] = [];
        }
        
        this.classes[student].push({
            id: Date.now(),
            date: date,
            time: time,
            timestamp: new Date().toISOString()
        });
        
        this.saveToDatabase('student-classes', this.classes);
    }

    removeClass(student, classId) {
        this.classes[student] = this.classes[student].filter(cls => cls.id !== classId);
        this.saveToDatabase('student-classes', this.classes);
        this.updateDisplay();
    }

    getMonthlyClasses(student, month) {
        if (!this.classes[student]) return [];
        
        return this.classes[student]
            .filter(cls => cls.date.startsWith(month))
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + a.time);
                const dateB = new Date(b.date + 'T' + b.time);
                return dateB - dateA; // Most recent first
            });
    }

    updateDisplay() {
        this.updateMonthlyOverview();
        this.updateClassLists();
        this.updateScheduleDisplay();
        this.updateReports();
    }

    updateMonthlyOverview() {
        const monthName = this.getMonthName(this.currentMonth);
        document.getElementById('currentMonth').textContent = monthName;
        
        let totalClasses = 0;
        let totalRevenue = 0;
        
        this.students.forEach(student => {
            const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
            const classCount = monthlyClasses.length;
            const studentPrice = this.prices[student] || 0;
            const studentTotal = classCount * studentPrice;
            
            document.getElementById(`${student}MonthlyClasses`).textContent = classCount;
            document.getElementById(`${student}MonthlyTotal`).textContent = `$${studentTotal.toFixed(2)}`;
            
            totalClasses += classCount;
            totalRevenue += studentTotal;
        });
        
        document.getElementById('totalMonthlyClasses').textContent = totalClasses;
        document.getElementById('totalMonthlyRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    }

    updateClassLists() {
        this.students.forEach(student => {
            const container = document.getElementById(`${student}Classes`);
            const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
            
            if (monthlyClasses.length === 0) {
                container.innerHTML = '<p class="text-gray-500">No classes for this month</p>';
                return;
            }
            
            container.innerHTML = monthlyClasses.map(cls => `
                <div class="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                        <div class="font-medium">${this.formatDisplayDate(cls.date)}</div>
                        <div class="text-sm text-indigo-600">at ${cls.time}</div>
                    </div>
                    <button type="button" onclick="classManager.removeClass('${student}', ${cls.id})"
                            class="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded">
                        Delete
                    </button>
                </div>
            `).join('');
            // Add accessible labels to each Delete button via DOM
            const sName = student === 'kareem' ? 'Kareem' : 'Sara_Hana';
            container.querySelectorAll('button').forEach((btn, i) => {
                const cls = monthlyClasses[i];
                const dateStr = this.formatDisplayDate(cls.date, cls.time);
                btn.setAttribute('aria-label', `Delete class for ${sName} on ${dateStr}`);
            });
        });
    }

    updateReports() {
        const monthName = this.getMonthName(this.currentMonth);
        
        // Individual reports
        this.students.forEach(student => {
            const container = document.getElementById(`${student}Report`);
            const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
            const studentPrice = this.prices[student] || 0;
            const total = monthlyClasses.length * studentPrice;
            const studentName = student === 'kareem' ? 'Kareem' : 'Sara_Hana';
            
            let reportHtml = `
                <div class="space-y-3">
                    <div class="font-semibold text-gray-800">${studentName} - ${monthName}</div>
                    <div class="space-y-1">
                        <div>Total Classes: <span class="font-medium">${monthlyClasses.length}</span></div>
                        <div>Price per Class: <span class="font-medium">$${studentPrice.toFixed(2)}</span></div>
                        <div>Total Amount: <span class="font-medium text-green-600">$${total.toFixed(2)}</span></div>
                    </div>
            `;
            
            if (monthlyClasses.length > 0) {
                reportHtml += `
                    <div class="mt-4">
                        <div class="font-medium mb-2">Class Details:</div>
                        <div class="space-y-1 max-h-48 overflow-y-auto">
                `;
                
                monthlyClasses.forEach(cls => {
                    reportHtml += `
                        <div class="text-xs text-gray-600">
                            ${this.formatDisplayDate(cls.date, cls.time)}
                        </div>
                    `;
                });
                
                reportHtml += '</div></div>';
            }
            
            reportHtml += '</div>';
            container.innerHTML = reportHtml;
        });
        
        // Combined report
        const combinedContainer = document.getElementById('combinedReport');
        const kareemClasses = this.getMonthlyClasses('kareem', this.currentMonth);
        const saraHanaClasses = this.getMonthlyClasses('saraHana', this.currentMonth);
        const kareemTotal = kareemClasses.length * (this.prices.kareem || 0);
        const saraHanaTotal = saraHanaClasses.length * (this.prices.saraHana || 0);
        const grandTotal = kareemTotal + saraHanaTotal;
        
        combinedContainer.innerHTML = `
            <div class="space-y-4">
                <div class="font-semibold text-gray-800">Combined Report - ${monthName}</div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <div class="font-medium text-blue-600">Kareem</div>
                        <div class="text-sm space-y-1">
                            <div>Classes: ${kareemClasses.length}</div>
                            <div>Total: $${kareemTotal.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <div class="font-medium text-pink-600">Sara_Hana</div>
                        <div class="text-sm space-y-1">
                            <div>Classes: ${saraHanaClasses.length}</div>
                            <div>Total: $${saraHanaTotal.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div class="border-t pt-3 mt-3">
                    <div class="font-medium">Summary</div>
                    <div class="text-sm space-y-1">
                        <div>Total Classes: ${kareemClasses.length + saraHanaClasses.length}</div>
                        <div class="font-semibold text-green-600">Grand Total: $${grandTotal.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // Report generation
    generateReportText(student) {
        const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
        const studentPrice = this.prices[student] || 0;
        const total = monthlyClasses.length * studentPrice;
        const studentName = student === 'kareem' ? 'Kareem' : 'Sara_Hana';
        const monthName = this.getMonthName(this.currentMonth);
        
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
    }

    generateCombinedReportText() {
        const monthName = this.getMonthName(this.currentMonth);
        const kareemClasses = this.getMonthlyClasses('kareem', this.currentMonth);
        const saraHanaClasses = this.getMonthlyClasses('saraHana', this.currentMonth);
        const kareemTotal = kareemClasses.length * (this.prices.kareem || 0);
        const saraHanaTotal = saraHanaClasses.length * (this.prices.saraHana || 0);
        const grandTotal = kareemTotal + saraHanaTotal;
        
        let report = `Combined Monthly Report\n`;
        report += `Month: ${monthName}\n`;
        report += `${'='.repeat(50)}\n\n`;
        
        // Kareem section
        report += `KAREEM\n`;
        report += `${'='.repeat(20)}\n`;
        report += `Total Classes: ${kareemClasses.length}\n`;
        report += `Price per Class: $${(this.prices.kareem || 0).toFixed(2)}\n`;
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
        report += `Price per Class: $${(this.prices.saraHana || 0).toFixed(2)}\n`;
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
    }

    downloadReport(type) {
        let reportText;
        let filename;
        const monthName = this.getMonthName(this.currentMonth).replace(' ', '_');
        
        if (type === 'combined') {
            reportText = this.generateCombinedReportText();
            filename = `Combined_Report_${monthName}.txt`;
        } else {
            reportText = this.generateReportText(type);
            const studentName = type === 'kareem' ? 'Kareem' : 'Sara_Hana';
            filename = `${studentName}_Report_${monthName}.txt`;
        }
        
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Global functions for HTML onclick handlers
function addClass(student) {
    classManager.addClass(student);
}

function removeClass(student, classId) {
    classManager.removeClass(student, classId);
}

function addSchedule(student) {
    classManager.addSchedule(student);
}

function removeSchedule(student, scheduleId) {
    classManager.removeSchedule(student, scheduleId);
}

function generateMonthlyClasses(student) {
    classManager.generateMonthlyClasses(student);
}

function downloadReport(type) {
    classManager.downloadReport(type);
}

// Initialize the application
let classManager;
document.addEventListener('DOMContentLoaded', function() {
    classManager = new StudentClassManager();
});

// Export for testing (no-op in browsers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudentClassManager };
}