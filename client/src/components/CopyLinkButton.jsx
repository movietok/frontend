import { useState } from "react";
import "../styles/CopyLinkButton.css";

export default function CopyLinkButton({ label = "Copy Link" }) {
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
    <button className="share-btn" onClick={handleCopy}>
      {copied ? "Copied!" : label}
    </button>
  );
}
