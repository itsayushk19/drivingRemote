export default function EditableWrapper({ control, onUpdate, children }) {
  let x, y;

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onPointerDown={(e) => {
        x = e.clientX;
        y = e.clientY;
      }}
      onPointerMove={(e) => {
        const dx = (e.clientX - x) / window.innerWidth;
        const dy = (e.clientY - y) / window.innerHeight;
        onUpdate({ ...control, x: control.x + dx, y: control.y + dy });
        x = e.clientX;
        y = e.clientY;
      }}
    >
      {children}
    </div>
  );
}
  