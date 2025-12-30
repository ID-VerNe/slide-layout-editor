import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal';

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface UIContextType {
  alert: (title: string, message: string) => void;
  confirm: (title: string, message: string, onConfirm: () => void, options?: { confirmText?: string, cancelText?: string }) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert'
  });

  const alert = useCallback((title: string, message: string) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'alert'
    });
  }, []);

  const confirm = useCallback((title: string, message: string, onConfirm: () => void, options = {}) => {
    setModal({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm,
      ...options
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <UIContext.Provider value={{ alert, confirm }}>
      {children}
      <Modal 
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
      />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within a UIProvider');
  return context;
};
