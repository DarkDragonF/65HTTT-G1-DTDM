import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null); // { title, message, resolve }

  // 1. Toast logic
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 350); // Add a small buffer for the fadeOut animation to finish
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 2. Promise-based Confirm Modal logic
  const confirm = useCallback((title, message) => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        resolve,
      });
    });
  }, []);

  const handleConfirmResponse = (value) => {
    if (confirmState?.resolve) {
      confirmState.resolve(value);
    }
    setConfirmState(null);
  };

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return '✔️';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <NotificationContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Global Toasts Render Wrapper */}
      {toasts.length > 0 && (
        <div className="toast-container-global">
          {toasts.map((t) => (
            <div 
              key={t.id} 
              className={`toast-message-card ${t.type}`}
              style={{ '--toast-delay': `${t.duration / 1000}s` }}
            >
              <span className="toast-card-icon">{getToastIcon(t.type)}</span>
              <span className="toast-card-text">{t.message}</span>
              <button 
                className="toast-card-close" 
                onClick={() => removeToast(t.id)}
                aria-label="Close notification"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Custom Promise-based Confirmation Dialog Modal */}
      {confirmState && (
        <div className="confirm-overlay-global" onClick={() => handleConfirmResponse(false)}>
          <div className="confirm-card-global" onClick={(e) => e.stopPropagation()}>
            <h4 className="confirm-card-title">{confirmState.title || 'Are you sure?'}</h4>
            <p className="confirm-card-msg">{confirmState.message}</p>
            <div className="confirm-card-buttons">
              <button 
                className="btn-secondary-custom" 
                onClick={() => handleConfirmResponse(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary-custom" 
                onClick={() => handleConfirmResponse(true)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
