import { useModal } from "../../../context";
import "./ConfirmationModal.css";

interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal = ({
  title,
  message,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmationModalProps) => {
  const { closeModal } = useModal();

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  return (
    <div className="confirmation-modal">
      <p className="confirmation-message">{message}</p>
      <div className="modal-footer">
        <button onClick={closeModal} className="btn">
          {cancelText}
        </button>
        <button onClick={handleConfirm} className="btn btn-primary danger">
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;