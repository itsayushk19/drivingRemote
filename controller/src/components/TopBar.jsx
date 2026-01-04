export default function TopBar({ children }) {
  return (
    <div style={bar}>
      <div style={inner}>{children}</div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const bar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 56,
  zIndex: 1000,
  background: "rgba(2,6,23,.9)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255,255,255,.08)"
};

const inner = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 14px"
};
