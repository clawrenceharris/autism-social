import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { Modal } from "../components";

interface ModalContextType {
  isOpen: boolean;
  modalContent: ReactNode | null;
  modalTitle: string | React.ReactNode;
  openModal: (
    content: ReactElement,
    title?: string | React.ReactElement
  ) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string | ReactElement>("");

  const openModal = useCallback(
    (content: ReactNode, title?: string | ReactElement) => {
      setModalContent(content);
      setModalTitle(title || <></>);
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
      <Modal onClose={closeModal} title={modalTitle} isOpen={isOpen}>
        {modalContent}
      </Modal>
    </ModalContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
