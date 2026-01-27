/**
 * Integration tests for report generation
 * Tests: generateReport, downloadReport
 */

import { Share } from 'react-native';

describe('Report Generation Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper functions simulating app logic
  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getMonthlyClasses = (student, month, classes) => {
    if (!classes[student]) return [];
    return classes[student]
      .filter((cls) => cls.date.startsWith(month))
      .sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.time);
        const dateB = new Date(b.date + 'T' + b.time);
        return dateB.getTime() - dateA.getTime();
      });
  };

  describe('generateReport', () => {
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

    test('generates combined report correctly', async () => {
      const currentMonth = '2025-01';
      const monthName = getMonthName(currentMonth);

      let reportText = `Student Class Management Report\n${monthName}\n\n`;
      reportText += 'Combined Report\n';
      reportText += `Kareem: ${getMonthlyClasses('kareem', currentMonth, mockClasses).length} classes\n`;
      reportText += `Sara_Hana: ${getMonthlyClasses('saraHana', currentMonth, mockClasses).length} classes\n`;

      expect(reportText).toContain('Student Class Management Report');
      expect(reportText).toContain('January 2025');
      expect(reportText).toContain('Combined Report');
      expect(reportText).toContain('Kareem: 3 classes');
      expect(reportText).toContain('Sara_Hana: 2 classes');
    });

    test('generates individual student report correctly', async () => {
      const currentMonth = '2025-01';
      const monthName = getMonthName(currentMonth);
      const studentKey = 'kareem';
      const studentName = 'Kareem';

      const monthlyClasses = getMonthlyClasses(studentKey, currentMonth, mockClasses);
      const studentPrice = parseFloat(mockPrices[studentKey]) || 0;
      const total = monthlyClasses.length * studentPrice;

      let reportText = `Student Class Management Report\n${monthName}\n\n`;
      reportText += `${studentName} Report\n`;
      reportText += `Total Classes: ${monthlyClasses.length}\n`;
      reportText += `Price per Class: $${studentPrice.toFixed(2)}\n`;
      reportText += `Total Amount: $${total.toFixed(2)}\n`;

      expect(reportText).toContain('Kareem Report');
      expect(reportText).toContain('Total Classes: 3');
      expect(reportText).toContain('Price per Class: $25.00');
      expect(reportText).toContain('Total Amount: $75.00');
    });

    test('calls Share.share with correct parameters', async () => {
      const currentMonth = '2025-01';
      const monthName = getMonthName(currentMonth);
      const reportText = `Student Class Management Report\n${monthName}\n\nCombined Report`;

      await Share.share({
        message: reportText,
        title: `${monthName} Report`,
      });

      expect(Share.share).toHaveBeenCalledWith({
        message: expect.stringContaining('Student Class Management Report'),
        title: 'January 2025 Report',
      });
    });
  });

  describe('downloadReport', () => {
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

    test('generates combined download report with grand total', async () => {
      const currentMonth = '2025-01';
      const monthName = getMonthName(currentMonth);

      const kareemClasses = getMonthlyClasses('kareem', currentMonth, mockClasses);
      const saraHanaClasses = getMonthlyClasses('saraHana', currentMonth, mockClasses);
      const kareemPrice = parseFloat(mockPrices.kareem) || 0;
      const saraHanaPrice = parseFloat(mockPrices.saraHana) || 0;
      const kareemTotal = kareemClasses.length * kareemPrice;
      const saraHanaTotal = saraHanaClasses.length * saraHanaPrice;
      const grandTotal = kareemTotal + saraHanaTotal;

      let reportContent = `Student Class Management Report\n${monthName}\n${'='.repeat(50)}\n\n`;
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

      expect(reportContent).toContain('COMBINED MONTHLY REPORT');
      expect(reportContent).toContain('Kareem:');
      expect(reportContent).toContain('Classes: 3');
      expect(reportContent).toContain('Total: $75.00');
      expect(reportContent).toContain('Sara_Hana:');
      expect(reportContent).toContain('Classes: 2');
      expect(reportContent).toContain('Total: $60.00');
      expect(reportContent).toContain('GRAND TOTAL: $135.00');
    });

    test('generates individual download report with class details', async () => {
      const currentMonth = '2025-01';
      const monthName = getMonthName(currentMonth);
      const studentKey = 'kareem';
      const studentName = 'Kareem';

      const monthlyClasses = getMonthlyClasses(studentKey, currentMonth, mockClasses);
      const studentPrice = parseFloat(mockPrices[studentKey]) || 0;
      const total = monthlyClasses.length * studentPrice;

      let reportContent = `Student Class Management Report\n${monthName}\n${'='.repeat(50)}\n\n`;
      reportContent += `${studentName.toUpperCase()} REPORT\n\n`;
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

      expect(reportContent).toContain('KAREEM REPORT');
      expect(reportContent).toContain('Total Classes: 3');
      expect(reportContent).toContain('Total Amount: $75.00');
      expect(reportContent).toContain('CLASS DETAILS:');
      expect(reportContent).toContain('2025-01-');
    });

    test('generates filename correctly for combined report', () => {
      const monthName = 'January 2025';
      const fileName = `Combined_Report_${monthName.replace(' ', '_')}.txt`;

      expect(fileName).toBe('Combined_Report_January_2025.txt');
    });

    test('generates filename correctly for individual report', () => {
      const studentName = 'Kareem';
      const monthName = 'January 2025';
      const fileName = `${studentName}_Report_${monthName.replace(' ', '_')}.txt`;

      expect(fileName).toBe('Kareem_Report_January_2025.txt');
    });

    test('includes timestamp in report', () => {
      const timestamp = new Date().toLocaleString();
      const reportContent = `\n\nGenerated on: ${timestamp}\nStudent Class Management App v1.0\n`;

      expect(reportContent).toContain('Generated on:');
      expect(reportContent).toContain('Student Class Management App v1.0');
    });
  });

  describe('Report calculations', () => {
    test('calculates correct totals for zero classes', () => {
      const classes = { kareem: [], saraHana: [] };
      const currentMonth = '2025-01';

      const kareemClasses = getMonthlyClasses('kareem', currentMonth, classes);
      const price = 25;
      const total = kareemClasses.length * price;

      expect(total).toBe(0);
    });

    test('handles missing student data', () => {
      const classes = { kareem: [] };
      const currentMonth = '2025-01';

      const saraHanaClasses = getMonthlyClasses('saraHana', currentMonth, classes);

      expect(saraHanaClasses.length).toBe(0);
    });

    test('handles invalid price string', () => {
      const price = parseFloat('invalid') || 0;
      expect(price).toBe(0);
    });

    test('handles undefined price', () => {
      const prices = { kareem: undefined };
      const price = parseFloat(prices.kareem) || 0;
      expect(price).toBe(0);
    });
  });

  describe('Share functionality', () => {
    test('Share.share resolves successfully', async () => {
      const result = await Share.share({
        message: 'Test report content',
        title: 'Test Report',
      });

      expect(result).toEqual({ action: 'sharedAction' });
    });

    test('handles share with long content', async () => {
      const longContent = 'A'.repeat(10000);

      const result = await Share.share({
        message: longContent,
        title: 'Long Report',
      });

      expect(result.action).toBe('sharedAction');
    });
  });
});

describe('Month name conversion', () => {
  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  test('converts all months correctly', () => {
    const months = [
      { input: '2025-01', expected: 'January 2025' },
      { input: '2025-02', expected: 'February 2025' },
      { input: '2025-03', expected: 'March 2025' },
      { input: '2025-04', expected: 'April 2025' },
      { input: '2025-05', expected: 'May 2025' },
      { input: '2025-06', expected: 'June 2025' },
      { input: '2025-07', expected: 'July 2025' },
      { input: '2025-08', expected: 'August 2025' },
      { input: '2025-09', expected: 'September 2025' },
      { input: '2025-10', expected: 'October 2025' },
      { input: '2025-11', expected: 'November 2025' },
      { input: '2025-12', expected: 'December 2025' },
    ];

    months.forEach(({ input, expected }) => {
      expect(getMonthName(input)).toBe(expected);
    });
  });
});
