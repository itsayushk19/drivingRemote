import { useApp } from "../state/appState";

export default function BottomBar({ collapsed, setCollapsed }) {
  const { activeTab, setActiveTab } = useApp();

  if (collapsed && activeTab === "controller") {
    return (
      <div style={peek} onClick={() => setCollapsed(false)}>
        ⬆ Menu
      </div>
    );
  }

  return (
    <div style={bar}>
      {[
        ["connection", "Connection"],
        ["layout", "Layouts"],
        ["controller", "Controller"]
      ].map(([id, label]) => (
        <button
          key={id}
          onClick={() => {
            setActiveTab(id);
            if (id === "controller") setCollapsed(true);
          }}
          style={{
            ...tab,
            ...(activeTab === id ? tabActive : {})
          }}
        >
          {label}
        </button>
      ))}

      {activeTab === "controller" && (
        <button onClick={() => setCollapsed(true)} style={collapseBtn}>
          ⬇
        </button>
      )}
    </div>
  );
}

const bar = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  height: 64,
  display: "flex",
  gap: 8,
  padding: "8px 12px",
  background: "rgba(11,15,20,0.95)",
  backdropFilter: "blur(12px)",
  borderTop: "1px solid rgba(255,255,255,.06)",
  zIndex: 1000
};

const tab = {
  flex: 1,
  borderRadius: 12,
  background: "transparent",
  color: "#9ca3af",
  fontWeight: 600
};

const tabActive = {
  background: "#121826",
  color: "#e5e7eb"
};

const collapseBtn = {
  width: 42,
  borderRadius: 10,
  background: "#020617",
  color: "#9ca3af",
  fontSize: 14
};

const peek = {
  position: "fixed",
  bottom: 8,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "6px 14px",
  borderRadius: 999,
  background: "rgba(18,24,38,.9)",
  border: "1px solid rgba(255,255,255,.08)",
  color: "#e5e7eb",
  fontSize: 12,
  fontWeight: 600,
  zIndex: 1000,
  cursor: "pointer"
};
