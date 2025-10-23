import { renderHook, act } from '@testing-library/react';
import useForm from '../../hooks/useForm';
import { ValidationRule } from '../../utils/validation';

describe('useForm', () => {
  it('initializes with provided values', () => {
    const initialValues = { email: 'test@example.com', password: '' };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validationRules: {},
        onSubmit: jest.fn(),
      })
    );

    expect(result.current.values).toEqual(initialValues);
  });

  it('updates values on change', () => {
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        validationRules: {},
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleChange('email', 'new@example.com');
    });

    expect(result.current.values.email).toBe('new@example.com');
  });

  it('validates required fields', () => {
    const rules: Record<string, ValidationRule> = {
      email: {
        required: true,
        message: 'Email is required',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Email is required');
  });

  it('validates email format', () => {
    const rules: Record<string, ValidationRule> = {
      email: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'invalid-email' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('email');
    });

    expect(result.current.errors.email).toBe('Invalid email');
  });

  it('validates minimum length', () => {
    const rules: Record<string, ValidationRule> = {
      password: {
        required: true,
        minLength: 8,
        message: 'Password too short',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: 'short' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBe('Password too short');
  });

  it('validates maximum length', () => {
    const rules: Record<string, ValidationRule> = {
      username: {
        required: true,
        maxLength: 10,
        message: 'Username too long',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { username: 'verylongusername' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('username');
    });

    expect(result.current.errors.username).toBe('Username too long');
  });

  it('uses custom validation function', () => {
    const rules: Record<string, ValidationRule> = {
      age: {
        required: true,
        validate: (value: any) => {
          const age = parseInt(value);
          return age >= 18 || 'Must be 18 or older';
        },
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { age: '16' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('age');
    });

    expect(result.current.errors.age).toBe('Must be 18 or older');
  });

  it('clears errors when field becomes valid', () => {
    const rules: Record<string, ValidationRule> = {
      email: {
        required: true,
        message: 'Required',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    // Trigger error
    act(() => {
      result.current.handleBlur('email');
    });
    expect(result.current.errors.email).toBe('Required');

    // Fix error
    act(() => {
      result.current.handleChange('email', 'valid@example.com');
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('calls onSubmit with values when form is valid', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        validationRules: {},
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });

  it('does not call onSubmit when form has errors', async () => {
    const onSubmit = jest.fn();

    const rules: Record<string, ValidationRule> = {
      email: {
        required: true,
        message: 'Required',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '' },
        validationRules: rules,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.errors.email).toBe('Required');
  });

  it('sets isSubmitting during form submission', async () => {
    const onSubmit = jest.fn(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        validationRules: {},
        onSubmit,
      })
    );

    expect(result.current.isSubmitting).toBe(false);

    const submitPromise = act(async () => {
      await result.current.handleSubmit();
    });

    // During submission
    expect(result.current.isSubmitting).toBe(true);

    await submitPromise;

    // After submission
    expect(result.current.isSubmitting).toBe(false);
  });

  it('handles submission errors', async () => {
    const error = new Error('Submission failed');
    const onSubmit = jest.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'test@example.com' },
        validationRules: {},
        onSubmit,
      })
    );

    await act(async () => {
      try {
        await result.current.handleSubmit();
      } catch (e) {
        // Error should be thrown
        expect(e).toBe(error);
      }
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  it('validates all fields on submit', async () => {
    const rules: Record<string, ValidationRule> = {
      email: {
        required: true,
        message: 'Email required',
      },
      password: {
        required: true,
        message: 'Password required',
      },
    };

    const onSubmit = jest.fn();

    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: '' },
        validationRules: rules,
        onSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.errors.email).toBe('Email required');
    expect(result.current.errors.password).toBe('Password required');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('handles multiple validation rules', () => {
    const rules: Record<string, ValidationRule> = {
      password: {
        required: true,
        minLength: 8,
        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        message: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      },
    };

    const { result } = renderHook(() =>
      useForm({
        initialValues: { password: 'weak' },
        validationRules: rules,
        onSubmit: jest.fn(),
      })
    );

    act(() => {
      result.current.handleBlur('password');
    });

    expect(result.current.errors.password).toBeDefined();
  });

  it('resets form to initial values', () => {
    const initialValues = { email: 'initial@example.com', password: '' };

    const { result } = renderHook(() =>
      useForm({
        initialValues,
        validationRules: {},
        onSubmit: jest.fn(),
      })
    );

    // Change values
    act(() => {
      result.current.handleChange('email', 'changed@example.com');
      result.current.handleChange('password', 'newpassword');
    });

    expect(result.current.values.email).toBe('changed@example.com');
    expect(result.current.values.password).toBe('newpassword');

    // Reset
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });
});
