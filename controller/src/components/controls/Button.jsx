export default function Button({ control, editMode, onChange }) {
  const send = (v) => !editMode && onChange(control.id, v);

  return (
    <button
      style={btn}
      onPointerDown={() => send(1)}
      onPointerUp={() => send(0)}
      onPointerLeave={() => send(0)}
    >
      {control.label ?? control.id}
    </button>
  );
}

const btn = {
  width: "100%",
  height: "100%",
  borderRadius: 16,
  background: "linear-gradient(180deg,#1f2937,#111827)",
  color: "#e5e7eb",
  fontWeight: 600,
  letterSpacing: 0.5,
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 20px rgba(0,0,0,0.4)",
  transition: "transform .08s ease, box-shadow .08s ease",
  touchAction: "none"
};
