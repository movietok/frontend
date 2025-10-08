import "../../styles/OnsitePopup.css";

export default function OnsitePopup({
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText,
  type = "info", // "info", "confirm", "success", "error"
}) {
  return (
    <div className="inline-delete-overlay">
      <div className={`inline-delete-modal modal-${type}`}>
        <p>{message}</p>
        <div className="delete-modal-buttons">
          {onConfirm && (
            <button className="confirm-delete" onClick={onConfirm}>
              {confirmText}
            </button>
          )}
          {onCancel && (
            <button className="cancel-delete" onClick={onCancel}>
              {cancelText || "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
