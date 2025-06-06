import { createContext, useContext, useState, type ReactNode } from "react";

interface ModalContextType {
  isOpen: boolean;
  modalContent: ReactNode | null;
  modalTitle: string;
  openModal: (content: ReactNode, title: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState("");

  const openModal = (content: ReactNode, title: string) => {
    setModalContent(content);
    setModalTitle(title);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    setModalTitle("");
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, modalContent, modalTitle, openModal, closeModal }}
    >
      {children}
      {isOpen && modalContent && (
        <div className="modal-overlay">
          <div className="modal-backdrop\" onClick={closeModal} />
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">{modalTitle}</h3>
                <button onClick={closeModal} className="modal-close">
                  ×
                </button>
              </div>
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
