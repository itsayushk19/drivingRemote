import { useRef, useState } from "react";
import { clamp, applyDeadzoneAndRange } from "../../utils/ControlMath";

export default function Pedal({ control, editMode, onChange }) {
  const dragging = useRef(false);
  const [value, setValue] = useState(0);

  const setFromY = (y, el) => {
    const r = el.getBoundingClientRect();

    // raw pedal value (0–1)
    const raw = clamp(1 - (y - r.top) / r.height, 0, 1);

    // 🔑 curve + deadzone + range
    const shaped = applyDeadzoneAndRange(raw, control.config);

    // visual follows curved value
    setValue(shaped);

    // output matches visual
    onChange(control.id, shaped);
  };

  const stop = (e) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      style={pedalOuter}
      onPointerDown={(e) => {
        if (editMode) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        setFromY(e.clientY, e.currentTarget);
      }}
      onPointerMove={(e) => {
        if (!dragging.current || editMode) return;
        setFromY(e.clientY, e.currentTarget);
      }}
      onPointerUp={stop}
      onPointerLeave={stop}
    >
      <div
        style={{
          ...pedalFill,
          height: `${value * 100}%`
        }}
      />
    </div>
  );
}

/* ================= STYLES ================= */

const pedalOuter = {
  width: "100%",
  height: "100%",
  borderRadius: 18,
  background: "#0f172a",
  border: "1px solid var(--border)",
  overflow: "hidden",
  position: "relative"
};

const pedalFill = {
  position: "absolute",
  bottom: 0,
  width: "100%",
  background: "linear-gradient(180deg,#22c55e,#15803d)",
  boxShadow: "0 -10px 30px rgba(34,197,94,0.35)"
};
