import { useState, useCallback, useEffect } from 'react';

// ─── Single Toast Item ────────────────────────────────────────────────────────
const ToastItem = ({ id, type, message, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type] || icons.info}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => onRemove(id)}>✕</button>
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────
let toastListenerFn = null;

export const toast = {
  success: (msg) => toastListenerFn?.({ type: 'success', message: msg }),
  error: (msg) => toastListenerFn?.({ type: 'error', message: msg }),
  warning: (msg) => toastListenerFn?.({ type: 'warning', message: msg }),
  info: (msg) => toastListenerFn?.({ type: 'info', message: msg }),
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    toastListenerFn = addToast;
    return () => { toastListenerFn = null; };
  }, [addToast]);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={removeToast} />
      ))}
    </div>
  );
};
