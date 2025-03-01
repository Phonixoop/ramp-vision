import React, { createContext, useContext, useState, useCallback } from "react";

interface ModalContextType {
  openModals: number;
  incrementOpenModals: () => void;
  decrementOpenModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [openModals, setOpenModals] = useState(0);

  const incrementOpenModals = useCallback(() => {
    setOpenModals((prev) => prev + 1);
  }, []);

  const decrementOpenModals = useCallback(() => {
    setOpenModals((prev) => Math.max(0, prev - 1));
  }, []);

  return (
    <ModalContext.Provider
      value={{ openModals, incrementOpenModals, decrementOpenModals }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
