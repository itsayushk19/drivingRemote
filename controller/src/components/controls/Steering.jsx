import { useRef } from "react";
import { applyDeadzoneAndRange } from "../../utils/ControlMath";

export default function Steering({ control, editMode, onChange }) {
  const wheelRef = useRef(null);
  const angleRef = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const {
    sensitivity = 1.0,
    maxRotation = 900
  } = control.config ?? {};

  const onPointerDown = (e) => {
    if (editMode) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging.current || editMode) return;

    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    const px = last.current.x - cx;
    const py = last.current.y - cy;
    const nx = e.clientX - cx;
    const ny = e.clientY - cy;

    // Tangential drag → raw rotation
    const cross = px * ny - py * nx;
    const radius = Math.max(40, Math.hypot(px, py));

    angleRef.current += (cross / radius) * sensitivity;

    // Hard steering lock (FULL VISUAL RANGE)
    angleRef.current = Math.max(
      -maxRotation,
      Math.min(maxRotation, angleRef.current)
    );

    // 🔑 VISUAL USES RAW ANGLE
    if (wheelRef.current) {
      wheelRef.current.style.transform =
        `rotate(${angleRef.current}deg)`;
    }

    // 🔑 OUTPUT USES CURVED VALUE
    const rawNormalized = angleRef.current / maxRotation;
    const curved = applyDeadzoneAndRange(
      rawNormalized,
      control.config
    );

    onChange(control.id, curved);

    last.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerUp = (e) => {
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      style={outer}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={() => (dragging.current = false)}
    >
      <div
        ref={wheelRef}
        style={{
          ...wheel,
          backgroundImage: `url(${control.skin})`
        }}
      />
    </div>
  );
}

/* ================= STYLES ================= */

const outer = {
  width: "100%",
  height: "100%",
  touchAction: "none"
};

const wheel = {
  width: "100%",
  height: "100%",
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  willChange: "transform"
};
