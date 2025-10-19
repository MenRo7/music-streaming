import React, { createContext, useContext, ReactNode } from 'react';
import { useDialog, ToastType, DialogVariant } from '../hooks/useDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

interface DialogContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    variant?: DialogVariant,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast, confirmDialog, showToast, hideToast, showConfirm, hideConfirm } = useDialog();

  return (
    <DialogContext.Provider value={{ showToast, showConfirm }}>
      {children}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={hideConfirm}
        variant={confirmDialog.variant}
      />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </DialogContext.Provider>
  );
};

export const useDialogContext = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialogContext must be used within a DialogProvider');
  }
  return context;
};
