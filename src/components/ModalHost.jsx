// ModalHost.jsx
import React, { useEffect } from "react";
import { useModal } from "../contexts/ModalContext";
import AddItemModalQuick from "./AddItemModalQuick";
import AddItemModalFull from "./AddItemModalFull";

/**
 * ModalHost is a single place where all global modals are rendered.
 * It reads the modal state from ModalContext and mounts the correct component.
 */
export default function ModalHost() {
  const { modal, close } = useModal();

  // prevent background scroll when a modal is open
  useEffect(() => {
    if (modal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => (document.body.style.overflow = prev);
    }
  }, [modal]);

  if (!modal) return null;

  const { name, variant, props } = modal;

  // Map name + variant -> component
  if (name === "addItem") {
    if (variant === "quick") {
      return <AddItemModalQuick open onClose={close} {...props} />;
    }
    // default to 'full'
    return <AddItemModalFull open onClose={close} {...props} />;
  }

  // fallback: nothing
  return null;
}
