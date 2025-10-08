import { useState } from "react";
import OnsitePopup from "../components/Popups/OnsitePopup";

export default function usePopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("info");

  const PopupComponent = showPopup ? (
    <OnsitePopup
      message={popupMessage}
      type={popupType}
      onConfirm={() => setShowPopup(false)}
      confirmText="OK"
    />
  ) : null;

  const triggerPopup = (message, type = "info") => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  return { triggerPopup, PopupComponent };
}
