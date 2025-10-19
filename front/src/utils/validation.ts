/**
 * Form Validation Utilities
 * Provides comprehensive form validation with user-friendly error messages
 */

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  custom?: {
    validate: (value: any) => boolean | string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  issues: string[];
} => {
  const issues: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    issues.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    issues.push('Password must contain at least one special character (!@#$%^&*)');
  }

  // Calculate strength
  const criteriaMetCount = 5 - issues.length;
  if (criteriaMetCount >= 4) strength = 'strong';
  else if (criteriaMetCount >= 2) strength = 'medium';

  return {
    isValid: issues.length === 0,
    strength,
    issues,
  };
};

/**
 * Validate a single field
 */
export const validateField = (
  name: string,
  value: any,
  rules: ValidationRule
): string | null => {
  // Required validation
  if (rules.required) {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (isEmpty) {
      return typeof rules.required === 'string'
        ? rules.required
        : `${name} is required`;
    }
  }

  // If value is empty and not required, skip other validations
  if (!value && !rules.required) {
    return null;
  }

  // Min length validation
  if (rules.minLength && String(value).length < rules.minLength.value) {
    return rules.minLength.message;
  }

  // Max length validation
  if (rules.maxLength && String(value).length > rules.maxLength.value) {
    return rules.maxLength.message;
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.value.test(String(value))) {
    return rules.pattern.message;
  }

  // Min value validation
  if (rules.min && Number(value) < rules.min.value) {
    return rules.min.message;
  }

  // Max value validation
  if (rules.max && Number(value) > rules.max.value) {
    return rules.max.message;
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom.validate(value);
    if (typeof result === 'string') {
      return result;
    }
    if (result === false) {
      return `${name} is invalid`;
    }
  }

  return null;
};

/**
 * Validate entire form
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, ValidationRule>
): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach((fieldName) => {
    const error = validateField(fieldName, data[fieldName], rules[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Common validation rules
 */
export const commonValidationRules = {
  email: {
    required: 'Email is required',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters long',
    },
  },
  passwordConfirm: (password: string) => ({
    required: 'Please confirm your password',
    custom: {
      validate: (value: string) =>
        value === password || 'Passwords do not match',
    },
  }),
  username: {
    required: 'Username is required',
    minLength: {
      value: 3,
      message: 'Username must be at least 3 characters long',
    },
    maxLength: {
      value: 20,
      message: 'Username must not exceed 20 characters',
    },
    pattern: {
      value: /^[a-zA-Z0-9_-]+$/,
      message: 'Username can only contain letters, numbers, underscores, and hyphens',
    },
  },
  age: {
    required: 'Age is required',
    min: {
      value: 13,
      message: 'You must be at least 13 years old',
    },
    max: {
      value: 120,
      message: 'Please enter a valid age',
    },
  },
  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: 'Please enter a valid URL',
    },
  },
  phoneNumber: {
    pattern: {
      value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
      message: 'Please enter a valid phone number',
    },
  },
} as const;

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors: Record<string, string>): string => {
  return Object.values(errors).join('. ');
};
