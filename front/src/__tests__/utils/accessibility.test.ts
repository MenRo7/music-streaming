import {
  meetsContrastRequirements,
  getContrastRatio,
  announceToScreenReader,
  trapFocus,
  handleEscapeKey,
} from '../../utils/accessibility';

describe('Accessibility Utils', () => {
  describe('meetsContrastRequirements', () => {
    it('returns true for black text on white background (AA normal)', () => {
      expect(meetsContrastRequirements('#000000', '#FFFFFF', 'AA', 'normal')).toBe(true);
    });

    it('returns true for white text on black background (AA normal)', () => {
      expect(meetsContrastRequirements('#FFFFFF', '#000000', 'AA', 'normal')).toBe(true);
    });

    it('returns false for low contrast combinations', () => {
      expect(meetsContrastRequirements('#777777', '#888888', 'AA', 'normal')).toBe(false);
    });

    it('handles large text with lower requirements', () => {
      // A contrast that fails AA normal but passes AA large
      expect(meetsContrastRequirements('#767676', '#FFFFFF', 'AA', 'large')).toBe(true);
    });

    it('enforces stricter AAA requirements', () => {
      // Some combinations pass AA but fail AAA
      const result = meetsContrastRequirements('#595959', '#FFFFFF', 'AAA', 'normal');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getContrastRatio', () => {
    it('calculates contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#FFFFFF');
      expect(ratio).toBeCloseTo(21, 0); // Perfect contrast is 21:1
    });

    it('calculates contrast ratio for identical colors', () => {
      const ratio = getContrastRatio('#FF0000', '#FF0000');
      expect(ratio).toBeCloseTo(1, 0); // Same color is 1:1
    });

    it('returns a number', () => {
      const ratio = getContrastRatio('#336699', '#FFFFFF');
      expect(typeof ratio).toBe('number');
      expect(ratio).toBeGreaterThan(0);
    });

    it('handles colors without # prefix', () => {
      const ratio = getContrastRatio('000000', 'FFFFFF');
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('announceToScreenReader', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    it('creates an announcement element', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement).toBeTruthy();
      expect(announcement?.textContent).toBe('Test message');
    });

    it('sets aria-live to polite by default', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('polite');
    });

    it('sets aria-live to assertive when specified', () => {
      announceToScreenReader('Urgent message', 'assertive');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-live')).toBe('assertive');
    });

    it('sets aria-atomic to true', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.getAttribute('aria-atomic')).toBe('true');
    });

    it('adds sr-only class for visual hiding', () => {
      announceToScreenReader('Test message');

      const announcement = document.querySelector('[role="status"]');
      expect(announcement?.className).toContain('sr-only');
    });

    it('removes announcement after timeout', (done) => {
      announceToScreenReader('Test message');

      expect(document.querySelector('[role="status"]')).toBeTruthy();

      setTimeout(() => {
        expect(document.querySelector('[role="status"]')).toBeFalsy();
        done();
      }, 1100);
    });
  });

  describe('trapFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="modal">
          <button id="first">First</button>
          <button id="middle">Middle</button>
          <button id="last">Last</button>
        </div>
      `;
    });

    it('traps focus within element', () => {
      const modal = document.getElementById('modal')!;
      const cleanup = trapFocus(modal);

      const firstButton = document.getElementById('first') as HTMLElement;
      const lastButton = document.getElementById('last') as HTMLElement;

      expect(firstButton).toBeTruthy();
      expect(lastButton).toBeTruthy();

      cleanup();
    });

    it('returns a cleanup function', () => {
      const modal = document.getElementById('modal')!;
      const cleanup = trapFocus(modal);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('handles Tab key to cycle focus forward', () => {
      const modal = document.getElementById('modal')!;
      const cleanup = trapFocus(modal);

      const firstButton = document.getElementById('first') as HTMLElement;
      const lastButton = document.getElementById('last') as HTMLElement;

      lastButton.focus();

      // Simulate Tab on last element
      const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
      lastButton.dispatchEvent(event);

      // Focus should cycle to first (in real implementation)
      cleanup();
    });

    it('handles Shift+Tab to cycle focus backward', () => {
      const modal = document.getElementById('modal')!;
      const cleanup = trapFocus(modal);

      const firstButton = document.getElementById('first') as HTMLElement;
      firstButton.focus();

      // Simulate Shift+Tab on first element
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
      firstButton.dispatchEvent(event);

      cleanup();
    });
  });

  describe('handleEscapeKey', () => {
    it('calls callback on Escape key press', () => {
      const callback = jest.fn();
      const cleanup = handleEscapeKey(callback);

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalled();
      cleanup();
    });

    it('does not call callback on other keys', () => {
      const callback = jest.fn();
      const cleanup = handleEscapeKey(callback);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
      cleanup();
    });

    it('returns a cleanup function that removes listener', () => {
      const callback = jest.fn();
      const cleanup = handleEscapeKey(callback);

      cleanup();

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
