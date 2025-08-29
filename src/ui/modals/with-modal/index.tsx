"use client";

import Modal from "~/ui/modals";

interface WithModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  size?: string;
  center?: boolean;
  title?: string;
  onClose?: () => void;
  columns?: any[];
  data?: any[];
  [key: string]: any;
}

export default function withModal<P extends WithModalProps>(
  Component: React.ComponentType<P>
) {
  return function WrappedwithModal({
    children,
    isOpen,
    size,
    center = false,
    title = "",
    onClose = () => {},
    columns = [],
    data = [],
    ...rest
  }: P) {
    return (
      <>
        <Component {...{ columns, data, ...rest } as P} />

        <Modal {...{ isOpen, center, size, title, onClose }}>
          <div
            dir="rtl"
            className="flex flex-grow w-full h-full justify-center overflow-y-auto"
          >
            <div className="w-full h-full flex flex-1  px-10 flex-grow justify-center items-start">
              {children}
            </div>
          </div>
        </Modal>
      </>
    );
  };
}
