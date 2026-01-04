import { useRef } from "react";
import { useApp } from "../state/appState";
import Steering from "./controls/Steering";
import Pedal from "./controls/Pedal";
import Button from "./controls/Button";

export default function ControlRenderer({
  control,
  editMode,
  onChange,
  onUpdatePosition
}) {
  const { setSelectedControl } = useApp();
  const start = useRef(null);
  const moved = useRef(false);

  const onDown = (e) => {
    if (!editMode) return;
    start.current = {
      x: e.clientX,
      y: e.clientY,
      ox: control.x,
      oy: control.y
    };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMove = (e) => {
    if (!editMode || !start.current) return;
    const dx = (e.clientX - start.current.x) / window.innerWidth;
    const dy = (e.clientY - start.current.y) / window.innerHeight;

    if (Math.abs(dx) + Math.abs(dy) > 0.005) {
      moved.current = true;
      onUpdatePosition(control.id, {
        x: start.current.ox + dx,
        y: start.current.oy + dy
      });
    }
  };

  const onUp = (e) => {
    if (!editMode) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (!moved.current) setSelectedControl(control);
    start.current = null;
  };

  const C =
    control.type === "steering" ? Steering :
    control.type === "pedal"    ? Pedal :
    Button;

  return (
    <div
      style={{
        ...wrapper,
        left: `${control.x * 100}%`,
        top: `${control.y * 100}%`,
        width: `${control.w * 100}%`,
        height: `${control.h * 100}%`,
        outline: editMode ? "2px dashed red" : "none"
      }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
    >
      <C
        control={control}
        editMode={editMode}
        onChange={onChange}
      />
    </div>
  );
}

const wrapper = {
  position: "absolute",
  touchAction: "none"
};
