import "../../styles/modal.css";

export default function UniversalModal({
  isOpen,
  title,
  message,
  onOk,
  onCancel,
  inputLabel,
  inputType = "text",
  inputValue,
  onInputChange,
  hideOkButton = false // ✅ new prop to optionally hide OK button
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>

        {/* Optional input field */}
        {inputLabel && (
          <div className="modal-input-group">
            <label>{inputLabel}</label>
            <input
              type={inputType}
              value={inputValue}
              onChange={onInputChange}
              className="modal-input"
              placeholder={inputLabel}
            />
          </div>
        )}

        <div className="modal-actions">
          {/* Optional Cancel button */}
          {onCancel && (
            <button className="btn cancel" onClick={onCancel}>Cancel</button>
          )}

          {/* OK button (conditionally hidden) */}
          {!hideOkButton && (
            <button className="btn confirm" onClick={onOk}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}
