import { useState } from "react";
import Modal from "~/ui/modals";

interface WithModalStateProps {
  content?: React.ReactNode;
  isOpen?: boolean;
  size?: string;
  center?: boolean;
  title?: string;
  closeBtn?: React.ReactNode;
  onClose?: () => void;
  render?: (closeModal: () => void) => React.ReactNode;
  [key: string]: any;
}

export default function withModalState(Component: React.ComponentType<any>) {
  return function WrappedwithModal({
    content,
    isOpen = false,
    size,
    center = false,
    title = "",
    closeBtn = <></>,
    onClose = () => {},
    render = () => null,
    ...rest
  }: WithModalStateProps) {
    const [modal, setModal] = useState({ isOpen: false });

    const openModal = () => setModal({ isOpen: true });
    const closeModal = () => setModal({ isOpen: false });

    return (
      <>
        <Component onClick={openModal} {...rest}>
          {content}
        </Component>
        <Modal
          className="bg-secondary"
          {...{
            isOpen: modal.isOpen,
            center,
            size,
            title,
            onClose: closeModal,
          }}
        >
          {render(closeModal)}
        </Modal>
      </>
    );
  };
}
