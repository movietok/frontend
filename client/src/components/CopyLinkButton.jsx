import { useState } from "react";
import "../styles/CopyLinkButton.css";

export default function CopyLinkButton({ label = "Copy Link", className = "", title = "Copy link" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

return (
  <div className="copylink-wrapper">
    <button
      className={`share-btn ${className}`}
      title={title}
      onClick={handleCopy}
    >
      {label}
      {copied && <span className="copy-tooltip">Copied!</span>}
    </button>
  </div>
);
}
