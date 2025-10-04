import "../../styles/modal.css"

export default function UniversalModal({ isOpen, title, message, onOk, onCancel }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          {onCancel && (
            <button className="btn cancel" onClick={onCancel}>Cancel</button>
          )}
          <button className="btn confirm" onClick={onOk}>OK</button>
        </div>
      </div>
    </div>
  )
}
