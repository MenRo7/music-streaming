import { renderHook, act } from '@testing-library/react';
import { useDialog } from '../../hooks/useDialog';

describe('useDialog', () => {
  it('initializes with toast closed', () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.toast.isOpen).toBe(false);
    expect(result.current.toast.message).toBe('');
    expect(result.current.toast.type).toBe('info');
  });

  it('initializes with confirm dialog closed', () => {
    const { result } = renderHook(() => useDialog());

    expect(result.current.confirmDialog.isOpen).toBe(false);
    expect(result.current.confirmDialog.title).toBe('');
    expect(result.current.confirmDialog.message).toBe('');
  });

  it('shows toast with info type by default', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toast.isOpen).toBe(true);
    expect(result.current.toast.message).toBe('Test message');
    expect(result.current.toast.type).toBe('info');
  });

  it('shows toast with custom type', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Error message', 'error');
    });

    expect(result.current.toast.isOpen).toBe(true);
    expect(result.current.toast.message).toBe('Error message');
    expect(result.current.toast.type).toBe('error');
  });

  it('shows toast with success type', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Success message', 'success');
    });

    expect(result.current.toast.type).toBe('success');
  });

  it('shows toast with warning type', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Warning message', 'warning');
    });

    expect(result.current.toast.type).toBe('warning');
  });

  it('hides toast', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Test message');
    });

    expect(result.current.toast.isOpen).toBe(true);

    act(() => {
      result.current.hideToast();
    });

    expect(result.current.toast.isOpen).toBe(false);
    expect(result.current.toast.message).toBe('Test message'); // Message persists
  });

  it('shows confirm dialog with default values', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Title', 'Message', onConfirm);
    });

    expect(result.current.confirmDialog.isOpen).toBe(true);
    expect(result.current.confirmDialog.title).toBe('Title');
    expect(result.current.confirmDialog.message).toBe('Message');
    expect(result.current.confirmDialog.variant).toBe('info');
    expect(result.current.confirmDialog.confirmText).toBe('Confirm');
    expect(result.current.confirmDialog.cancelText).toBe('Cancel');
  });

  it('shows confirm dialog with custom variant', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Delete', 'Are you sure?', onConfirm, 'danger');
    });

    expect(result.current.confirmDialog.variant).toBe('danger');
  });

  it('shows confirm dialog with custom button text', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm(
        'Delete',
        'Are you sure?',
        onConfirm,
        'danger',
        'Delete',
        'Keep'
      );
    });

    expect(result.current.confirmDialog.confirmText).toBe('Delete');
    expect(result.current.confirmDialog.cancelText).toBe('Keep');
  });

  it('calls onConfirm when confirmed', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Title', 'Message', onConfirm);
    });

    expect(result.current.confirmDialog.isOpen).toBe(true);

    act(() => {
      result.current.confirmDialog.onConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('closes dialog after confirming', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Title', 'Message', onConfirm);
    });

    expect(result.current.confirmDialog.isOpen).toBe(true);

    act(() => {
      result.current.confirmDialog.onConfirm();
    });

    expect(result.current.confirmDialog.isOpen).toBe(false);
  });

  it('hides confirm dialog without calling onConfirm', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Title', 'Message', onConfirm);
    });

    expect(result.current.confirmDialog.isOpen).toBe(true);

    act(() => {
      result.current.hideConfirm();
    });

    expect(result.current.confirmDialog.isOpen).toBe(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('can show multiple toasts sequentially', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('First message', 'info');
    });

    expect(result.current.toast.message).toBe('First message');
    expect(result.current.toast.type).toBe('info');

    act(() => {
      result.current.showToast('Second message', 'error');
    });

    expect(result.current.toast.message).toBe('Second message');
    expect(result.current.toast.type).toBe('error');
  });

  it('can show multiple confirm dialogs sequentially', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm1 = jest.fn();
    const onConfirm2 = jest.fn();

    act(() => {
      result.current.showConfirm('Title 1', 'Message 1', onConfirm1);
    });

    expect(result.current.confirmDialog.title).toBe('Title 1');

    act(() => {
      result.current.confirmDialog.onConfirm();
    });

    act(() => {
      result.current.showConfirm('Title 2', 'Message 2', onConfirm2);
    });

    expect(result.current.confirmDialog.title).toBe('Title 2');
    expect(onConfirm1).toHaveBeenCalledTimes(1);
  });

  it('handles empty toast message', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('');
    });

    expect(result.current.toast.message).toBe('');
    expect(result.current.toast.isOpen).toBe(true);
  });

  it('handles empty confirm dialog messages', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('', '', onConfirm);
    });

    expect(result.current.confirmDialog.title).toBe('');
    expect(result.current.confirmDialog.message).toBe('');
    expect(result.current.confirmDialog.isOpen).toBe(true);
  });

  it('preserves toast message after hiding', () => {
    const { result } = renderHook(() => useDialog());

    act(() => {
      result.current.showToast('Persistent message', 'success');
    });

    act(() => {
      result.current.hideToast();
    });

    expect(result.current.toast.message).toBe('Persistent message');
    expect(result.current.toast.type).toBe('success');
    expect(result.current.toast.isOpen).toBe(false);
  });

  it('handles warning variant for confirm dialog', () => {
    const { result } = renderHook(() => useDialog());
    const onConfirm = jest.fn();

    act(() => {
      result.current.showConfirm('Warning', 'Proceed?', onConfirm, 'warning');
    });

    expect(result.current.confirmDialog.variant).toBe('warning');
  });
});
