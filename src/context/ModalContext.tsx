import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

interface ModalContextType {
  isOpen: boolean;
  modalContent: ReactNode | null;
  modalTitle: string | React.ReactNode;
  openModal: (
    content: ReactElement,
    title: string | React.ReactElement
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string | ReactElement>("");

  const openModal = useCallback(
    (content: ReactNode, title: string | ReactElement) => {
      setModalContent(content);
      setModalTitle(title);
      setIsOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalContent(null);
    setModalTitle("");
  }, []);

  return (
    <ModalContext.Provider
      value={{ isOpen, modalContent, modalTitle, openModal, closeModal }}
    >
      {children}
      {isOpen && modalContent && (
        <div className="modal-overlay">
          <div className="modal-backdrop" onClick={closeModal} />
          <div className="modal-container">
            <div className="modal-content">
              <div className="modal-header">
                {typeof modalTitle === "string" ? (
                  <h3 className="modal-title">{modalTitle}</h3>
                ) : (
                  modalTitle
                )}
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
