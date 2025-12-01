import React from "react";
import "./style.css"; // Import CSS for styling

const Modal = ({ isOpen, onClose, onSubmit, children }) => {
  if (!isOpen) return null; // If modal is not open, do not render it

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    onSubmit(e); // Trigger the onSubmit passed from the parent component
  };

  return (
    <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
      >
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <form onSubmit={handleSubmit}>
          {children} {/* Render form fields passed as children */}
        </form>
      </div>
    </div>
  );
};

export default Modal;