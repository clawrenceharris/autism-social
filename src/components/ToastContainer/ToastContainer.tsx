import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast } from "../../context";
import "./ToastContainer.scss";
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "error":
        return <AlertCircle size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "info":
      default:
        return <Info size={20} />;
    }
  };
  console.log({ toasts });
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          icon={getIcon(toast.type)}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  icon: React.ReactNode;
  onClose: () => void;
}

const Toast = ({ message, type, icon, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast ${type}`} role="alert" aria-live="polite">
      <div className="toast-content">
        <div className="toast-icon">{icon}</div>
        <p className="toast-message">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="toast-close"
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ToastContainer;
