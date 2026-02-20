/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import '../../styles/Toast.css';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((options) => {
    const { message, type = 'info', duration = 4000 } =
      typeof options === 'string' ? { message: options } : options;

    const id = Date.now() + Math.random();

    setToasts((current) => [
      ...current,
      { id, message, type, duration },
    ]);
  }, []);

  useEffect(() => {
    if (!toasts.length) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), toast.duration || 4000)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

export default ToastProvider;
