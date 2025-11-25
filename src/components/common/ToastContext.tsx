import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const success = (title: string, message?: string) => showToast('success', title, message);
  const error = (title: string, message?: string) => showToast('error', title, message);
  const warning = (title: string, message?: string) => showToast('warning', title, message);
  const info = (title: string, message?: string) => showToast('info', title, message);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle size={20} />;
      case 'error': return <XCircle size={20} />;
      case 'warning': return <AlertTriangle size={20} />;
      case 'info': return <Info size={20} />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return { bg: '#d4edda', border: '#28a745', text: '#155724', icon: '#28a745' };
      case 'error': return { bg: '#f8d7da', border: '#dc3545', text: '#721c24', icon: '#dc3545' };
      case 'warning': return { bg: '#fff3cd', border: '#ffc107', text: '#856404', icon: '#ffc107' };
      case 'info': return { bg: '#cce5ff', border: '#0d6efd', text: '#004085', icon: '#0d6efd' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px'
        }}
      >
        {toasts.map(toast => {
          const styles = getStyles(toast.type);
          return (
            <div
              key={toast.id}
              style={{
                backgroundColor: styles.bg,
                borderLeft: `4px solid ${styles.border}`,
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'slideIn 0.3s ease-out'
              }}
            >
              <div style={{ color: styles.icon, flexShrink: 0, marginTop: '2px' }}>
                {getIcon(toast.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: styles.text, marginBottom: toast.message ? '4px' : 0 }}>
                  {toast.title}
                </div>
                {toast.message && (
                  <div style={{ fontSize: '14px', color: styles.text, opacity: 0.9 }}>
                    {toast.message}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0',
                  color: styles.text,
                  opacity: 0.6,
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};

export default ToastProvider;