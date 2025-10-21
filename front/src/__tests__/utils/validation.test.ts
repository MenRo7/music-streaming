import {
  isValidEmail,
  validatePasswordStrength,
  validateField,
  validateForm,
  commonValidationRules,
  sanitizeInput,
  formatValidationErrors,
  ValidationRule,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('SecurePass123!');
      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.issues).toHaveLength(0);
    });

    it('should identify weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should detect missing uppercase letters', () => {
      const result = validatePasswordStrength('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one uppercase letter');
    });

    it('should detect missing lowercase letters', () => {
      const result = validatePasswordStrength('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one lowercase letter');
    });

    it('should detect missing numbers', () => {
      const result = validatePasswordStrength('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one number');
    });

    it('should detect missing special characters', () => {
      const result = validatePasswordStrength('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(
        'Password must contain at least one special character (!@#$%^&*)'
      );
    });

    it('should detect passwords that are too short', () => {
      const result = validatePasswordStrength('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Password must be at least 8 characters long');
    });

    it('should identify medium strength passwords', () => {
      const result = validatePasswordStrength('mediumpass'); // only lowercase, no numbers, no special
      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('medium');
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const rules: ValidationRule = { required: true };

      expect(validateField('name', '', rules)).toBe('name is required');
      expect(validateField('name', null, rules)).toBe('name is required');
      expect(validateField('name', undefined, rules)).toBe('name is required');
      expect(validateField('name', [], rules)).toBe('name is required');
      expect(validateField('name', 'value', rules)).toBeNull();
    });

    it('should use custom required message', () => {
      const rules: ValidationRule = { required: 'Custom error message' };

      expect(validateField('name', '', rules)).toBe('Custom error message');
    });

    it('should skip validation for empty optional fields', () => {
      const rules: ValidationRule = {
        minLength: { value: 5, message: 'Too short' },
      };

      expect(validateField('name', '', rules)).toBeNull();
      expect(validateField('name', null, rules)).toBeNull();
    });

    it('should validate minimum length', () => {
      const rules: ValidationRule = {
        minLength: { value: 5, message: 'Must be at least 5 characters' },
      };

      expect(validateField('name', 'abc', rules)).toBe('Must be at least 5 characters');
      expect(validateField('name', 'abcde', rules)).toBeNull();
      expect(validateField('name', 'abcdef', rules)).toBeNull();
    });

    it('should validate maximum length', () => {
      const rules: ValidationRule = {
        maxLength: { value: 10, message: 'Must not exceed 10 characters' },
      };

      expect(validateField('name', '12345678901', rules)).toBe('Must not exceed 10 characters');
      expect(validateField('name', '1234567890', rules)).toBeNull();
      expect(validateField('name', '123', rules)).toBeNull();
    });

    it('should validate pattern', () => {
      const rules: ValidationRule = {
        pattern: { value: /^[a-z]+$/, message: 'Must contain only lowercase letters' },
      };

      expect(validateField('name', 'ABC', rules)).toBe('Must contain only lowercase letters');
      expect(validateField('name', 'abc123', rules)).toBe('Must contain only lowercase letters');
      expect(validateField('name', 'abc', rules)).toBeNull();
    });

    it('should validate minimum value', () => {
      const rules: ValidationRule = {
        min: { value: 18, message: 'Must be at least 18' },
      };

      expect(validateField('age', 17, rules)).toBe('Must be at least 18');
      expect(validateField('age', 18, rules)).toBeNull();
      expect(validateField('age', 25, rules)).toBeNull();
    });

    it('should validate maximum value', () => {
      const rules: ValidationRule = {
        max: { value: 100, message: 'Must not exceed 100' },
      };

      expect(validateField('age', 101, rules)).toBe('Must not exceed 100');
      expect(validateField('age', 100, rules)).toBeNull();
      expect(validateField('age', 50, rules)).toBeNull();
    });

    it('should validate custom rules with boolean return', () => {
      const rules: ValidationRule = {
        custom: {
          validate: (value) => value === 'valid',
        },
      };

      expect(validateField('field', 'invalid', rules)).toBe('field is invalid');
      expect(validateField('field', 'valid', rules)).toBeNull();
    });

    it('should validate custom rules with string return', () => {
      const rules: ValidationRule = {
        custom: {
          validate: (value) => (value === 'valid' ? true : 'Custom error message'),
        },
      };

      expect(validateField('field', 'invalid', rules)).toBe('Custom error message');
      expect(validateField('field', 'valid', rules)).toBeNull();
    });

    it('should apply multiple validations in order', () => {
      const rules: ValidationRule = {
        required: true,
        minLength: { value: 5, message: 'Too short' },
        pattern: { value: /^[a-z]+$/, message: 'Lowercase only' },
      };

      // Required check first
      expect(validateField('name', '', rules)).toBe('name is required');

      // Then min length
      expect(validateField('name', 'abc', rules)).toBe('Too short');

      // Then pattern
      expect(validateField('name', 'ABC12', rules)).toBe('Lowercase only');

      // All pass
      expect(validateField('name', 'abcde', rules)).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('should validate entire form and return all errors', () => {
      const data = {
        email: 'invalid',
        password: 'short',
        age: 10,
      };

      const rules = {
        email: commonValidationRules.email,
        password: commonValidationRules.password,
        age: commonValidationRules.age,
      };

      const result = validateForm(data, rules);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.password).toBe('Password must be at least 8 characters long');
      expect(result.errors.age).toBe('You must be at least 13 years old');
    });

    it('should return isValid true when all fields are valid', () => {
      const data = {
        email: 'test@example.com',
        password: 'ValidPass123',
        age: 25,
      };

      const rules = {
        email: commonValidationRules.email,
        password: commonValidationRules.password,
        age: commonValidationRules.age,
      };

      const result = validateForm(data, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should validate only specified fields', () => {
      const data = {
        email: 'test@example.com',
        password: 'short', // invalid but not checked
      };

      const rules = {
        email: commonValidationRules.email,
        // password not in rules
      };

      const result = validateForm(data, rules);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });
  });

  describe('commonValidationRules', () => {
    it('should provide email validation rule', () => {
      const result = validateField('email', 'invalid', commonValidationRules.email);
      expect(result).toBe('Please enter a valid email address');
    });

    it('should provide password validation rule', () => {
      const result = validateField('password', 'short', commonValidationRules.password);
      expect(result).toBe('Password must be at least 8 characters long');
    });

    it('should provide password confirmation rule', () => {
      const rules = commonValidationRules.passwordConfirm('password123');
      const result = validateField('confirm', 'different', rules);
      expect(result).toBe('Passwords do not match');

      const validResult = validateField('confirm', 'password123', rules);
      expect(validResult).toBeNull();
    });

    it('should provide username validation rule', () => {
      // Too short
      expect(validateField('username', 'ab', commonValidationRules.username)).toBe(
        'Username must be at least 3 characters long'
      );

      // Too long
      expect(validateField('username', 'a'.repeat(21), commonValidationRules.username)).toBe(
        'Username must not exceed 20 characters'
      );

      // Invalid characters
      expect(validateField('username', 'user@name', commonValidationRules.username)).toBe(
        'Username can only contain letters, numbers, underscores, and hyphens'
      );

      // Valid
      expect(validateField('username', 'user_name-123', commonValidationRules.username)).toBeNull();
    });

    it('should provide age validation rule', () => {
      expect(validateField('age', 12, commonValidationRules.age)).toBe(
        'You must be at least 13 years old'
      );
      expect(validateField('age', 121, commonValidationRules.age)).toBe('Please enter a valid age');
      expect(validateField('age', 25, commonValidationRules.age)).toBeNull();
    });

    it('should provide URL validation rule', () => {
      expect(validateField('url', 'not-a-url', commonValidationRules.url)).toBe(
        'Please enter a valid URL'
      );
      expect(validateField('url', 'https://example.com', commonValidationRules.url)).toBeNull();
      expect(validateField('url', 'http://example.com', commonValidationRules.url)).toBeNull();
    });

    it('should provide phone number validation rule', () => {
      expect(validateField('phone', 'invalid', commonValidationRules.phoneNumber)).toBe(
        'Please enter a valid phone number'
      );
      expect(validateField('phone', '123-456-7890', commonValidationRules.phoneNumber)).toBeNull();
      expect(validateField('phone', '(123) 456-7890', commonValidationRules.phoneNumber)).toBeNull();
      expect(validateField('phone', '+1234567890', commonValidationRules.phoneNumber)).toBeNull();
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert("xss")&lt;/script&gt;'
      );
      expect(sanitizeInput('<b>Bold</b>')).toBe('&lt;b&gt;Bold&lt;/b&gt;');
    });

    it('should keep regular text unchanged', () => {
      expect(sanitizeInput('Normal text')).toBe('Normal text');
      expect(sanitizeInput('Text with numbers 123')).toBe('Text with numbers 123');
    });

    it('should handle special characters', () => {
      expect(sanitizeInput('Text & more')).toBe('Text &amp; more');
      expect(sanitizeInput('Price: $100')).toBe('Price: $100');
    });
  });

  describe('formatValidationErrors', () => {
    it('should format multiple errors as a single string', () => {
      const errors = {
        email: 'Invalid email',
        password: 'Password too short',
        age: 'Must be 18+',
      };

      const result = formatValidationErrors(errors);

      expect(result).toBe('Invalid email. Password too short. Must be 18+');
    });

    it('should handle single error', () => {
      const errors = {
        email: 'Invalid email',
      };

      const result = formatValidationErrors(errors);

      expect(result).toBe('Invalid email');
    });

    it('should handle empty errors', () => {
      const errors = {};

      const result = formatValidationErrors(errors);

      expect(result).toBe('');
    });
  });
});
