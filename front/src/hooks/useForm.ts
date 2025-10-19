import { useState, useCallback, ChangeEvent } from 'react';
import { validateField, validateForm, ValidationRule, ValidationResult } from '../utils/validation';

/**
 * Form state interface
 */
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * useForm hook options
 */
interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule>>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Custom hook for form management with validation
 *
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationRules: {
 *     email: commonValidationRules.email,
 *     password: commonValidationRules.password,
 *   },
 *   onSubmit: async (values) => {
 *     await loginUser(values);
 *   },
 * });
 */
export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormOptions<T>) => {
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  });

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;

      // Handle checkbox separately
      const fieldValue =
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

      setState((prev) => {
        const newValues = {
          ...prev.values,
          [fieldName]: fieldValue,
        };

        // Validate field if validateOnChange is enabled
        let newErrors = { ...prev.errors };
        if (validateOnChange && validationRules[fieldName]) {
          const error = validateField(
            String(fieldName),
            fieldValue,
            validationRules[fieldName]!
          );
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
        }

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateOnChange, validationRules]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;

      setState((prev) => {
        const newTouched = {
          ...prev.touched,
          [fieldName]: true,
        };

        // Validate field if validateOnBlur is enabled
        let newErrors = { ...prev.errors };
        if (validateOnBlur && validationRules[fieldName]) {
          const error = validateField(
            String(fieldName),
            prev.values[fieldName],
            validationRules[fieldName]!
          );
          if (error) {
            newErrors[fieldName] = error;
          } else {
            delete newErrors[fieldName];
          }
        }

        return {
          ...prev,
          touched: newTouched,
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });
    },
    [validateOnBlur, validationRules]
  );

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback(
    (fieldName: keyof T, value: any) => {
      setState((prev) => ({
        ...prev,
        values: {
          ...prev.values,
          [fieldName]: value,
        },
      }));
    },
    []
  );

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((fieldName: keyof T, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: error,
      },
      isValid: false,
    }));
  }, []);

  /**
   * Touch field programmatically
   */
  const setFieldTouched = useCallback(
    (fieldName: keyof T, touched: boolean = true) => {
      setState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [fieldName]: touched,
        },
      }));
    },
    []
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback((): ValidationResult => {
    const result = validateForm(
      state.values,
      validationRules as Record<string, ValidationRule>
    );

    setState((prev) => ({
      ...prev,
      errors: result.errors as Partial<Record<keyof T, string>>,
      isValid: result.isValid,
    }));

    return result;
  }, [state.values, validationRules]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault();
      }

      // Validate all fields
      const validation = validateAllFields();

      // Mark all fields as touched
      setState((prev) => {
        const allTouched = Object.keys(prev.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof T, boolean>>
        );

        return {
          ...prev,
          touched: allTouched,
        };
      });

      // If validation fails, don't submit
      if (!validation.isValid) {
        return;
      }

      // Set submitting state
      setState((prev) => ({ ...prev, isSubmitting: true }));

      try {
        await onSubmit(state.values);
        // Optionally reset form after successful submission
        // resetForm();
      } catch (error) {
        console.error('Form submission error:', error);
        // Handle submission errors
      } finally {
        setState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [state.values, validateAllFields, onSubmit]
  );

  /**
   * Get field props for easy spreading
   */
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      name: String(fieldName),
      value: state.values[fieldName] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': !!state.errors[fieldName],
      'aria-describedby': state.errors[fieldName]
        ? `${String(fieldName)}-error`
        : undefined,
    }),
    [state.values, state.errors, handleChange, handleBlur]
  );

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,

    // Utilities
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateAllFields,
    getFieldProps,
  };
};

export default useForm;
