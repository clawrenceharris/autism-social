import { useModal } from "../../../context";

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmationModal = ({
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
        <button onClick={handleConfirm} className="btn btn-danger">
          {confirmText}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
