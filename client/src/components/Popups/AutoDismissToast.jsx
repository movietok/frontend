import { useEffect, useState } from "react";
import "../../styles/AutoDismissToast.css";

export default function AutoDismissToast({
  message,
  type = "info",          // "success" | "info" | "error"
  duration = 2400,        // ms
  onClose,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Start fade-out slightly before removal so the transition plays
    const fadeTimer = setTimeout(() => setVisible(false), Math.max(800, duration - 250));
    const removeTimer = setTimeout(() => onClose?.(), Math.max(1000, duration));
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`mt-toast ${type} ${visible ? "enter" : "exit"}`}
      role="status"
      aria-live="polite"
    >
      <span className="mt-toast__text">{message}</span>
    </div>
  );
}
