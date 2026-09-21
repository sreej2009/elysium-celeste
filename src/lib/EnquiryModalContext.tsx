import { createContext, useContext, useState, useCallback, useMemo } from "react";
import type { ReactNode } from "react";

interface EnquiryModalValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const EnquiryModalContext = createContext<EnquiryModalValue | null>(null);

export function EnquiryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ isOpen, openModal, closeModal }), [isOpen, openModal, closeModal]);

  return <EnquiryModalContext.Provider value={value}>{children}</EnquiryModalContext.Provider>;
}

export function useEnquiryModal() {
  const ctx = useContext(EnquiryModalContext);
  if (!ctx) throw new Error("useEnquiryModal must be used within an EnquiryModalProvider");
  return ctx;
}
