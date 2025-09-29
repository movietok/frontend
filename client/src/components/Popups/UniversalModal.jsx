import "../../styles/modal.css"

export default function UniversalModal({ isOpen, title, message, onOk }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn confirm" onClick={onOk}>OK</button>
        </div>
      </div>
    </div>
  )
}