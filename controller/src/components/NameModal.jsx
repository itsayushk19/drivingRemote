import { useState } from "react";

export default function NameModal({
  title,
  initialValue = "",
  confirmText = "Confirm",
  successText = "✓ Done",
  placeholder = "",
  validate,
  onConfirm,
  onCancel,
  onSuccess
}) {
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState("idle"); // idle | success

  const isValid = validate ? validate(value) : true;

  const submit = async () => {
    if (!isValid || status === "success") return;

    await onConfirm?.(value);
    setStatus("success");

    // 🔑 Success stays visible, then modal closes itself
    setTimeout(() => {
      onSuccess?.();
      onCancel?.();   // ✅ FORCE close modal
    }, 700);
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        <div style={header}>{title}</div>

        {status === "success" ? (
          <div style={success}>{successText}</div>
        ) : (
          <>
            {/* 🔑 Input ALWAYS renders */}
            <input
              autoFocus
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={placeholder || "Enter name…"}
              style={input}
            />

            <div style={actions}>
              <button onClick={onCancel} style={btnGhost}>
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={!isValid}
                style={{
                  ...btnDanger,
                  opacity: isValid ? 1 : 0.5,
                  cursor: isValid ? "pointer" : "not-allowed"
                }}
              >
                {confirmText}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.65)",
  backdropFilter: "blur(8px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modal = {
  width: 340,
  padding: 20,
  borderRadius: 18,
  background: "rgba(18,24,38,.95)",
  border: "1px solid rgba(255,255,255,.12)",
  boxShadow: "0 30px 80px rgba(0,0,0,.8)",
  color: "#e5e7eb"
};

const header = {
  fontSize: 14,
  fontWeight: 800,
  marginBottom: 12
};

const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  background: "#020617",
  border: "1px solid rgba(255,255,255,.15)",
  color: "#e5e7eb"
};

const actions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 16
};

const btnDanger = {
  padding: "8px 14px",
  borderRadius: 10,
  background: "linear-gradient(180deg,#ef4444,#991b1b)",
  color: "#fff",
  fontWeight: 800
};

const btnGhost = {
  padding: "8px 14px",
  background: "transparent",
  color: "#9ca3af"
};

const success = {
  padding: "28px 0",
  textAlign: "center",
  fontWeight: 900,
  color: "#22c55e",
  fontSize: 16
};
