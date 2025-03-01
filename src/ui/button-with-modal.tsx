import { ReactNode, useState } from "react";
import Button from "~/ui/buttons";
import Modal from "~/ui/modals";

interface ButtonWithModalProps {
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  buttonChildren?: ReactNode;
  modalProps?: {
    title?: string;
    size?: "sm" | "md" | "lg";
    center?: boolean;
    className?: string;
  };
  children: (closeModal: () => void) => ReactNode;
}

export const ButtonWithModal: React.FC<ButtonWithModalProps> = ({
  buttonProps = {},
  buttonChildren,
  modalProps = {
    center: true,
    size: "sm",
    className: "bg-secondary",
  },
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => setIsOpen(false);

  return (
    <>
      <Button
        {...(buttonProps as any)}
        className={` ${buttonProps.className || ""}`.trim()}
        onClick={() => setIsOpen(true)}
      >
        {buttonChildren}
      </Button>

      <Modal
        isOpen={isOpen}
        {...modalProps}
        className={`${modalProps.className || "bg-secondary"}`.trim()}
        onClose={closeModal}
      >
        {children(closeModal)}
      </Modal>
    </>
  );
};
