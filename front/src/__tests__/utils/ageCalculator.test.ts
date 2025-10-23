import { calculateAge, isAdult, isMinor } from '../../utils/ageCalculator';

describe('Age Calculator Utils', () => {
  // Mock current date for consistent testing
  const mockToday = new Date('2025-10-22');
  const originalDate = global.Date;

  beforeAll(() => {
    // @ts-ignore
    global.Date = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(mockToday.getTime());
        } else {
          // @ts-ignore
          super(...args);
        }
      }
      static now() {
        return mockToday.getTime();
      }
    } as any;
  });

  afterAll(() => {
    global.Date = originalDate;
  });

  describe('calculateAge', () => {
    it('calculates age correctly for a birthdate 25 years ago', () => {
      const birthDate = '2000-10-22'; // Exactly 25 years ago
      expect(calculateAge(birthDate)).toBe(25);
    });

    it('calculates age correctly for a birthdate before birthday this year', () => {
      const birthDate = '2000-01-01'; // Birthday already passed this year
      expect(calculateAge(birthDate)).toBe(25);
    });

    it('calculates age correctly for a birthdate after birthday this year', () => {
      const birthDate = '2000-12-31'; // Birthday not yet this year
      expect(calculateAge(birthDate)).toBe(24);
    });

    it('handles Date object as input', () => {
      const birthDate = new Date('2000-10-22');
      expect(calculateAge(birthDate)).toBe(25);
    });

    it('returns null for null input', () => {
      expect(calculateAge(null)).toBe(null);
    });

    it('returns null for undefined input', () => {
      expect(calculateAge(undefined)).toBe(null);
    });

    it('returns null for invalid date string', () => {
      expect(calculateAge('invalid-date')).toBe(null);
    });

    it('returns null for future dates', () => {
      const futureDate = '2030-01-01';
      expect(calculateAge(futureDate)).toBe(null);
    });

    it('handles edge case: born today', () => {
      const today = '2025-10-22';
      expect(calculateAge(today)).toBe(0);
    });

    it('handles edge case: born yesterday', () => {
      const yesterday = '2025-10-21';
      expect(calculateAge(yesterday)).toBe(0);
    });

    it('calculates age for someone born on leap day', () => {
      const leapDay = '2000-02-29';
      const age = calculateAge(leapDay);
      expect(age).toBe(25);
    });
  });

  describe('isAdult', () => {
    it('returns true for someone 18 years old', () => {
      const birthDate = '2007-10-22';
      expect(isAdult(birthDate)).toBe(true);
    });

    it('returns true for someone older than 18', () => {
      const birthDate = '1990-01-01';
      expect(isAdult(birthDate)).toBe(true);
    });

    it('returns false for someone younger than 18', () => {
      const birthDate = '2010-01-01';
      expect(isAdult(birthDate)).toBe(false);
    });

    it('returns false for someone turning 18 later this year', () => {
      const birthDate = '2007-12-31'; // Will turn 18 in December
      expect(isAdult(birthDate)).toBe(false);
    });

    it('returns false for null input', () => {
      expect(isAdult(null)).toBe(false);
    });

    it('returns false for undefined input', () => {
      expect(isAdult(undefined)).toBe(false);
    });

    it('returns false for invalid date', () => {
      expect(isAdult('invalid-date')).toBe(false);
    });

    it('handles Date object as input', () => {
      const birthDate = new Date('1990-01-01');
      expect(isAdult(birthDate)).toBe(true);
    });
  });

  describe('isMinor', () => {
    it('returns true for someone younger than 18', () => {
      const birthDate = '2010-01-01';
      expect(isMinor(birthDate)).toBe(true);
    });

    it('returns false for someone 18 years old', () => {
      const birthDate = '2007-10-22';
      expect(isMinor(birthDate)).toBe(false);
    });

    it('returns false for someone older than 18', () => {
      const birthDate = '1990-01-01';
      expect(isMinor(birthDate)).toBe(false);
    });

    it('returns true for someone turning 18 later this year', () => {
      const birthDate = '2007-12-31'; // Will turn 18 in December
      expect(isMinor(birthDate)).toBe(true);
    });

    it('returns false for null input', () => {
      expect(isMinor(null)).toBe(false);
    });

    it('returns false for undefined input', () => {
      expect(isMinor(undefined)).toBe(false);
    });

    it('returns false for invalid date', () => {
      expect(isMinor('invalid-date')).toBe(false);
    });

    it('handles edge case: 17 years and 364 days old', () => {
      const birthDate = '2007-10-23'; // One day after mock today
      expect(isMinor(birthDate)).toBe(true);
    });

    it('handles Date object as input', () => {
      const birthDate = new Date('2010-01-01');
      expect(isMinor(birthDate)).toBe(true);
    });
  });
});
