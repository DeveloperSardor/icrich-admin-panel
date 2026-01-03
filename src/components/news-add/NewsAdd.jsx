import React from "react";
import { FiX } from "react-icons/fi";
import "./style.css";

const Modal = ({ isOpen, onClose, onSubmit, children }) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose}>
          <FiX size={24} />
        </button>
        <form onSubmit={handleSubmit}>
          {children}
        </form>
      </div>
    </div>
  );
};

export default Modal;