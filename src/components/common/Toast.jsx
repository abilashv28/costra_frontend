import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import useToastStore from '../../stores/toastStore';

const Toast = ({ id, message, type = 'success' }) => {
  const removeToast = useToastStore((state) => state.removeToast);

  const getStyles = () => {
    const styles = {
      success: {
        bg: 'bg-green-600',
        text: 'text-white',
        icon: 'text-white',
      },
      error: {
        bg: 'bg-red-700',
        text: 'text-white',
        icon: 'text-white',
      },
      info: {
        bg: 'bg-blue-600',
        text: 'text-white',
        icon: 'text-white',
      },
      warning: {
        bg: 'bg-amber-600',
        text: 'text-white',
        icon: 'text-white',
      },
    };
    return styles[type] || styles.success;
  };

  const getIcon = () => {
    const icons = {
      success: <CheckCircle className="w-6 h-6 flex-shrink-0" />,
      error: <AlertCircle className="w-6 h-6 flex-shrink-0" />,
      info: <Info className="w-6 h-6 flex-shrink-0" />,
      warning: <AlertCircle className="w-6 h-6 flex-shrink-0" />,
    };
    return icons[type] || icons.success;
  };

  const styles = getStyles();

  return (
    <div
      className={`${styles.bg} rounded-full shadow-lg px-6 py-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300`}
      role="alert"
    >
      <div className={styles.icon}>{getIcon()}</div>
      <p className={`${styles.text} flex-1 font-semibold text-sm`}>{message}</p>
      <span
        onClick={() => removeToast(id)}
        className="text-white hover:text-white/80 transition-colors flex-shrink-0 p-0 cursor-pointer text-sm md:text-base"
        aria-label="Close notification"
      >
        <X className="w-5 h-5" />
      </span>
    </div>
  );
};

export const ToastContainer = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};

export default Toast;
