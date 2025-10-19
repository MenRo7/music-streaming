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

  it('should have expected environment values', () => {
    // Test that ENV object exists and has the expected properties
    expect(ENV).toHaveProperty('API_URL');
    expect(ENV).toHaveProperty('STRIPE_PUBLISHABLE_KEY');
  });
});
