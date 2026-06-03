import React, { createContext, useContext, useState, useCallback } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfig({
        ...options,
        open: true,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (config) {
      config.resolve(true);
      setConfig(null);
    }
  }, [config]);

  const handleCancel = useCallback(() => {
    if (config) {
      config.resolve(false);
      setConfig(null);
    }
  }, [config]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {config && (
        <ConfirmDialog
          open={config.open}
          title={config.title}
          description={config.description}
          confirmText={config.confirmText}
          cancelText={config.cancelText}
          variant={config.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </ConfirmContext.Provider>
  );
};
