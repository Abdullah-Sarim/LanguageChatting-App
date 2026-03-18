import React from "react";
import { PhoneCallIcon, PhoneOffIcon } from "lucide-react";

// RingModal: simple overlay showing incoming ringing state with action buttons
const RingModal = ({ isOpen, user, onAccept, onDecline, onClose }) => {
  if (!isOpen) return null;

  const avatar = user?.avatarUrl || user?.profilePic; // optional
  const name = user?.fullName || user?.name || "Friend";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ width: 420, background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,.15)" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{ position: "relative", width: 120, height: 120, borderRadius: "50%", padding: 6, background: "conic-gradient(#3b82f6, #34d399, #f59e0b, #3b82f6)" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {avatar ? (
                <img src={avatar} alt="avatar" style={{ width: 100, height: 100, borderRadius: "50%" }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 700 }}>{name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Ringing</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <button className="btn btn-success" onClick={onAccept} aria-label="Accept call">
            <PhoneCallIcon className="h-5 w-5" />
          </button>
          <button className="btn btn-error" onClick={onDecline} aria-label="Decline call">
            <PhoneOffIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RingModal;
