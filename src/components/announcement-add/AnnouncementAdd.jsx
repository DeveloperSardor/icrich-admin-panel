const Modal = ({ isOpen, onClose, onSubmit, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <form onSubmit={onSubmit}>
          {children}
          <button type="submit">Saqlash</button>
        </form>
      </div>
    </div>
  );
};


export default Modal;