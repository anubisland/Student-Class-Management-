// Student Class Management System

function t(key, params) {
    return window.i18n ? window.i18n.t(key, params) : key;
}

function toggleLanguage() {
    var current = window.i18n ? window.i18n.getCurrentLang() : 'en';
    window.i18n.setLanguage(current === 'en' ? 'ar' : 'en');
}

// Escape user-controlled strings before inserting into innerHTML
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

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

        // Re-render dynamic content when language changes
        document.addEventListener('langchange', () => this.updateDisplay());
    }

    saveToDatabase(key, data) {
        try {
            window.localStorage.setItem(key, JSON.stringify(data));
            this.showStatus(t('status.saved'), 'text-green-600');
            return true;
        } catch (error) {
            console.error('Save error:', error);
            this.showStatus(t('status.saveFailed'), 'text-red-600');
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
        this.showStatus(t('status.loading'), 'text-yellow-600');

        this.prices = this.loadFromDatabase('student-prices', {
            kareem: 25.00,
            saraHana: 30.00
        });

        this.classes = this.loadFromDatabase('student-classes', {});

        this.schedules = this.loadFromDatabase('student-schedules', {
            kareem: [],
            saraHana: []
        });

        document.getElementById('kareemPrice').value = this.prices.kareem || '';
        document.getElementById('saraHanaPrice').value = this.prices.saraHana || '';

        this.showStatus(t('status.dataLoaded'), 'text-green-600');
    }

    showStatus(message, className) {
        const statusElement = document.getElementById('saveStatus');
        statusElement.textContent = message;
        statusElement.className = `text-sm font-medium ${className}`;

        if (message.includes('✓')) {
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'text-sm font-medium';
            }, 2000);
        }
    }

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

    getDisplayLocale() {
        const lang = window.i18n ? window.i18n.getCurrentLang() : 'en';
        // 'ar-u-nu-latn' keeps Arabic month names but uses Western (Latin) digits
        return lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    }

    formatDisplayDate(dateString, timeString = null) {
        const date = this.parseLocalDate(dateString);
        const locale = this.getDisplayLocale();
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        let formatted = date.toLocaleDateString(locale, options);

        if (timeString) {
            formatted += ` ${t('classDetails.at')} ${escapeHtml(timeString)}`;
        }

        return escapeHtml(formatted);
    }

    getMonthName(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString(this.getDisplayLocale(), { month: 'long', year: 'numeric' });
    }

    setCurrentMonth() {
        const now = new Date();
        this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        document.getElementById('monthSelector').value = this.currentMonth;
    }

    setupEventListeners() {
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

        document.getElementById('monthSelector').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.updateDisplay();
        });

        const today = this.getLocalDateString(new Date());
        document.getElementById('kareemDate').value = today;
        document.getElementById('saraHanaDate').value = today;
    }

    addSchedule(student) {
        const daySelect = document.getElementById(`${student}ScheduleDay`);
        const timeInput = document.getElementById(`${student}ScheduleTime`);

        const day = daySelect.value;
        const time = timeInput.value;

        if (!day || !time) {
            alert(t('alert.selectDayTime'));
            return;
        }

        const schedule = { id: Date.now(), day: day, time: time };

        if (!this.schedules[student]) {
            this.schedules[student] = [];
        }

        this.schedules[student].push(schedule);
        this.saveToDatabase('student-schedules', this.schedules);

        daySelect.value = '';
        timeInput.value = '09:00';

        this.updateScheduleDisplay();
    }

    removeSchedule(student, scheduleId) {
        this.schedules[student] = this.schedules[student].filter(s => s.id !== scheduleId);
        this.saveToDatabase('student-schedules', this.schedules);
        this.updateScheduleDisplay();
    }

    getDayDisplayName(day) {
        return t(`schedules.${day}`);
    }

    updateScheduleDisplay() {
        this.students.forEach(student => {
            const container = document.getElementById(`${student}ScheduleList`);
            const schedules = this.schedules[student] || [];

            if (schedules.length === 0) {
                container.textContent = '';
                const p = document.createElement('p');
                p.className = 'text-gray-500 text-sm';
                p.textContent = t('schedules.noSchedules');
                container.appendChild(p);
                return;
            }

            container.textContent = '';
            schedules.forEach(schedule => {
                const row = document.createElement('div');
                row.className = 'bg-gray-50 p-3 rounded-lg flex justify-between items-center';

                const label = document.createElement('span');
                label.className = 'font-medium';
                label.textContent = `${this.getDayDisplayName(schedule.day)} ${t('schedules.at')} ${schedule.time}`;

                const btn = document.createElement('button');
                btn.className = 'text-red-500 hover:text-red-700 text-sm';
                btn.textContent = t('schedules.remove');
                btn.onclick = () => classManager.removeSchedule(student, schedule.id);

                row.appendChild(label);
                row.appendChild(btn);
                container.appendChild(row);
            });
        });
    }

    generateMonthlyClasses(student) {
        const schedules = this.schedules[student] || [];
        if (schedules.length === 0) {
            alert(t('alert.noSchedules', { student: t(`student.${student}`) }));
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

        alert(t('alert.generated', {
            count: generatedCount,
            student: t(`student.${student}`),
            month: this.getMonthName(this.currentMonth)
        }));

        this.updateDisplay();
    }

    classExists(student, date, time) {
        if (!this.classes[student]) return false;
        return this.classes[student].some(cls => cls.date === date && cls.time === time);
    }

    addClass(student) {
        const dateInput = document.getElementById(`${student}Date`);
        const timeInput = document.getElementById(`${student}Time`);

        const date = dateInput.value;
        const time = timeInput.value;

        if (!date || !time) {
            alert(t('alert.selectDateTime'));
            return;
        }

        if (this.classExists(student, date, time)) {
            alert(t('alert.classExists'));
            return;
        }

        this.addClassToDatabase(student, date, time);
        this.updateDisplay();

        dateInput.value = this.getLocalDateString(new Date());
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
                return dateB - dateA;
            });
    }

    updateDisplay() {
        this.updateMonthlyOverview();
        this.updateClassLists();
        this.updateScheduleDisplay();
        this.updateReports();
    }

    updateMonthlyOverview() {
        document.getElementById('currentMonth').textContent = this.getMonthName(this.currentMonth);

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

            container.textContent = '';

            if (monthlyClasses.length === 0) {
                const p = document.createElement('p');
                p.className = 'text-gray-500';
                p.textContent = t('classDetails.noClasses');
                container.appendChild(p);
                return;
            }

            monthlyClasses.forEach(cls => {
                const row = document.createElement('div');
                row.className = 'flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50';

                const info = document.createElement('div');

                const dateDiv = document.createElement('div');
                dateDiv.className = 'font-medium';
                dateDiv.textContent = this.formatDisplayDate(cls.date);

                const timeDiv = document.createElement('div');
                timeDiv.className = 'text-sm text-indigo-600';
                timeDiv.textContent = `${t('classDetails.at')} ${cls.time}`;

                info.appendChild(dateDiv);
                info.appendChild(timeDiv);

                const btn = document.createElement('button');
                btn.className = 'text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded';
                btn.textContent = t('classDetails.delete');
                btn.onclick = () => classManager.removeClass(student, cls.id);

                row.appendChild(info);
                row.appendChild(btn);
                container.appendChild(row);
            });
        });
    }

    _buildReportHtml(student, monthName) {
        const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
        const studentPrice = this.prices[student] || 0;
        const total = monthlyClasses.length * studentPrice;
        const studentName = t(`student.${student}`);

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-3';

        const header = document.createElement('div');
        header.className = 'font-semibold text-gray-800';
        header.textContent = `${studentName} - ${monthName}`;
        wrapper.appendChild(header);

        const stats = document.createElement('div');
        stats.className = 'space-y-1';
        [
            `${t('reports.totalClasses')} ${monthlyClasses.length}`,
            `${t('reports.pricePerClass')} $${studentPrice.toFixed(2)}`,
        ].forEach(line => {
            const d = document.createElement('div');
            d.textContent = line;
            stats.appendChild(d);
        });

        const totalLine = document.createElement('div');
        const totalSpan = document.createElement('span');
        totalSpan.className = 'font-medium text-green-600';
        totalSpan.textContent = `$${total.toFixed(2)}`;
        totalLine.textContent = `${t('reports.totalAmount')} `;
        totalLine.appendChild(totalSpan);
        stats.appendChild(totalLine);
        wrapper.appendChild(stats);

        if (monthlyClasses.length > 0) {
            const detailsWrap = document.createElement('div');
            detailsWrap.className = 'mt-4';

            const detailsHeader = document.createElement('div');
            detailsHeader.className = 'font-medium mb-2';
            detailsHeader.textContent = t('reports.classDetails');
            detailsWrap.appendChild(detailsHeader);

            const list = document.createElement('div');
            list.className = 'space-y-1 max-h-48 overflow-y-auto';

            monthlyClasses.forEach(cls => {
                const entry = document.createElement('div');
                entry.className = 'text-xs text-gray-600';
                entry.textContent = this.formatDisplayDate(cls.date, cls.time);
                list.appendChild(entry);
            });

            detailsWrap.appendChild(list);
            wrapper.appendChild(detailsWrap);
        }

        return wrapper;
    }

    updateReports() {
        const monthName = this.getMonthName(this.currentMonth);

        this.students.forEach(student => {
            const container = document.getElementById(`${student}Report`);
            container.textContent = '';
            container.appendChild(this._buildReportHtml(student, monthName));
        });

        // Combined report
        const combinedContainer = document.getElementById('combinedReport');
        combinedContainer.textContent = '';

        const kareemClasses = this.getMonthlyClasses('kareem', this.currentMonth);
        const saraHanaClasses = this.getMonthlyClasses('saraHana', this.currentMonth);
        const kareemTotal = kareemClasses.length * (this.prices.kareem || 0);
        const saraHanaTotal = saraHanaClasses.length * (this.prices.saraHana || 0);
        const grandTotal = kareemTotal + saraHanaTotal;

        const combined = document.createElement('div');
        combined.className = 'space-y-4';

        const title = document.createElement('div');
        title.className = 'font-semibold text-gray-800';
        title.textContent = `${t('reports.combined')} - ${monthName}`;
        combined.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-6';

        [
            { key: 'kareem', color: 'text-blue-600', classes: kareemClasses, total: kareemTotal, price: this.prices.kareem },
            { key: 'saraHana', color: 'text-pink-600', classes: saraHanaClasses, total: saraHanaTotal, price: this.prices.saraHana },
        ].forEach(({ key, color, classes, total }) => {
            const col = document.createElement('div');
            col.className = 'space-y-2';

            const name = document.createElement('div');
            name.className = `font-medium ${color}`;
            name.textContent = t(`student.${key}`);

            const info = document.createElement('div');
            info.className = 'text-sm space-y-1';

            [
                `${t('reports.classes')} ${classes.length}`,
                `${t('reports.total')} $${total.toFixed(2)}`,
            ].forEach(line => {
                const d = document.createElement('div');
                d.textContent = line;
                info.appendChild(d);
            });

            col.appendChild(name);
            col.appendChild(info);
            grid.appendChild(col);
        });

        combined.appendChild(grid);

        const summary = document.createElement('div');
        summary.className = 'border-t pt-3 mt-3';

        const summaryTitle = document.createElement('div');
        summaryTitle.className = 'font-medium';
        summaryTitle.textContent = t('reports.summary');

        const summaryInfo = document.createElement('div');
        summaryInfo.className = 'text-sm space-y-1';

        const totalClassLine = document.createElement('div');
        totalClassLine.textContent = `${t('monthlyOverview.totalClasses')} ${kareemClasses.length + saraHanaClasses.length}`;

        const grandTotalLine = document.createElement('div');
        grandTotalLine.className = 'font-semibold text-green-600';
        grandTotalLine.textContent = `${t('monthlyOverview.totalRevenue')} $${grandTotal.toFixed(2)}`;

        summaryInfo.appendChild(totalClassLine);
        summaryInfo.appendChild(grandTotalLine);
        summary.appendChild(summaryTitle);
        summary.appendChild(summaryInfo);
        combined.appendChild(summary);

        combinedContainer.appendChild(combined);
    }

    // Plain-text report download
    generateReportText(student) {
        const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
        const studentPrice = this.prices[student] || 0;
        const total = monthlyClasses.length * studentPrice;
        const studentName = t(`student.${student}`);
        const monthName = this.getMonthName(this.currentMonth);

        let report = `${studentName} - ${t('reports.title')}\n`;
        report += `${monthName}\n`;
        report += `${'='.repeat(40)}\n\n`;
        report += `${t('reports.totalClasses')} ${monthlyClasses.length}\n`;
        report += `${t('reports.pricePerClass')} $${studentPrice.toFixed(2)}\n`;
        report += `${t('reports.totalAmount')} $${total.toFixed(2)}\n\n`;

        if (monthlyClasses.length > 0) {
            report += `${t('reports.classDetails')}\n`;
            report += `${'='.repeat(20)}\n`;
            monthlyClasses.forEach((cls, index) => {
                report += `${index + 1}. ${cls.date} ${t('classDetails.at')} ${cls.time}\n`;
            });
        }

        report += `\n${'='.repeat(40)}\n`;
        report += `${t('reports.generatedOn')} ${new Date().toLocaleString(this.getDisplayLocale())}\n`;

        return report;
    }

    generateCombinedReportText() {
        const monthName = this.getMonthName(this.currentMonth);
        const kareemClasses = this.getMonthlyClasses('kareem', this.currentMonth);
        const saraHanaClasses = this.getMonthlyClasses('saraHana', this.currentMonth);
        const kareemTotal = kareemClasses.length * (this.prices.kareem || 0);
        const saraHanaTotal = saraHanaClasses.length * (this.prices.saraHana || 0);
        const grandTotal = kareemTotal + saraHanaTotal;

        let report = `${t('reports.combined')}\n${monthName}\n${'='.repeat(50)}\n\n`;

        [[kareemClasses, 'kareem', kareemTotal, this.prices.kareem],
         [saraHanaClasses, 'saraHana', saraHanaTotal, this.prices.saraHana]].forEach(([classes, key, total, price]) => {
            report += `${t(`student.${key}`).toUpperCase()}\n${'='.repeat(20)}\n`;
            report += `${t('reports.totalClasses')} ${classes.length}\n`;
            report += `${t('reports.pricePerClass')} $${(price || 0).toFixed(2)}\n`;
            report += `${t('reports.totalAmount')} $${total.toFixed(2)}\n\n`;
            if (classes.length > 0) {
                report += `${t('reports.classDetails')}\n`;
                classes.forEach((cls, i) => {
                    report += `${i + 1}. ${cls.date} ${t('classDetails.at')} ${cls.time}\n`;
                });
                report += '\n';
            }
        });

        report += `${t('reports.summary').toUpperCase()}\n${'='.repeat(20)}\n`;
        report += `${t('monthlyOverview.totalClasses')} ${kareemClasses.length + saraHanaClasses.length}\n`;
        report += `${t('monthlyOverview.totalRevenue')} $${grandTotal.toFixed(2)}\n\n`;
        report += `${'='.repeat(50)}\n`;
        report += `${t('reports.generatedOn')} ${new Date().toLocaleString(this.getDisplayLocale())}\n`;

        return report;
    }

    downloadReport(type) {
        let reportText;
        let filename;
        const monthName = this.getMonthName(this.currentMonth).replace(/\s/g, '_');

        if (type === 'combined') {
            reportText = this.generateCombinedReportText();
            filename = `Combined_Report_${monthName}.txt`;
        } else {
            reportText = this.generateReportText(type);
            filename = `${t(`student.${type}`).replace(/\s/g, '_')}_Report_${monthName}.txt`;
        }

        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Global functions for HTML onclick handlers
function addClass(student) { classManager.addClass(student); }
function removeClass(student, classId) { classManager.removeClass(student, classId); }
function addSchedule(student) { classManager.addSchedule(student); }
function removeSchedule(student, scheduleId) { classManager.removeSchedule(student, scheduleId); }
function generateMonthlyClasses(student) { classManager.generateMonthlyClasses(student); }
function downloadReport(type) { classManager.downloadReport(type); }

let classManager;
document.addEventListener('DOMContentLoaded', function () {
    classManager = new StudentClassManager();
});

// Export for testing (no-op in browsers)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudentClassManager };
}
