// ModalContext.jsx
import React, { createContext, useContext, useCallback, useState } from "react";

/**
 * ModalContext API:
 *  const { openAddItem, close } = useModal();
 *  openAddItem('quick', { some: 'data' }) // opens quick modal
 *  openAddItem('full') // opens full modal
 */

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  // { name: 'addItem', variant: 'quick'|'full', props: {} } or null
  const [modal, setModal] = useState(null);

  const open = useCallback((name, variant, props = {}) => {
    setModal({ name, variant, props });
  }, []);

  const close = useCallback(() => setModal(null), []);

  const openAddItem = useCallback((variant = "full", props = {}) => {
    open("addItem", variant, props);
  }, [open]);

  return (
    <ModalContext.Provider value={{ modal, open, close, openAddItem }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used inside ModalProvider");
  return ctx;
}