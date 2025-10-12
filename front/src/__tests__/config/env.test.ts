import ENV from '../../config/env';

describe('Environment Configuration', () => {
  it('should have API_URL defined', () => {
    expect(ENV.API_URL).toBeDefined();
    expect(typeof ENV.API_URL).toBe('string');
  });

  it('should have STRIPE_PUBLISHABLE_KEY defined', () => {
    expect(ENV.STRIPE_PUBLISHABLE_KEY).toBeDefined();
  });

  it('should provide default API_URL if not set', () => {
    expect(ENV.API_URL).toMatch(/^http/);
  });

  it('should be immutable', () => {
    expect(() => {
      // @ts-expect-error Testing immutability
      ENV.API_URL = 'new-value';
    }).toThrow();
  });
});
