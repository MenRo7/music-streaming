/**
 * Environment configuration
 * Centralizes all environment variables with validation
 */

export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
  STRIPE_PUBLISHABLE_KEY: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '',
} as const;

// Validate required environment variables
const validateEnv = () => {
  const required = {
    STRIPE_PUBLISHABLE_KEY: ENV.STRIPE_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file.'
    );
  }
};

validateEnv();

export default ENV;
