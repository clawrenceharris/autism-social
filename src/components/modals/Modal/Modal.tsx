import { useEffect, type ReactElement, type ReactNode } from "react";
import { X } from "lucide-react";
import "./Modal.scss";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string | ReactElement;
  children: ReactNode;
  showsCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showsCloseButton = true,
}: ModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onClose) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            {showsCloseButton && (
              <button onClick={onClose} className="modal-close">
                <X />
              </button>
            )}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
