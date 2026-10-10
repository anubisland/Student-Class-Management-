// Family Class & Activity Management System (Dynamic & Multi-Child)

function t(key, params) {
    return window.i18n ? window.i18n.t(key, params) : key;
}

function toggleLanguage() {
    var current = window.i18n ? window.i18n.getCurrentLang() : 'ar';
    window.i18n.setLanguage(current === 'en' ? 'ar' : 'en');
}

// Escape user-controlled strings before inserting into innerHTML
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

class StudentClassManager {
    constructor() {
        this.settings = {
            familyName: '',
            currency: '$'
        };
        this.children = [];
        this.activities = [];
        this.schedules = {}; // { [childId]: [ {id, childId, activityId, day, time} ] }
        this.classes = {};   // { [childId]: [ {id, childId, activityId, date, time, price, status, notes} ] }
        this.prices = { kareem: 25.00, saraHana: 30.00 }; // Legacy / backward-compat cache { [childId]: price }
        this.currentMonth = '';
        this.selectedChildFilter = 'all';

        this.init();
    }

    // Backwards compatibility getter for test suites
    get students() {
        return this.children.map(c => c.id);
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

    showStatus(message, className) {
        const statusElement = document.getElementById('saveStatus');
        if (!statusElement) return;
        statusElement.textContent = message;
        statusElement.className = `text-sm font-medium ${className}`;

        if (message.includes('✓')) {
            setTimeout(() => {
                if (statusElement) {
                    statusElement.textContent = '';
                    statusElement.className = 'text-sm font-medium';
                }
            }, 2500);
        }
    }

    // Auto-migrate legacy data or initialize defaults
    loadData() {
        this.showStatus(t('status.loading'), 'text-yellow-600');

        const savedSettings = this.loadFromDatabase('family_settings', null);
        const savedChildren = this.loadFromDatabase('family_children', null);
        const savedActivities = this.loadFromDatabase('family_activities', null);

        if (savedChildren && Array.isArray(savedChildren) && savedChildren.length > 0) {
            // Modern dynamic data structure exists
            this.settings = savedSettings || { familyName: '', currency: '$' };
            this.children = savedChildren;
            this.activities = savedActivities || [];
            this.classes = this.loadFromDatabase('family_classes', {});
            this.schedules = this.loadFromDatabase('family_schedules', {});
            this.prices = this.loadFromDatabase('student-prices', { kareem: 25.00, saraHana: 30.00 });
        } else {
            // Check for legacy data
            const legacyPrices = this.loadFromDatabase('student-prices', null);
            const legacyClasses = this.loadFromDatabase('student-classes', null);
            const legacySchedules = this.loadFromDatabase('student-schedules', null);

            if (legacyPrices || legacyClasses || legacySchedules) {
                // Perform migration
                this.migrateLegacyData(legacyPrices, legacyClasses, legacySchedules);
            } else {
                // Fresh initialization with default children & activities
                this.initializeDefaultData();
            }
        }

        // Sync legacy prices map for backward compatibility
        this.syncLegacyPricesMap();

        this.showStatus(t('status.dataLoaded'), 'text-green-600');
    }

    migrateLegacyData(legacyPrices, legacyClasses, legacySchedules) {
        this.settings = { familyName: '', currency: '$' };
        this.children = [
            { id: 'kareem', name: 'Kareem', color: '#3B82F6' },
            { id: 'saraHana', name: 'Sara_Hana', color: '#EC4899' }
        ];

        const kPrice = legacyPrices && legacyPrices.kareem !== undefined ? parseFloat(legacyPrices.kareem) : 25.00;
        const sPrice = legacyPrices && legacyPrices.saraHana !== undefined ? parseFloat(legacyPrices.saraHana) : 30.00;

        this.prices = { kareem: kPrice, saraHana: sPrice };

        this.activities = [
            { id: 'act_kareem_default', childId: 'kareem', name: 'General Classes', price: kPrice, instructor: '' },
            { id: 'act_saraHana_default', childId: 'saraHana', name: 'General Classes', price: sPrice, instructor: '' }
        ];

        this.classes = {};
        if (legacyClasses) {
            ['kareem', 'saraHana'].forEach(student => {
                const actId = student === 'kareem' ? 'act_kareem_default' : 'act_saraHana_default';
                const actPrice = student === 'kareem' ? kPrice : sPrice;
                const items = legacyClasses[student] || [];
                this.classes[student] = items.map(c => ({
                    id: c.id || Date.now() + Math.random(),
                    childId: student,
                    activityId: c.activityId || actId,
                    date: c.date,
                    time: c.time,
                    price: c.price !== undefined ? c.price : actPrice,
                    status: c.status || 'completed',
                    notes: c.notes || ''
                }));
            });
        }

        this.schedules = {};
        if (legacySchedules) {
            ['kareem', 'saraHana'].forEach(student => {
                const actId = student === 'kareem' ? 'act_kareem_default' : 'act_saraHana_default';
                const items = legacySchedules[student] || [];
                this.schedules[student] = items.map(s => ({
                    id: s.id || Date.now() + Math.random(),
                    childId: student,
                    activityId: s.activityId || actId,
                    day: s.day,
                    time: s.time
                }));
            });
        }

        this.persistAllData();
    }

    initializeDefaultData() {
        this.settings = { familyName: '', currency: '$' };
        this.children = [
            { id: 'kareem', name: 'Kareem', color: '#3B82F6' },
            { id: 'saraHana', name: 'Sara_Hana', color: '#EC4899' }
        ];
        this.prices = {
            kareem: 25.00,
            saraHana: 30.00
        };
        this.activities = [
            { id: 'act_1', childId: 'kareem', name: 'English Classes', price: 25.00, instructor: '' },
            { id: 'act_2', childId: 'saraHana', name: 'Math Classes', price: 30.00, instructor: '' }
        ];
        this.classes = {
            kareem: [],
            saraHana: []
        };
        this.schedules = {
            kareem: [],
            saraHana: []
        };
        this.persistAllData();
    }

    persistAllData() {
        this.saveToDatabase('family_settings', this.settings);
        this.saveToDatabase('family_children', this.children);
        this.saveToDatabase('family_activities', this.activities);
        this.saveToDatabase('family_classes', this.classes);
        this.saveToDatabase('family_schedules', this.schedules);

        // Also sync legacy keys for backwards-compat
        this.syncLegacyPricesMap();
        this.saveToDatabase('student-prices', this.prices);
        this.saveToDatabase('student-classes', this.classes);
        this.saveToDatabase('student-schedules', this.schedules);
    }

    syncLegacyPricesMap() {
        if (!this.prices) this.prices = {};
        this.children.forEach(child => {
            if (this.prices[child.id] === undefined) {
                const childActs = this.activities.filter(a => a.childId === child.id);
                this.prices[child.id] = childActs.length > 0 ? childActs[0].price : 25.00;
            }
        });
    }

    getCurrency() {
        return (this.settings && this.settings.currency) ? this.settings.currency : '$';
    }

    formatCurrency(amount) {
        const val = Number(amount || 0).toFixed(2);
        const curr = this.getCurrency();
        if (curr === '$' || curr === '£' || curr === '€') {
            return `${curr}${val}`;
        }
        return `${val} ${curr}`;
    }

    getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    parseLocalDate(dateString) {
        if (!dateString) return new Date();
        const parts = dateString.split('-');
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }

    getDisplayLocale() {
        const lang = window.i18n ? window.i18n.getCurrentLang() : 'en';
        return lang === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    }

    formatDisplayDate(dateString, timeString = null) {
        if (!dateString) return '';
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
        if (!monthString) return '';
        const [year, month] = monthString.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleDateString(this.getDisplayLocale(), { month: 'long', year: 'numeric' });
    }

    setCurrentMonth() {
        const now = new Date();
        this.currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const el = document.getElementById('monthSelector');
        if (el) el.value = this.currentMonth;
    }

    setupEventListeners() {
        const monthSel = document.getElementById('monthSelector');
        if (monthSel) {
            monthSel.addEventListener('change', (e) => {
                this.currentMonth = e.target.value;
                this.updateDisplay();
            });
        }

        const familyNameInput = document.getElementById('familyNameInput');
        if (familyNameInput) {
            familyNameInput.value = this.settings.familyName || '';
            familyNameInput.addEventListener('change', (e) => {
                this.settings.familyName = e.target.value.trim();
                this.saveToDatabase('family_settings', this.settings);
                this.updateDisplay();
            });
        }

        const currencySelect = document.getElementById('currencySelect');
        if (currencySelect) {
            currencySelect.value = this.settings.currency || '$';
            currencySelect.addEventListener('change', (e) => {
                this.settings.currency = e.target.value;
                this.saveToDatabase('family_settings', this.settings);
                this.updateDisplay();
            });
        }

        // Setup extra class date default
        const extraDate = document.getElementById('extraClassDate');
        if (extraDate) {
            extraDate.value = this.getLocalDateString(new Date());
        }

        // Setup filter change
        const childFilter = document.getElementById('childFilterSelector');
        if (childFilter) {
            childFilter.addEventListener('change', (e) => {
                this.selectedChildFilter = e.target.value;
                this.updateDisplay();
            });
        }

        // Legacy input bindings for backward compat with existing tests
        const kPriceInp = document.getElementById('kareemPrice');
        if (kPriceInp) {
            kPriceInp.value = this.prices.kareem || 25;
            kPriceInp.addEventListener('change', (e) => {
                this.prices.kareem = parseFloat(e.target.value) || 0;
                this.saveToDatabase('student-prices', this.prices);
                this.updateDisplay();
            });
        }
        const sPriceInp = document.getElementById('saraHanaPrice');
        if (sPriceInp) {
            sPriceInp.value = this.prices.saraHana || 30;
            sPriceInp.addEventListener('change', (e) => {
                this.prices.saraHana = parseFloat(e.target.value) || 0;
                this.saveToDatabase('student-prices', this.prices);
                this.updateDisplay();
            });
        }
        const today = this.getLocalDateString(new Date());
        const kDate = document.getElementById('kareemDate');
        if (kDate) kDate.value = today;
        const sDate = document.getElementById('saraHanaDate');
        if (sDate) sDate.value = today;
    }

    // --- Children Management ---
    addChild(name, color = '#3B82F6') {
        const trimmedName = (name || '').trim();
        if (!trimmedName) {
            alert(t('alert.enterName'));
            return null;
        }

        const newChild = {
            id: 'child_' + Date.now(),
            name: trimmedName,
            color: color || '#3B82F6'
        };

        this.children.push(newChild);
        this.classes[newChild.id] = [];
        this.schedules[newChild.id] = [];
        this.prices[newChild.id] = 25.00;

        // Add a default activity for this child
        const defaultAct = {
            id: 'act_' + Date.now(),
            childId: newChild.id,
            name: t('activities.defaultActivity'),
            price: 25.00,
            instructor: ''
        };
        this.activities.push(defaultAct);

        this.persistAllData();
        this.updateDisplay();
        return newChild;
    }

    editChild(childId, newName, newColor) {
        const child = this.children.find(c => c.id === childId);
        if (!child) return;

        if (newName && newName.trim()) {
            child.name = newName.trim();
        }
        if (newColor) {
            child.color = newColor;
        }

        this.persistAllData();
        this.updateDisplay();
    }

    deleteChild(childId) {
        if (!confirm(t('children.deleteConfirm'))) return;

        this.children = this.children.filter(c => c.id !== childId);
        this.activities = this.activities.filter(a => a.childId !== childId);
        delete this.classes[childId];
        delete this.schedules[childId];
        delete this.prices[childId];

        this.persistAllData();
        this.updateDisplay();
    }

    // --- Activities Management ---
    addActivity(childId, name, price, instructor = '') {
        const trimmedName = (name || '').trim();
        const numPrice = parseFloat(price);

        if (!childId) {
            alert(t('alert.selectChild'));
            return null;
        }
        if (!trimmedName || isNaN(numPrice) || numPrice < 0) {
            alert(t('alert.enterActivityName'));
            return null;
        }

        const newActivity = {
            id: 'act_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            childId: childId,
            name: trimmedName,
            price: numPrice,
            instructor: (instructor || '').trim()
        };

        this.activities.push(newActivity);
        this.persistAllData();
        this.updateDisplay();
        return newActivity;
    }

    editActivity(activityId, newName, newPrice, newInstructor) {
        const act = this.activities.find(a => a.id === activityId);
        if (!act) return;

        if (newName && newName.trim()) act.name = newName.trim();
        if (newPrice !== undefined && !isNaN(parseFloat(newPrice))) act.price = parseFloat(newPrice);
        if (newInstructor !== undefined) act.instructor = newInstructor.trim();

        this.persistAllData();
        this.updateDisplay();
    }

    deleteActivity(activityId) {
        if (!confirm(t('activities.deleteConfirm'))) return;

        this.activities = this.activities.filter(a => a.id !== activityId);
        // Also remove schedules linked to this activity
        Object.keys(this.schedules).forEach(childId => {
            this.schedules[childId] = (this.schedules[childId] || []).filter(s => s.activityId !== activityId);
        });

        this.persistAllData();
        this.updateDisplay();
    }

    getActivityById(activityId) {
        return this.activities.find(a => a.id === activityId);
    }

    getChildById(childId) {
        return this.children.find(c => c.id === childId);
    }

    getChildActivities(childId) {
        return this.activities.filter(a => a.childId === childId);
    }

    getChildPrice(childId) {
        if (this.prices && this.prices[childId] !== undefined) {
            return this.prices[childId];
        }
        const childActs = this.getChildActivities(childId);
        if (childActs.length > 0) {
            return childActs[0].price;
        }
        return 25.00;
    }

    // --- Recurring Schedules ---
    addSchedule(childId, activityIdOrDay, dayOrTime, time) {
        // Support both addSchedule(childId, activityId, day, time) AND legacy addSchedule(childId)
        let day, scheduleTime, activityId;

        if (activityIdOrDay === undefined) {
            // Legacy addSchedule('kareem') reading from DOM
            const daySelect = document.getElementById(`${childId}ScheduleDay`);
            const timeInput = document.getElementById(`${childId}ScheduleTime`);
            day = daySelect ? daySelect.value : '';
            scheduleTime = timeInput ? timeInput.value : '';
            activityId = '';
        } else if (time !== undefined) {
            // Modern 4-arg signature
            activityId = activityIdOrDay;
            day = dayOrTime;
            scheduleTime = time;
        } else if (dayOrTime !== undefined) {
            // 3-arg signature (childId, day, time)
            day = activityIdOrDay;
            scheduleTime = dayOrTime;
            activityId = '';
        }

        if (!childId) {
            alert(t('alert.selectChild'));
            return;
        }
        if (!day || !scheduleTime) {
            alert(t('alert.selectDayTime'));
            return;
        }

        // If activityId not provided, select child's first activity
        if (!activityId) {
            const childActs = this.getChildActivities(childId);
            if (childActs.length > 0) {
                activityId = childActs[0].id;
            } else {
                activityId = 'act_' + childId;
            }
        }

        const schedule = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            childId: childId,
            activityId: activityId,
            day: day.toLowerCase(),
            time: scheduleTime
        };

        if (!this.schedules[childId]) {
            this.schedules[childId] = [];
        }

        this.schedules[childId].push(schedule);
        this.saveToDatabase('family_schedules', this.schedules);
        this.saveToDatabase('student-schedules', this.schedules);

        const daySelect = document.getElementById(`${childId}ScheduleDay`);
        const timeInput = document.getElementById(`${childId}ScheduleTime`);
        if (daySelect) daySelect.value = '';
        if (timeInput) timeInput.value = '09:00';

        this.updateDisplay();
    }

