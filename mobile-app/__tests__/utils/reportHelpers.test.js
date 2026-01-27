/**
 * Unit tests for reportHelpers utility module
 */

import {
  STUDENTS,
  generateReportText,
  generateDownloadReport,
  formatCurrency,
  getStudentPrice
} from '../../utils/reportHelpers';

describe('reportHelpers', () => {
  const mockClasses = {
    kareem: [
      { id: '1', date: '2025-01-06', time: '10:00' },
      { id: '2', date: '2025-01-08', time: '14:00' },
      { id: '3', date: '2025-01-13', time: '10:00' },
    ],
    saraHana: [
      { id: '4', date: '2025-01-07', time: '11:00' },
      { id: '5', date: '2025-01-09', time: '15:00' },
    ],
  };

  const mockPrices = {
    kareem: '25.00',
    saraHana: '30.00',
  };

  describe('STUDENTS', () => {
    test('contains kareem and saraHana', () => {
      expect(STUDENTS.length).toBe(2);
      expect(STUDENTS.find(s => s.key === 'kareem')).toBeDefined();
      expect(STUDENTS.find(s => s.key === 'saraHana')).toBeDefined();
    });

    test('has correct structure', () => {
      STUDENTS.forEach(student => {
        expect(student).toHaveProperty('key');
        expect(student).toHaveProperty('name');
        expect(student).toHaveProperty('color');
      });
    });
  });

  describe('generateReportText', () => {
    test('generates combined report', () => {
      const report = generateReportText('combined', '2025-01', mockClasses, mockPrices);
      expect(report).toContain('Student Class Management Report');
      expect(report).toContain('January 2025');
      expect(report).toContain('Combined Report');
      expect(report).toContain('Kareem: 3 classes');
      expect(report).toContain('Sara_Hana: 2 classes');
    });

    test('generates individual student report', () => {
      const report = generateReportText('kareem', '2025-01', mockClasses, mockPrices);
      expect(report).toContain('Kareem Report');
      expect(report).toContain('Total Classes: 3');
      expect(report).toContain('Price per Class: $25.00');
      expect(report).toContain('Total Amount: $75.00');
    });

    test('handles zero price', () => {
      const zeroPrices = { kareem: '0', saraHana: '30.00' };
      const report = generateReportText('kareem', '2025-01', mockClasses, zeroPrices);
      expect(report).toContain('Price per Class: $0.00');
      expect(report).toContain('Total Amount: $0.00');
    });

    test('handles empty month', () => {
      const report = generateReportText('kareem', '2025-03', mockClasses, mockPrices);
      expect(report).toContain('Total Classes: 0');
      expect(report).toContain('Total Amount: $0.00');
    });
  });

  describe('generateDownloadReport', () => {
    test('generates combined download report', () => {
      const result = generateDownloadReport('combined', '2025-01', mockClasses, mockPrices);
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('content');
      expect(result.fileName).toContain('Combined_Report');
      expect(result.content).toContain('COMBINED MONTHLY REPORT');
      expect(result.content).toContain('GRAND TOTAL: $135.00');
    });

    test('generates individual student download report', () => {
      const result = generateDownloadReport('kareem', '2025-01', mockClasses, mockPrices);
      expect(result.fileName).toContain('Kareem_Report');
      expect(result.content).toContain('KAREEM REPORT');
      expect(result.content).toContain('Total Classes: 3');
      expect(result.content).toContain('CLASS DETAILS:');
    });

    test('includes class details for student with classes', () => {
      const result = generateDownloadReport('kareem', '2025-01', mockClasses, mockPrices);
      expect(result.content).toContain('2025-01-06');
      expect(result.content).toContain('10:00');
    });

    test('includes generation timestamp', () => {
      const result = generateDownloadReport('kareem', '2025-01', mockClasses, mockPrices);
      expect(result.content).toContain('Generated on:');
      expect(result.content).toContain('Student Class Management App v1.0');
    });

    test('handles month with no classes', () => {
      const result = generateDownloadReport('kareem', '2025-03', mockClasses, mockPrices);
      expect(result.content).toContain('Total Classes: 0');
      expect(result.content).not.toContain('CLASS DETAILS:');
    });
  });

  describe('formatCurrency', () => {
    test('formats positive values', () => {
      expect(formatCurrency(25)).toBe('$25.00');
      expect(formatCurrency(100.5)).toBe('$100.50');
    });

    test('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('formats decimal values', () => {
      expect(formatCurrency(25.5)).toBe('$25.50');
      expect(formatCurrency(25.559)).toBe('$25.56'); // rounds up
      expect(formatCurrency(25.554)).toBe('$25.55'); // rounds down
    });

    test('formats large values', () => {
      expect(formatCurrency(1000)).toBe('$1000.00');
      expect(formatCurrency(10000.99)).toBe('$10000.99');
    });
  });

  describe('getStudentPrice', () => {
    test('returns formatted price for existing student', () => {
      expect(getStudentPrice(mockPrices, 'kareem')).toBe('$25.00');
      expect(getStudentPrice(mockPrices, 'saraHana')).toBe('$30.00');
    });

    test('returns $0.00 for missing student', () => {
      expect(getStudentPrice(mockPrices, 'missing')).toBe('$0.00');
    });

    test('returns $0.00 for invalid price', () => {
      const invalidPrices = { kareem: 'invalid' };
      expect(getStudentPrice(invalidPrices, 'kareem')).toBe('$0.00');
    });
  });
});
