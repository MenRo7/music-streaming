import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type DialogVariant = 'danger' | 'warning' | 'info';

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  variant: DialogVariant;
}

export const useDialog = () => {
  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    message: '',
    type: 'info',
  });

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    onConfirm: () => {},
    variant: 'info',
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ isOpen: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const showConfirm = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      variant: DialogVariant = 'info',
      confirmText: string = 'Confirm',
      cancelText: string = 'Cancel'
    ) => {
      setConfirmDialog({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        onConfirm: () => {
          onConfirm();
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        },
        variant,
      });
    },
    []
  );

  const hideConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    toast,
    confirmDialog,
    showToast,
    hideToast,
    showConfirm,
    hideConfirm,
  };
};