    removeSchedule(childId, scheduleId) {
        if (!this.schedules[childId]) return;
        this.schedules[childId] = this.schedules[childId].filter(s => s.id !== scheduleId);
        this.saveToDatabase('family_schedules', this.schedules);
        this.saveToDatabase('student-schedules', this.schedules);
        this.updateDisplay();
    }

    getDayDisplayName(day) {
        const key = `schedules.${day.toLowerCase()}`;
        return t(key);
    }

    // Auto-generate all month classes for a given child
    generateMonthlyClasses(childId) {
        const child = this.getChildById(childId);
        const childName = child ? child.name : (t(`student.${childId}`) || childId);
        const schedules = this.schedules[childId] || [];

        if (schedules.length === 0) {
            alert(t('alert.noSchedules', { student: childName }));
            return 0;
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
                    if (!this.classExists(childId, dateString, schedule.time)) {
                        const act = this.getActivityById(schedule.activityId);
                        const price = act ? act.price : this.getChildPrice(childId);
                        this.addClassToDatabase(childId, schedule.activityId, dateString, schedule.time, price);
                        generatedCount++;
                    }
                }
            });
        }

        alert(t('alert.generated', {
            count: generatedCount,
            student: childName,
            month: this.getMonthName(this.currentMonth)
        }));

        this.updateDisplay();
        return generatedCount;
    }

    generateAllChildrenMonthlyClasses() {
        if (this.children.length === 0) return;
        let totalGenerated = 0;

        const [year, month] = this.currentMonth.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);

        const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
        };

        this.children.forEach(child => {
            const schedules = this.schedules[child.id] || [];
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                const dayOfWeek = date.getDay();
                schedules.forEach(schedule => {
                    if (dayMap[schedule.day] === dayOfWeek) {
                        const dateString = this.getLocalDateString(date);
                        if (!this.classExists(child.id, dateString, schedule.time)) {
                            const act = this.getActivityById(schedule.activityId);
                            const price = act ? act.price : this.getChildPrice(child.id);
                            this.addClassToDatabase(child.id, schedule.activityId, dateString, schedule.time, price);
                            totalGenerated++;
                        }
                    }
                });
            }
        });

        alert(t('alert.generatedAll', {
            count: totalGenerated,
            month: this.getMonthName(this.currentMonth)
        }));

        this.updateDisplay();
    }

    classExists(childId, date, time) {
        if (!this.classes[childId]) return false;
        return this.classes[childId].some(cls => cls.date === date && cls.time === time);
    }

    // --- Extra / Manual Sessions ---
    addClass(childId, activityIdOrDate, dateOrTime, timeOrPrice, customPrice = null) {
        let activityId, date, time, price;

        if (activityIdOrDate === undefined || activityIdOrDate === null) {
            // Legacy signature addClass('kareem') from DOM
            const dateInput = document.getElementById(`${childId}Date`);
            const timeInput = document.getElementById(`${childId}Time`);
            date = dateInput ? dateInput.value : '';
            time = timeInput ? timeInput.value : '';
            activityId = '';
            price = this.getChildPrice(childId);
        } else if (typeof dateOrTime === 'string' && /^\d{2}:\d{2}$/.test(dateOrTime)) {
            // Called as addClass(childId, date, time, [customPrice])
            date = activityIdOrDate;
            time = dateOrTime;
            activityId = '';
            price = timeOrPrice !== undefined && timeOrPrice !== null ? timeOrPrice : this.getChildPrice(childId);
        } else {
            // Called as addClass(childId, activityId, date, time, [customPrice])
            activityId = activityIdOrDate;
            date = dateOrTime;
            time = timeOrPrice;
            price = customPrice !== null && customPrice !== undefined ? customPrice : null;
        }

        if (!childId) {
            alert(t('alert.selectChild'));
            return;
        }
        if (!date || !time) {
            alert(t('alert.selectDateTime'));
            return;
        }

        if (this.classExists(childId, date, time)) {
            alert(t('alert.classExists'));
            return;
        }

        if (price === null || price === undefined || isNaN(price)) {
            const act = this.getActivityById(activityId);
            price = act ? act.price : this.getChildPrice(childId);
        }

        this.addClassToDatabase(childId, activityId, date, time, parseFloat(price) || 0);
        this.updateDisplay();

        const dateInput = document.getElementById(`${childId}Date`);
        if (dateInput) dateInput.value = this.getLocalDateString(new Date());
    }

    addClassToDatabase(childId, arg2, arg3, arg4, arg5, arg6) {
        let activityId, date, time, price, status;

        if (typeof arg3 === 'string' && /^\d{2}:\d{2}$/.test(arg3)) {
            // Legacy 3-arg / 4-arg signature: (childId, date, time, [price], [status])
            date = arg2;
            time = arg3;
            activityId = '';
            price = arg4 !== undefined ? arg4 : this.getChildPrice(childId);
            status = arg5 || 'completed';
        } else {
            // 5-arg signature: (childId, activityId, date, time, price, status)
            activityId = arg2 || '';
            date = arg3;
            time = arg4;
            price = arg5 !== undefined ? arg5 : this.getChildPrice(childId);
            status = arg6 || 'completed';
        }

        if (price === undefined || price === null || price === 0) {
            const act = this.getActivityById(activityId);
            price = act ? act.price : this.getChildPrice(childId);
        }

        if (!this.classes[childId]) {
            this.classes[childId] = [];
        }

        this.classes[childId].push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            childId: childId,
            activityId: activityId,
            date: date,
            time: time,
            price: Number(price) || 0,
            status: status,
            timestamp: new Date().toISOString()
        });

        this.saveToDatabase('family_classes', this.classes);
        this.saveToDatabase('student-classes', this.classes);
    }

    removeClass(childId, classId) {
        if (!this.classes[childId]) return;
        this.classes[childId] = this.classes[childId].filter(cls => cls.id !== classId);
        this.saveToDatabase('family_classes', this.classes);
        this.saveToDatabase('student-classes', this.classes);
        this.updateDisplay();
    }

    toggleSessionStatus(childId, classId) {
        if (!this.classes[childId]) return;
        const session = this.classes[childId].find(cls => cls.id === classId);
        if (session) {
            session.status = session.status === 'completed' ? 'cancelled' : 'completed';
            this.saveToDatabase('family_classes', this.classes);
            this.saveToDatabase('student-classes', this.classes);
            this.updateDisplay();
        }
    }

    getMonthlyClasses(childId, month) {
        if (!this.classes[childId]) return [];

        return this.classes[childId]
            .filter(cls => cls.date && cls.date.startsWith(month))
            .sort((a, b) => {
                const dateA = new Date(a.date + 'T' + (a.time || '00:00'));
                const dateB = new Date(b.date + 'T' + (b.time || '00:00'));
                return dateB - dateA;
            });
    }

    // --- UI Rendering ---
    updateDisplay() {
        this.renderChildrenList();
        this.renderMonthlyOverview();
        this.renderScheduleSection();
        this.renderExtraClassFormSelectors();
        this.renderClassLists();
        this.renderReports();
        this.updateLegacyDOM();
    }

    updateLegacyDOM() {
        // Sync legacy DOM containers for testing compatibility
        this.students.forEach(student => {
            const priceInp = document.getElementById(`${student}Price`);
            if (priceInp && this.prices[student] !== undefined) {
                priceInp.value = this.prices[student];
            }
            const monthlyClasses = this.getMonthlyClasses(student, this.currentMonth);
            const classCount = monthlyClasses.length;
            const studentPrice = this.getChildPrice(student);
            const studentTotal = monthlyClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : studentPrice), 0);

            const mCls = document.getElementById(`${student}MonthlyClasses`);
            if (mCls) mCls.textContent = classCount;

            const mTot = document.getElementById(`${student}MonthlyTotal`);
            if (mTot) mTot.textContent = `$${studentTotal.toFixed(2)}`;

            const schedContainer = document.getElementById(`${student}ScheduleList`);
            if (schedContainer) {
                const schedules = this.schedules[student] || [];
                schedContainer.textContent = '';
                if (schedules.length === 0) {
                    const p = document.createElement('p');
                    p.className = 'text-gray-500 text-sm';
                    p.textContent = t('schedules.noSchedules');
                    schedContainer.appendChild(p);
                } else {
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
                        schedContainer.appendChild(row);
                    });
                }
            }

            const clsContainer = document.getElementById(`${student}Classes`);
            if (clsContainer) {
                clsContainer.textContent = '';
                if (monthlyClasses.length === 0) {
                    const p = document.createElement('p');
                    p.className = 'text-gray-500';
                    p.textContent = t('classDetails.noClasses');
                    clsContainer.appendChild(p);
                } else {
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
                        clsContainer.appendChild(row);
                    });
                }
            }
        });
    }

    renderChildrenList() {
        const container = document.getElementById('childrenCardsContainer');
        if (!container) return;

        container.textContent = '';

        if (this.children.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'col-span-full text-center py-8 text-gray-500';
            empty.textContent = t('children.noChildren');
            container.appendChild(empty);
            return;
        }

        this.children.forEach(child => {
            const childActs = this.getChildActivities(child.id);
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
            const childDefaultPrice = this.getChildPrice(child.id);
            const totalMonthly = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);

            const card = document.createElement('div');
            card.className = 'bg-white border rounded-xl shadow-sm hover:shadow transition-shadow overflow-hidden flex flex-col';
            card.style.borderTop = `4px solid ${child.color || '#3B82F6'}`;

            // Card Header
            const header = document.createElement('div');
            header.className = 'p-4 bg-gray-50 border-b flex justify-between items-center';

            const nameWrap = document.createElement('div');
            nameWrap.className = 'flex items-center gap-2';

            const dot = document.createElement('span');
            dot.className = 'w-3 h-3 rounded-full';
            dot.style.backgroundColor = child.color || '#3B82F6';

            const title = document.createElement('h3');
            title.className = 'font-bold text-gray-800 text-lg';
            title.textContent = child.name;

            nameWrap.appendChild(dot);
            nameWrap.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'flex items-center gap-2';

            const editBtn = document.createElement('button');
            editBtn.className = 'text-gray-500 hover:text-blue-600 p-1 rounded transition';
            editBtn.title = t('children.editChild');
            editBtn.innerHTML = '✏️';
            editBtn.onclick = () => openEditChildModal(child.id);

            const delBtn = document.createElement('button');
            delBtn.className = 'text-gray-500 hover:text-red-600 p-1 rounded transition';
            delBtn.title = t('classDetails.delete');
            delBtn.innerHTML = '🗑️';
            delBtn.onclick = () => classManager.deleteChild(child.id);

            actions.appendChild(editBtn);
            actions.appendChild(delBtn);
            header.appendChild(nameWrap);
            header.appendChild(actions);
            card.appendChild(header);

            // Card Body (Activities & Stats)
            const body = document.createElement('div');
            body.className = 'p-4 flex-1 space-y-3';

            const statsRow = document.createElement('div');
            statsRow.className = 'flex justify-between items-center text-sm py-1 border-b';
            statsRow.innerHTML = `
                <span class="text-gray-600">${t('children.totalMonthly')}</span>
                <span class="font-bold text-green-600">${this.formatCurrency(totalMonthly)} (${activeClasses.length} ${t('reports.classes')})</span>
            `;
            body.appendChild(statsRow);

            // Activities list
            const actTitleRow = document.createElement('div');
            actTitleRow.className = 'flex justify-between items-center mt-2';
            actTitleRow.innerHTML = `
                <span class="text-xs font-semibold text-gray-500 uppercase">${t('activities.title')}</span>
                <button onclick="openAddActivityModal('${child.id}')" class="text-xs text-blue-600 hover:text-blue-800 font-medium">+ ${t('activities.addActivity')}</button>
            `;
            body.appendChild(actTitleRow);

            const actList = document.createElement('div');
            actList.className = 'space-y-1.5 max-h-40 overflow-y-auto pr-1';

            if (childActs.length === 0) {
                const noAct = document.createElement('p');
                noAct.className = 'text-xs text-gray-400 italic py-1';
                noAct.textContent = t('activities.noActivities');
                actList.appendChild(noAct);
            } else {
                childActs.forEach(act => {
                    const actRow = document.createElement('div');
                    actRow.className = 'flex justify-between items-center text-xs p-2 bg-gray-50 rounded border hover:bg-gray-100';

                    const actInfo = document.createElement('div');
                    actInfo.className = 'flex flex-col';
                    actInfo.innerHTML = `
                        <span class="font-medium text-gray-800">${escapeHtml(act.name)}</span>
                        ${act.instructor ? `<span class="text-gray-500 text-[10px]">${escapeHtml(act.instructor)}</span>` : ''}
                    `;

                    const actRight = document.createElement('div');
                    actRight.className = 'flex items-center gap-2';

                    const priceBadge = document.createElement('span');
                    priceBadge.className = 'font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded';
                    priceBadge.textContent = this.formatCurrency(act.price);

                    const delActBtn = document.createElement('button');
                    delActBtn.className = 'text-red-400 hover:text-red-600 font-bold px-1';
                    delActBtn.textContent = '×';
                    delActBtn.title = t('classDetails.delete');
                    delActBtn.onclick = () => classManager.deleteActivity(act.id);

                    actRight.appendChild(priceBadge);
                    actRight.appendChild(delActBtn);

                    actRow.appendChild(actInfo);
                    actRow.appendChild(actRight);
                    actList.appendChild(actRow);
                });
            }
            body.appendChild(actList);
            card.appendChild(body);
            container.appendChild(card);
        });
    }

    renderMonthlyOverview() {
        const monthLabel = document.getElementById('currentMonth');
        if (monthLabel) monthLabel.textContent = this.getMonthName(this.currentMonth);

        const gridContainer = document.getElementById('monthlyOverviewCards');
        if (!gridContainer) return;

        gridContainer.textContent = '';

        let totalClassesAll = 0;
        let totalCostAll = 0;

        this.children.forEach(child => {
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
            const childDefaultPrice = this.getChildPrice(child.id);
            const childTotal = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);

            totalClassesAll += activeClasses.length;
            totalCostAll += childTotal;

            const card = document.createElement('div');
            card.className = 'p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between';
            card.style.borderLeft = `5px solid ${child.color || '#3B82F6'}`;

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-3';
            header.innerHTML = `
                <h3 class="font-bold text-gray-800 text-lg">${escapeHtml(child.name)}</h3>
                <span class="text-xs px-2.5 py-1 rounded-full font-semibold" style="background-color: ${child.color}20; color: ${child.color};">${activeClasses.length} ${t('reports.classes')}</span>
            `;

            const stats = document.createElement('div');
            stats.className = 'space-y-2';
            stats.innerHTML = `
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">${t('monthlyOverview.classesThisMonth')}</span>
                    <span class="font-semibold text-gray-800">${activeClasses.length}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">${t('monthlyOverview.monthlyTotal')}</span>
                    <span class="font-bold text-green-600 text-base">${this.formatCurrency(childTotal)}</span>
                </div>
            `;

            card.appendChild(header);
            card.appendChild(stats);
            gridContainer.appendChild(card);
        });

        // Summary totals
        const totalClassesEl = document.getElementById('totalMonthlyClasses');
        const totalRevenueEl = document.getElementById('totalMonthlyRevenue');

        if (totalClassesEl) totalClassesEl.textContent = totalClassesAll;
        if (totalRevenueEl) totalRevenueEl.textContent = this.formatCurrency(totalCostAll);
    }

    renderScheduleSection() {
        const scheduleContainer = document.getElementById('dynamicSchedulesContainer');
        if (!scheduleContainer) return;

        scheduleContainer.textContent = '';

        if (this.children.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'col-span-full text-center py-6 text-gray-500';
            empty.textContent = t('children.noChildren');
            scheduleContainer.appendChild(empty);
            return;
        }

        this.children.forEach(child => {
            const childActs = this.getChildActivities(child.id);
            const childSchedules = this.schedules[child.id] || [];

            const col = document.createElement('div');
            col.className = 'bg-white p-5 rounded-xl border shadow-sm space-y-4';

            // Column Header
            const colHeader = document.createElement('div');
            colHeader.className = 'flex justify-between items-center border-b pb-3';
            colHeader.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${child.color || '#3B82F6'};"></span>
                    <h3 class="font-bold text-gray-800 text-lg">${escapeHtml(child.name)}</h3>
                </div>
                <button onclick="classManager.generateMonthlyClasses('${child.id}')" class="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm">
                    ⚡ ${t('schedules.generateClasses')}
                </button>
            `;
            col.appendChild(colHeader);

            // Add Schedule Box
            const formBox = document.createElement('div');
            formBox.className = 'p-3 bg-gray-50 rounded-lg space-y-2 border text-sm';

            let actOptionsHtml = '';
            childActs.forEach(act => {
                actOptionsHtml += `<option value="${act.id}">${escapeHtml(act.name)} (${this.formatCurrency(act.price)})</option>`;
            });

            formBox.innerHTML = `
                <div class="font-semibold text-gray-700 text-xs mb-1">${t('schedules.addScheduleTitle')}</div>
                ${childActs.length > 1 ? `
                    <select id="sch_act_${child.id}" class="w-full px-3 py-1.5 border rounded-md text-sm mb-2 bg-white">
                        ${actOptionsHtml}
                    </select>
                ` : `<input type="hidden" id="sch_act_${child.id}" value="${childActs[0] ? childActs[0].id : ''}">`}
                <div class="grid grid-cols-2 gap-2">
                    <select id="sch_day_${child.id}" class="px-3 py-1.5 border rounded-md text-sm bg-white">
                        <option value="monday">${t('schedules.monday')}</option>
                        <option value="tuesday">${t('schedules.tuesday')}</option>
                        <option value="wednesday">${t('schedules.wednesday')}</option>
                        <option value="thursday">${t('schedules.thursday')}</option>
                        <option value="friday">${t('schedules.friday')}</option>
                        <option value="saturday">${t('schedules.saturday')}</option>
                        <option value="sunday">${t('schedules.sunday')}</option>
                    </select>
                    <input type="time" id="sch_time_${child.id}" class="px-3 py-1.5 border rounded-md text-sm bg-white" value="16:00">
                </div>
                <button onclick="handleScheduleAdd('${child.id}')" class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 rounded-md text-xs transition">
                    + ${t('schedules.addScheduleBtn')}
                </button>
            `;
            col.appendChild(formBox);

            // Schedules List
            const list = document.createElement('div');
            list.className = 'space-y-2 max-h-48 overflow-y-auto';

            if (childSchedules.length === 0) {
                const emptySch = document.createElement('p');
                emptySch.className = 'text-xs text-gray-400 italic text-center py-2';
                emptySch.textContent = t('schedules.noSchedules');
                list.appendChild(emptySch);
            } else {
                childSchedules.forEach(sch => {
                    const act = this.getActivityById(sch.activityId);
                    const actName = act ? act.name : '';

                    const row = document.createElement('div');
                    row.className = 'p-2.5 bg-gray-50 rounded-lg flex justify-between items-center text-xs border';
                    row.innerHTML = `
                        <div class="flex flex-col">
                            <span class="font-semibold text-gray-800">${this.getDayDisplayName(sch.day)} ${t('schedules.at')} ${escapeHtml(sch.time)}</span>
                            ${actName ? `<span class="text-blue-600 text-[11px]">${escapeHtml(actName)}</span>` : ''}
                        </div>
                        <button onclick="classManager.removeSchedule('${child.id}', ${sch.id})" class="text-red-500 hover:text-red-700 font-bold px-1">
                            ${t('schedules.remove')}
                        </button>
                    `;
                    list.appendChild(row);
                });
            }
            col.appendChild(list);
            scheduleContainer.appendChild(col);
        });
    }

    renderExtraClassFormSelectors() {
        const childSelect = document.getElementById('extraClassChildSelect');
        const actSelect = document.getElementById('extraClassActivitySelect');
        if (!childSelect || !actSelect) return;

        const currentChildVal = childSelect.value;
        childSelect.innerHTML = '';

        this.children.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.textContent = c.name;
            childSelect.appendChild(opt);
        });

        if (currentChildVal && this.children.some(c => c.id === currentChildVal)) {
            childSelect.value = currentChildVal;
        }

        const updateActOptions = () => {
            const selectedChildId = childSelect.value;
            actSelect.innerHTML = '';
            const childActs = this.getChildActivities(selectedChildId);
            if (childActs.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = t('activities.defaultActivity');
                actSelect.appendChild(opt);
            } else {
                childActs.forEach(a => {
                    const opt = document.createElement('option');
                    opt.value = a.id;
                    opt.textContent = `${a.name} (${this.formatCurrency(a.price)})`;
                    actSelect.appendChild(opt);
                });
            }
        };

        childSelect.onchange = updateActOptions;
        updateActOptions();
    }

    renderClassLists() {
        const container = document.getElementById('dynamicClassDetailsContainer');
        if (!container) return;

        container.textContent = '';

        const filterChildId = this.selectedChildFilter;
        const visibleChildren = filterChildId === 'all'
            ? this.children
            : this.children.filter(c => c.id === filterChildId);

        if (visibleChildren.length === 0) {
            const p = document.createElement('p');
            p.className = 'text-gray-500 text-center py-6 col-span-full';
            p.textContent = t('classDetails.noClasses');
            container.appendChild(p);
            return;
        }

        visibleChildren.forEach(child => {
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const childDefaultPrice = this.getChildPrice(child.id);

            const col = document.createElement('div');
            col.className = 'bg-white p-5 rounded-xl border shadow-sm flex flex-col';

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center mb-4 pb-2 border-b';
            header.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${child.color || '#3B82F6'};"></span>
                    <h3 class="font-bold text-gray-800 text-lg">${escapeHtml(child.name)}</h3>
                </div>
                <span class="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                    ${monthlyClasses.length} ${t('reports.classes')}
                </span>
            `;
            col.appendChild(header);

            const list = document.createElement('div');
            list.className = 'space-y-2 max-h-96 overflow-y-auto pr-1 flex-1';

            if (monthlyClasses.length === 0) {
                const noCls = document.createElement('p');
                noCls.className = 'text-sm text-gray-400 italic text-center py-6';
                noCls.textContent = t('classDetails.noClasses');
                list.appendChild(noCls);
            } else {
                monthlyClasses.forEach(cls => {
                    const act = this.getActivityById(cls.activityId);
                    const actName = act ? act.name : '';
                    const isCancelled = cls.status === 'cancelled';
                    const sessionPrice = cls.price !== undefined && cls.price !== 0 ? cls.price : childDefaultPrice;

                    const row = document.createElement('div');
                    row.className = `p-3 rounded-lg border flex justify-between items-center transition ${isCancelled ? 'bg-red-50/50 border-red-200 opacity-60' : 'bg-gray-50 hover:bg-gray-100'}`;

                    const info = document.createElement('div');
                    info.className = 'space-y-0.5';

                    const dateLine = document.createElement('div');
                    dateLine.className = `font-medium text-sm ${isCancelled ? 'line-through text-gray-500' : 'text-gray-800'}`;
                    dateLine.textContent = this.formatDisplayDate(cls.date);

                    const subLine = document.createElement('div');
                    subLine.className = 'text-xs flex items-center gap-2';
                    subLine.innerHTML = `
                        <span class="text-blue-600 font-medium">${t('classDetails.at')} ${escapeHtml(cls.time)}</span>
                        ${actName ? `<span class="text-gray-600">• ${escapeHtml(actName)}</span>` : ''}
                        <span class="font-bold text-green-700">• ${this.formatCurrency(sessionPrice)}</span>
                    `;

                    info.appendChild(dateLine);
                    info.appendChild(subLine);

                    const actions = document.createElement('div');
                    actions.className = 'flex items-center gap-2';

                    // Status Toggle Button
                    const statusBtn = document.createElement('button');
                    statusBtn.className = `text-xs px-2 py-1 rounded font-medium ${isCancelled ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'}`;
                    statusBtn.textContent = isCancelled ? t('classDetails.statusCancelled') : t('classDetails.statusCompleted');
                    statusBtn.title = 'Click to toggle completed / cancelled';
                    statusBtn.onclick = () => classManager.toggleSessionStatus(child.id, cls.id);

                    // Delete Button
                    const delBtn = document.createElement('button');
                    delBtn.className = 'text-red-500 hover:text-red-700 p-1 rounded text-sm';
                    delBtn.title = t('classDetails.delete');
                    delBtn.innerHTML = '🗑️';
                    delBtn.onclick = () => classManager.removeClass(child.id, cls.id);

                    actions.appendChild(statusBtn);
                    actions.appendChild(delBtn);

                    row.appendChild(info);
                    row.appendChild(actions);
                    list.appendChild(row);
                });
            }

            col.appendChild(list);
            container.appendChild(col);
        });
    }

    renderReports() {
        const reportsContainer = document.getElementById('dynamicReportsContainer');
        if (!reportsContainer) return;

        reportsContainer.textContent = '';
        const monthName = this.getMonthName(this.currentMonth);

        this.children.forEach(child => {
            const card = document.createElement('div');
            card.className = 'border rounded-xl p-5 bg-white shadow-sm space-y-4';

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center border-b pb-3';
            header.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background-color: ${child.color || '#3B82F6'};"></span>
                    <h3 class="font-bold text-gray-800 text-lg">${t('reports.childReport', { name: child.name })}</h3>
                </div>
                <div class="flex items-center gap-1.5 flex-wrap">
                    <button onclick="classManager.downloadReport('${child.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition">
                        📥 ${t('reports.download')}
                    </button>
                    <button onclick="classManager.shareWhatsApp('${child.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition" title="${t('reports.shareWhatsApp')}">
                        💬 WhatsApp
                    </button>
                </div>
            `;
            card.appendChild(header);

            const content = this._buildDynamicReportHtml(child, monthName);
            card.appendChild(content);

            reportsContainer.appendChild(card);
        });

        // Combined Family Report
        this.renderCombinedReport(monthName);
    }

    _buildDynamicReportHtml(child, monthName) {
        const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
        const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
        const childDefaultPrice = this.getChildPrice(child.id);
        const childTotal = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-3 text-sm';

        // Overview stats
        const stats = document.createElement('div');
        stats.className = 'p-3 bg-gray-50 rounded-lg space-y-1';
        stats.innerHTML = `
            <div class="flex justify-between">
                <span class="text-gray-600">${t('reports.totalClasses')}</span>
                <span class="font-semibold text-gray-800">${activeClasses.length}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">${t('reports.pricePerClass')}</span>
                <span class="font-semibold text-gray-800">${this.formatCurrency(childDefaultPrice)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">${t('reports.totalAmount')}</span>
                <span class="font-bold text-green-600 text-base">${this.formatCurrency(childTotal)}</span>
            </div>
        `;
        wrapper.appendChild(stats);

        // Group by activity breakdown
        const acts = this.getChildActivities(child.id);
        if (acts.length > 0) {
            const breakdown = document.createElement('div');
            breakdown.className = 'space-y-1.5 text-xs';

            const breakTitle = document.createElement('div');
            breakTitle.className = 'font-semibold text-gray-700';
            breakTitle.textContent = t('reports.byActivity');
            breakdown.appendChild(breakTitle);

            acts.forEach(act => {
                const actClasses = activeClasses.filter(c => c.activityId === act.id);
                if (actClasses.length > 0) {
                    const actTotal = actClasses.reduce((sum, c) => sum + (c.price || 0), 0);
                    const row = document.createElement('div');
                    row.className = 'flex justify-between py-1 border-b border-gray-100';
                    row.innerHTML = `
                        <span class="text-gray-600">• ${escapeHtml(act.name)} (${actClasses.length} ${t('reports.classes')})</span>
                        <span class="font-medium text-gray-800">${this.formatCurrency(actTotal)}</span>
                    `;
                    breakdown.appendChild(row);
                }
            });
            wrapper.appendChild(breakdown);
        }

        // Details list
        if (monthlyClasses.length > 0) {
            const detailsWrap = document.createElement('div');
            detailsWrap.className = 'mt-3';

            const detailsHeader = document.createElement('div');
            detailsHeader.className = 'font-semibold text-xs text-gray-700 mb-1';
            detailsHeader.textContent = t('reports.classDetails');
            detailsWrap.appendChild(detailsHeader);

            const list = document.createElement('div');
            list.className = 'space-y-1 max-h-40 overflow-y-auto pr-1';

            monthlyClasses.forEach(cls => {
                const act = this.getActivityById(cls.activityId);
                const isCancelled = cls.status === 'cancelled';
                const sessionPrice = cls.price !== undefined && cls.price !== 0 ? cls.price : childDefaultPrice;
                const entry = document.createElement('div');
                entry.className = `text-xs py-1 px-2 rounded flex justify-between ${isCancelled ? 'bg-red-50 text-gray-400 line-through' : 'bg-gray-50 text-gray-700'}`;
                entry.innerHTML = `
                    <span>${this.formatDisplayDate(cls.date, cls.time)} ${act ? `(${escapeHtml(act.name)})` : ''}</span>
                    <span class="font-medium">${this.formatCurrency(sessionPrice)}</span>
                `;
                list.appendChild(entry);
            });

            detailsWrap.appendChild(list);
            wrapper.appendChild(detailsWrap);
        }

        return wrapper;
    }

    renderCombinedReport(monthName) {
        const combinedContainer = document.getElementById('dynamicCombinedReport');
        if (!combinedContainer) return;

        combinedContainer.textContent = '';

        let totalSessionsAll = 0;
        let totalAmountAll = 0;

        const combinedWrap = document.createElement('div');
        combinedWrap.className = 'space-y-5';

        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4';

        this.children.forEach(child => {
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
            const childDefaultPrice = this.getChildPrice(child.id);
            const childTotal = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);

            totalSessionsAll += activeClasses.length;
            totalAmountAll += childTotal;

            const col = document.createElement('div');
            col.className = 'p-3 bg-white border rounded-lg space-y-1 text-sm';
            col.innerHTML = `
                <div class="font-bold" style="color: ${child.color || '#3B82F6'};">${escapeHtml(child.name)}</div>
                <div class="flex justify-between text-xs text-gray-600">
                    <span>${t('reports.classes')} ${activeClasses.length}</span>
                    <span class="font-semibold text-gray-800">${this.formatCurrency(childTotal)}</span>
                </div>
            `;
            grid.appendChild(col);
        });

        combinedWrap.appendChild(grid);

        // Summary bar
        const summary = document.createElement('div');
        summary.className = 'border-t pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border';
        summary.innerHTML = `
            <div>
                <h4 class="font-bold text-gray-800 text-base">${t('reports.summary')} ${this.settings.familyName ? `- ${escapeHtml(this.settings.familyName)}` : ''} (${monthName})</h4>
                <div class="text-sm text-gray-600 mt-1">
                    ${t('reports.combinedTotalClasses')} <strong class="text-gray-900">${totalSessionsAll}</strong>
                </div>
            </div>
            <div class="text-right">
                <div class="text-xs text-gray-500">${t('monthlyOverview.totalRevenue')}</div>
                <div class="text-2xl font-black text-green-600">${this.formatCurrency(totalAmountAll)}</div>
            </div>
        `;
        combinedWrap.appendChild(summary);

        combinedContainer.appendChild(combinedWrap);
    }

    // --- Plain-text Report Generator ---
    generateReportText(childId) {
        const child = this.getChildById(childId);
        const childName = child ? child.name : (t(`student.${childId}`) || childId);
        const monthName = this.getMonthName(this.currentMonth);
        const monthlyClasses = this.getMonthlyClasses(childId, this.currentMonth);
        const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
        const childDefaultPrice = this.getChildPrice(childId);
        const total = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);

        let report = `========================================\n`;
        report += `${childName} - ${t('reports.title')}\n`;
        report += `${monthName}\n`;
        if (this.settings.familyName) {
            report += `${this.settings.familyName}\n`;
        }
        report += `========================================\n\n`;

        report += `${t('reports.totalClasses')} ${activeClasses.length}\n`;
        report += `${t('reports.pricePerClass')} ${this.formatCurrency(childDefaultPrice)}\n`;
        report += `${t('reports.totalAmount')} ${this.formatCurrency(total)}\n\n`;

        // Breakdown by activity
        const acts = this.getChildActivities(childId);
        if (acts.length > 0) {
            report += `${t('reports.byActivity')}\n`;
            report += `----------------------------------------\n`;
            acts.forEach(act => {
                const actClasses = activeClasses.filter(c => c.activityId === act.id);
                if (actClasses.length > 0) {
                    const actTotal = actClasses.reduce((sum, c) => sum + (c.price || 0), 0);
                    report += `• ${act.name}: ${actClasses.length} ${t('reports.classes')} = ${this.formatCurrency(actTotal)}\n`;
                }
            });
            report += `\n`;
        }

        if (monthlyClasses.length > 0) {
            report += `${t('reports.classDetails')}\n`;
            report += `----------------------------------------\n`;
            monthlyClasses.forEach((cls, index) => {
                const act = this.getActivityById(cls.activityId);
                const actLabel = act ? `[${act.name}] ` : '';
                const cancelLabel = cls.status === 'cancelled' ? `(${t('classDetails.statusCancelled')})` : '';
                const p = cls.price !== undefined && cls.price !== 0 ? cls.price : childDefaultPrice;
                report += `${index + 1}. ${cls.date} @ ${cls.time} - ${actLabel}${this.formatCurrency(p)} ${cancelLabel}\n`;
            });
        }

        report += `\n========================================\n`;
        report += `${t('reports.generatedOn')} ${new Date().toLocaleString(this.getDisplayLocale())}\n`;

        return report;
    }

    generateCombinedReportText() {
        const monthName = this.getMonthName(this.currentMonth);
        let totalClassesAll = 0;
        let totalAmountAll = 0;

        let report = `==================================================\n`;
        report += `${t('reports.combined')}\n`;
        report += `${monthName}\n`;
        if (this.settings.familyName) {
            report += `${this.settings.familyName}\n`;
        }
        report += `==================================================\n\n`;

        this.children.forEach(child => {
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const activeClasses = monthlyClasses.filter(c => c.status !== 'cancelled');
            const childDefaultPrice = this.getChildPrice(child.id);
            const childTotal = activeClasses.reduce((sum, c) => sum + (c.price !== undefined && c.price !== 0 ? c.price : childDefaultPrice), 0);
            totalClassesAll += activeClasses.length;
            totalAmountAll += childTotal;

            report += `${child.name.toUpperCase()}\n`;
            report += `----------------------------------------\n`;
            report += `${t('reports.totalClasses')} ${activeClasses.length}\n`;
            report += `${t('reports.pricePerClass')} ${this.formatCurrency(childDefaultPrice)}\n`;
            report += `${t('reports.totalAmount')} ${this.formatCurrency(childTotal)}\n\n`;

            if (monthlyClasses.length > 0) {
                monthlyClasses.forEach((cls, i) => {
                    const act = this.getActivityById(cls.activityId);
                    const actName = act ? `[${act.name}] ` : '';
                    const cancel = cls.status === 'cancelled' ? `(${t('classDetails.statusCancelled')})` : '';
                    const p = cls.price !== undefined && cls.price !== 0 ? cls.price : childDefaultPrice;
                    report += `  ${i + 1}. ${cls.date} @ ${cls.time} ${actName}- ${this.formatCurrency(p)} ${cancel}\n`;
                });
                report += '\n';
            }
        });

        report += `==================================================\n`;
        report += `${t('reports.summary').toUpperCase()}\n`;
        report += `${t('reports.combinedTotalClasses')} ${totalClassesAll}\n`;
        report += `${t('monthlyOverview.totalRevenue')} ${this.formatCurrency(totalAmountAll)}\n`;
        report += `==================================================\n`;
        report += `${t('reports.generatedOn')} ${new Date().toLocaleString(this.getDisplayLocale())}\n`;

        return report;
    }

    downloadReport(type) {
        let reportText;
        let filename;
        const monthName = this.getMonthName(this.currentMonth).replace(/[\s,]+/g, '_');

        if (type === 'combined') {
            reportText = this.generateCombinedReportText();
            filename = `Family_Report_${monthName}.txt`;
        } else {
            const child = this.getChildById(type);
            const childName = child ? child.name.replace(/[\s,]+/g, '_') : (t(`student.${type}`) || type);
            reportText = this.generateReportText(type);
            filename = `${childName}_Report_${monthName}.txt`;
        }

        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // Export CSV report for Excel
    exportCsvReport() {
        const monthName = this.getMonthName(this.currentMonth);
        let csvContent = `Child,Date,Time,Activity,Price,Status,Currency\n`;

        this.children.forEach(child => {
            const monthlyClasses = this.getMonthlyClasses(child.id, this.currentMonth);
            const childDefaultPrice = this.getChildPrice(child.id);
            monthlyClasses.forEach(cls => {
                const act = this.getActivityById(cls.activityId);
                const actName = act ? `"${act.name}"` : '""';
                const p = cls.price !== undefined && cls.price !== 0 ? cls.price : childDefaultPrice;
                csvContent += `"${child.name}",${cls.date},${cls.time},${actName},${p},${cls.status},${this.getCurrency()}\n`;
            });
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Family_Report_${monthName.replace(/[\s,]+/g, '_')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // WhatsApp Message sharing
    shareWhatsApp(childId) {
        let text = '';
        if (childId === 'combined') {
            text = this.generateCombinedReportText();
        } else {
            text = this.generateReportText(childId);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert(t('alert.copiedWhatsApp'));
            }).catch(() => {
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            });
        } else {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
        }
    }

    // --- Backup & Restore ---
    exportBackupJson() {
        const backupData = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            settings: this.settings,
            children: this.children,
            activities: this.activities,
            classes: this.classes,
            schedules: this.schedules,
            prices: this.prices
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Family_Class_Manager_Backup_${this.getLocalDateString(new Date())}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    importBackupJson(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (!data.children || !Array.isArray(data.children)) {
                throw new Error('Invalid schema');
            }

            this.settings = data.settings || { familyName: '', currency: '$' };
            this.children = data.children || [];
            this.activities = data.activities || [];
            this.classes = data.classes || {};
            this.schedules = data.schedules || {};
            this.prices = data.prices || {};

            this.persistAllData();
            this.updateDisplay();
            alert(t('status.imported'));
            return true;
        } catch (err) {
            console.error('Import error:', err);
            alert(t('status.importFailed'));
            return false;
        }
    }
}

// Global modal helpers and onclick handlers
let classManager;

function handleScheduleAdd(childId) {
    const actSel = document.getElementById(`sch_act_${childId}`);
    const daySel = document.getElementById(`sch_day_${childId}`);
    const timeInp = document.getElementById(`sch_time_${childId}`);

    const actId = actSel ? actSel.value : '';
    const day = daySel ? daySel.value : '';
    const time = timeInp ? timeInp.value : '';

    classManager.addSchedule(childId, actId, day, time);
}

function handleExtraClassAdd() {
    const childSel = document.getElementById('extraClassChildSelect');
    const actSel = document.getElementById('extraClassActivitySelect');
    const dateInp = document.getElementById('extraClassDate');
    const timeInp = document.getElementById('extraClassTime');
    const priceInp = document.getElementById('extraClassCustomPrice');

    const childId = childSel ? childSel.value : '';
    const actId = actSel ? actSel.value : '';
    const date = dateInp ? dateInp.value : '';
    const time = timeInp ? timeInp.value : '';
    const price = priceInp && priceInp.value ? parseFloat(priceInp.value) : null;

    classManager.addClass(childId, actId, date, time, price);

    if (priceInp) priceInp.value = '';
}

function openAddChildModal() {
    const name = prompt(t('children.childNamePlaceholder'));
    if (name) {
        const colors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        classManager.addChild(name, randomColor);
    }
}

function openEditChildModal(childId) {
    const child = classManager.getChildById(childId);
    if (!child) return;
    const newName = prompt(t('children.childName'), child.name);
    if (newName && newName.trim()) {
        classManager.editChild(childId, newName.trim(), child.color);
    }
}

function openAddActivityModal(childId) {
    const actName = prompt(t('activities.namePlaceholder'));
    if (!actName || !actName.trim()) return;

    const actPrice = prompt(t('activities.price'), '50');
    if (!actPrice || isNaN(parseFloat(actPrice))) return;

    const instructor = prompt(t('activities.instructorPlaceholder'), '');
    classManager.addActivity(childId, actName, parseFloat(actPrice), instructor || '');
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        classManager.importBackupJson(evt.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
}

// Global functions for backward compatibility with onclicks in tests
function addClass(student) { classManager.addClass(student); }
function removeClass(student, classId) { classManager.removeClass(student, classId); }
function addSchedule(student) { classManager.addSchedule(student); }
function removeSchedule(student, scheduleId) { classManager.removeSchedule(student, scheduleId); }
function generateMonthlyClasses(student) { classManager.generateMonthlyClasses(student); }
function downloadReport(type) { classManager.downloadReport(type); }

document.addEventListener('DOMContentLoaded', function () {
    classManager = new StudentClassManager();
});

// Export for testing in Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StudentClassManager };
}
