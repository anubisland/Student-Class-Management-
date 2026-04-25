/**
 * Tests for the Student Class Management System web app (script.js).
 *
 * We set up a minimal DOM fixture that mirrors index.html's element IDs
 * and a localStorage mock so StudentClassManager can initialise cleanly.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// DOM fixture — minimal HTML with every element ID that script.js touches
// ---------------------------------------------------------------------------
function buildFixtureDOM() {
  const ids = [
    'saveStatus', 'currentMonth', 'kareemMonthlyClasses', 'kareemMonthlyTotal',
    'saraHanaMonthlyClasses', 'saraHanaMonthlyTotal', 'totalMonthlyClasses',
    'totalMonthlyRevenue', 'kareemClasses', 'saraHanaClasses',
    'kareemScheduleList', 'saraHanaScheduleList',
    'kareemReport', 'saraHanaReport', 'combinedReport',
  ];
  const inputs = {
    'kareemPrice': 'number', 'saraHanaPrice': 'number',
    'monthSelector': 'month',
    'kareemDate': 'date', 'kareemTime': 'time',
    'saraHanaDate': 'date', 'saraHanaTime': 'time',
    'kareemScheduleTime': 'time', 'saraHanaScheduleTime': 'time',
  };
  const selects = ['kareemScheduleDay', 'saraHanaScheduleDay'];

  ids.forEach(id => {
    const el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  });
  Object.entries(inputs).forEach(([id, type]) => {
    const el = document.createElement('input');
    el.id = id;
    el.type = type;
    if (type === 'time') el.value = '09:00';
    document.body.appendChild(el);
  });
  selects.forEach(id => {
    const el = document.createElement('select');
    el.id = id;
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Select';
    el.appendChild(opt);
    document.body.appendChild(el);
  });
}

// ---------------------------------------------------------------------------
// localStorage mock
// ---------------------------------------------------------------------------
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Suppress alert() calls during tests
window.alert = jest.fn();

// ---------------------------------------------------------------------------
// Load the script — it defines StudentClassManager on the global scope
// ---------------------------------------------------------------------------
let StudentClassManager;

beforeAll(() => {
  buildFixtureDOM();
  const mod = require(path.resolve(__dirname, '..', 'script.js'));
  StudentClassManager = mod.StudentClassManager;
});

beforeEach(() => {
  // Reset DOM
  document.body.textContent = '';
  buildFixtureDOM();
  localStorageMock.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  window.alert.mockClear();
});

// Helper: create a manager instance (constructor calls init())
function createManager() {
  return new StudentClassManager();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StudentClassManager — construction & init', () => {
  test('initialises with default students', () => {
    const mgr = createManager();
    expect(mgr.students).toEqual(['kareem', 'saraHana']);
  });

  test('loads default prices when localStorage is empty', () => {
    const mgr = createManager();
    expect(mgr.prices.kareem).toBe(25);
    expect(mgr.prices.saraHana).toBe(30);
  });

  test('loads prices from localStorage when available', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'student-prices') return JSON.stringify({ kareem: 40, saraHana: 50 });
      return null;
    });
    const mgr = createManager();
    expect(mgr.prices.kareem).toBe(40);
    expect(mgr.prices.saraHana).toBe(50);
  });

  test('sets currentMonth to today\'s year-month', () => {
    const mgr = createManager();
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    expect(mgr.currentMonth).toBe(expected);
  });
});

describe('Date helpers', () => {
  let mgr;
  beforeEach(() => { mgr = createManager(); });

  test('getLocalDateString formats YYYY-MM-DD', () => {
    const d = new Date(2026, 3, 15); // April 15, 2026
    expect(mgr.getLocalDateString(d)).toBe('2026-04-15');
  });

  test('getLocalDateString pads single-digit month and day', () => {
    const d = new Date(2026, 0, 5); // Jan 5
    expect(mgr.getLocalDateString(d)).toBe('2026-01-05');
  });

  test('parseLocalDate creates correct Date object', () => {
    const d = mgr.parseLocalDate('2026-04-15');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(3); // 0-indexed
    expect(d.getDate()).toBe(15);
  });

  test('formatDisplayDate returns human-readable string', () => {
    const result = mgr.formatDisplayDate('2026-04-15');
    expect(result).toContain('2026');
    expect(result).toContain('Apr');
    expect(result).toContain('15');
  });

  test('formatDisplayDate appends time when provided', () => {
    const result = mgr.formatDisplayDate('2026-04-15', '10:30');
    expect(result).toContain('at 10:30');
  });

  test('getMonthName returns full month and year', () => {
    const result = mgr.getMonthName('2026-04');
    expect(result).toContain('April');
    expect(result).toContain('2026');
  });
});

describe('Database operations', () => {
  let mgr;
  beforeEach(() => { mgr = createManager(); });

  test('saveToDatabase writes JSON to localStorage', () => {
    mgr.saveToDatabase('test-key', { a: 1 });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify({ a: 1 }));
  });

  test('saveToDatabase returns true on success', () => {
    expect(mgr.saveToDatabase('k', {})).toBe(true);
  });

  test('loadFromDatabase returns parsed data', () => {
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ x: 42 }));
    expect(mgr.loadFromDatabase('k')).toEqual({ x: 42 });
  });

  test('loadFromDatabase returns default when key is missing', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    expect(mgr.loadFromDatabase('missing', [])).toEqual([]);
  });

  test('loadFromDatabase returns default on parse error', () => {
    localStorageMock.getItem.mockReturnValueOnce('invalid-json{');
    expect(mgr.loadFromDatabase('bad', 'fallback')).toBe('fallback');
  });
});

describe('classExists', () => {
  let mgr;
  beforeEach(() => {
    mgr = createManager();
    mgr.classes = {
      kareem: [
        { id: 1, date: '2026-04-10', time: '09:00' },
        { id: 2, date: '2026-04-12', time: '14:00' },
      ],
    };
  });

  test('returns true for matching date and time', () => {
    expect(mgr.classExists('kareem', '2026-04-10', '09:00')).toBe(true);
  });

  test('returns false for non-matching time', () => {
    expect(mgr.classExists('kareem', '2026-04-10', '10:00')).toBe(false);
  });

  test('returns false for student with no classes', () => {
    expect(mgr.classExists('saraHana', '2026-04-10', '09:00')).toBe(false);
  });
});

describe('getMonthlyClasses', () => {
  let mgr;
  beforeEach(() => {
    mgr = createManager();
    mgr.classes = {
      kareem: [
        { id: 1, date: '2026-04-01', time: '09:00' },
        { id: 2, date: '2026-04-15', time: '10:00' },
        { id: 3, date: '2026-05-01', time: '09:00' },
      ],
    };
  });

  test('filters classes by month prefix', () => {
    const result = mgr.getMonthlyClasses('kareem', '2026-04');
    expect(result).toHaveLength(2);
  });

  test('sorts by date descending (most recent first)', () => {
    const result = mgr.getMonthlyClasses('kareem', '2026-04');
    expect(result[0].date).toBe('2026-04-15');
    expect(result[1].date).toBe('2026-04-01');
  });

  test('returns empty array for student with no classes', () => {
    expect(mgr.getMonthlyClasses('saraHana', '2026-04')).toEqual([]);
  });

  test('returns empty array for month with no classes', () => {
    expect(mgr.getMonthlyClasses('kareem', '2026-06')).toEqual([]);
  });
});

describe('addClassToDatabase', () => {
  let mgr;
  beforeEach(() => { mgr = createManager(); });

  test('adds class entry for a student', () => {
    mgr.addClassToDatabase('kareem', '2026-04-20', '11:00');
    expect(mgr.classes.kareem).toHaveLength(1);
    expect(mgr.classes.kareem[0].date).toBe('2026-04-20');
    expect(mgr.classes.kareem[0].time).toBe('11:00');
  });

  test('creates student array if not present', () => {
    mgr.classes = {};
    mgr.addClassToDatabase('kareem', '2026-04-20', '11:00');
    expect(mgr.classes.kareem).toHaveLength(1);
  });

  test('persists to localStorage', () => {
    mgr.addClassToDatabase('kareem', '2026-04-20', '11:00');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'student-classes',
      expect.any(String)
    );
  });
});

describe('Schedule management', () => {
  let mgr;
  beforeEach(() => { mgr = createManager(); });

  test('removeSchedule filters by ID', () => {
    mgr.schedules = { kareem: [{ id: 100, day: 'monday', time: '09:00' }, { id: 200, day: 'friday', time: '14:00' }] };
    mgr.removeSchedule('kareem', 100);
    expect(mgr.schedules.kareem).toHaveLength(1);
    expect(mgr.schedules.kareem[0].id).toBe(200);
  });
});

describe('Report text generation', () => {
  let mgr;
  beforeEach(() => {
    mgr = createManager();
    mgr.currentMonth = '2026-04';
    mgr.prices = { kareem: 25, saraHana: 30 };
    mgr.classes = {
      kareem: [
        { id: 1, date: '2026-04-01', time: '09:00' },
        { id: 2, date: '2026-04-08', time: '09:00' },
      ],
      saraHana: [
        { id: 3, date: '2026-04-02', time: '10:00' },
      ],
    };
  });

  test('generateReportText includes student name', () => {
    const report = mgr.generateReportText('kareem');
    expect(report).toContain('Kareem');
  });

  test('generateReportText includes class count and total', () => {
    const report = mgr.generateReportText('kareem');
    expect(report).toContain('Total Classes: 2');
    expect(report).toContain('$50.00'); // 2 * $25
  });

  test('generateReportText includes price per class', () => {
    const report = mgr.generateReportText('kareem');
    expect(report).toContain('$25.00');
  });

  test('generateCombinedReportText includes both students', () => {
    const report = mgr.generateCombinedReportText();
    expect(report).toContain('KAREEM');
    expect(report).toContain('SARA_HANA');
  });

  test('generateCombinedReportText calculates grand total', () => {
    const report = mgr.generateCombinedReportText();
    // kareem: 2*25=50, saraHana: 1*30=30, total=80
    expect(report).toContain('$80.00');
  });

  test('generateCombinedReportText includes total class count', () => {
    const report = mgr.generateCombinedReportText();
    expect(report).toContain('Total Classes (Both Students): 3');
  });
});

describe('generateMonthlyClasses', () => {
  let mgr;
  beforeEach(() => {
    mgr = createManager();
    mgr.currentMonth = '2026-04'; // April 2026
    mgr.classes = {};
    mgr.schedules = {
      kareem: [{ id: 1, day: 'monday', time: '09:00' }],
    };
  });

  test('generates classes for every matching day in the month', () => {
    mgr.generateMonthlyClasses('kareem');
    // April 2026 has Mondays on: 6, 13, 20, 27 -> 4 classes
    const aprilClasses = mgr.getMonthlyClasses('kareem', '2026-04');
    expect(aprilClasses.length).toBe(4);
  });

  test('does not duplicate existing classes', () => {
    mgr.addClassToDatabase('kareem', '2026-04-06', '09:00');
    mgr.generateMonthlyClasses('kareem');
    const aprilClasses = mgr.getMonthlyClasses('kareem', '2026-04');
    expect(aprilClasses.length).toBe(4); // still 4, not 5
  });

  test('alerts when no schedules are set', () => {
    mgr.schedules = { saraHana: [] };
    mgr.generateMonthlyClasses('saraHana');
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('No schedules'));
  });
});

describe('removeClass', () => {
  let mgr;
  beforeEach(() => {
    mgr = createManager();
    mgr.classes = {
      kareem: [
        { id: 10, date: '2026-04-01', time: '09:00' },
        { id: 20, date: '2026-04-02', time: '10:00' },
      ],
    };
  });

  test('removes the class with matching ID', () => {
    mgr.removeClass('kareem', 10);
    expect(mgr.classes.kareem).toHaveLength(1);
    expect(mgr.classes.kareem[0].id).toBe(20);
  });

  test('saves updated classes to localStorage', () => {
    localStorageMock.setItem.mockClear();
    mgr.removeClass('kareem', 10);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('student-classes', expect.any(String));
  });
});

describe('showStatus', () => {
  let mgr;
  beforeEach(() => { mgr = createManager(); });

  test('sets status text content', () => {
    mgr.showStatus('Test message', 'text-blue-600');
    expect(document.getElementById('saveStatus').textContent).toBe('Test message');
  });
});
