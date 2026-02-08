import { useState, useEffect, useCallback } from "react";
import basicLayout from "../layouts/basic";
import ControlRenderer from "../components/ControlRenderer";
import ControlEditor from "../components/ControlEditor";
import NameModal from "../components/NameModal";
import { useApp } from "../state/appState";

import { clampToScreen } from "../utils/layoutMath";
import { resolveOverlaps } from "../utils/layoutResolve";
import { resolveButtonMappings } from "../utils/mapping";

import {
  compressLayout,
  decompressLayout,
  loadLayouts,
  saveLayouts,
  deleteLayout,
  renameLayout,
  storagePercentUsed
} from "../utils/layoutStorage";

const TOPBAR_HEIGHT = 56;

export default function ControllerPage({ openMenu }) {
  const {
    setControlPayload,
    latency,
    selectedLayout,
    setSelectedLayout
  } = useApp();

  const [layout, setLayout] = useState(null);
  const [controlState, setControlState] = useState({});
  const [variants, setVariants] = useState([]);
  const [storagePct, setStoragePct] = useState(0);

  const [showSave, setShowSave] = useState(false);
  const [showRename, setShowRename] = useState(false);
  
  /* ---------- EDIT MODE ---------- */
  const [editMode, setEditMode] = useState(false);
  const [testMode, setTestMode] = useState(false);

  /* ---------- DISABLE SCROLL ---------- */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, []);

  /* ---------- LOAD CURRENT LAYOUT ---------- */
  useEffect(() => {
    const all = loadLayouts();
    let l = basicLayout;

    if (selectedLayout && all[selectedLayout]) {
      l = decompressLayout(all[selectedLayout]);
    }

    // 🔑 Apply button mapping ONLY to buttons
    const controls = l.controls.map(c =>
      c.type === "button"
        ? resolveButtonMappings([c])[0]
        : c
    );

    setLayout({ ...l, controls });
  }, [selectedLayout]);

  /* ---------- LOAD VARIANTS ---------- */
  useEffect(() => {
    const all = loadLayouts();

    const list = Object.entries(all)
      .map(([id, d]) => ({ id, ...decompressLayout(d) }))
      .filter(l => l.baseId === basicLayout.id);

    setVariants(list);
    setStoragePct(storagePercentUsed());
  }, [selectedLayout]);

  /* ---------- BUILD PAYLOAD ---------- */
  useEffect(() => {
    if (!layout) return;

    const axes = {};
    const buttons = {};

    for (const c of layout.controls) {
      const v = controlState[c.id] ?? 0;

      if (c.config?.axis) {
        axes[c.config.axis] = { value: v };
      }

      if (c.config?.button != null) {
        buttons[c.config.button] = v;
      }
    }

    setControlPayload({
      timestamp: Date.now(),
      axes,
      buttons,
      meta: { layoutId: layout.id }
    });
  }, [layout, controlState, setControlPayload]);

  /* ---------- SAVE ---------- */
  const confirmSave = async name => {
    const all = loadLayouts();
    const id = `custom_${Date.now()}`;

    all[id] = compressLayout({
      ...layout,
      id,
      baseId: basicLayout.id,
      name
    });

    saveLayouts(all);
    setSelectedLayout(id);
  };

  /* ---------- RENAME ---------- */
const confirmRename = async name => {
  renameLayout(layout.id, name);

  const all = loadLayouts();

  // update layout immediately
  const updated = all[layout.id];
  if (updated) {
    const next = decompressLayout(updated);
    setLayout({
      ...next,
      controls: next.controls.map(c =>
        c.type === "button"
          ? resolveButtonMappings([c])[0]
          : c
      )
    });
  }

  // 🔑 REFRESH VARIANTS SO SELECT UPDATES
  const list = Object.entries(all)
    .map(([id, d]) => ({ id, ...decompressLayout(d) }))
    .filter(l => l.baseId === basicLayout.id);

  setVariants(list);
};


  /* ---------- DELETE ---------- */
  const remove = () => {
    if (layout.id === "basic") return;
    if (confirm("Delete this layout?")) {
      deleteLayout(layout.id);
      setSelectedLayout("basic");
    }
  };

  /* ---------- ADD CONTROL ---------- */
  const addControl = (type) => {
    const newControl = {
      id: `${type}_${Date.now()}`,
      type,
      x: 0.1,
      y: 0.3,
      w: type === "steering" ? 0.4 : type === "joystick" ? 0.25 : 0.2,
      h: type === "steering" ? 0.4 : type === "joystick" ? 0.25 : type === "hshifter" ? 0.3 : 0.15,
      config: {
        axis: type === "steering" ? "X" : type === "pedal" ? "Y" : type === "joystick" ? "RX" : "Z",
        mode: type === "pedal" ? "normal" : "centered",
        deadzone: 0.05,
        range: 1,
        ...(type === "button" && { button: 1 }),
        ...(type === "hshifter" && { 
          pattern: "7-speed",
          axis: "RZ" 
        }),
        ...(type === "joystick" && { 
          xAxis: "RX",
          yAxis: "RY",
          gate: "circular" 
        })
      }
    };

    setLayout(prev => ({
      ...prev,
      controls: [...prev.controls, newControl]
    }));
  };

  /* ---------- DELETE CONTROL ---------- */
  const deleteControl = (id) => {
    if (confirm("Delete this control?")) {
      setLayout(prev => ({
        ...prev,
        controls: prev.controls.filter(c => c.id !== id)
      }));
    }
  };

  /* ---------- MOVE CONTROL ---------- */
  const updateControlPosition = useCallback((id, patch) => {
    setLayout(prev => {
      let next = prev.controls.map(c =>
        c.id === id ? clampToScreen({ ...c, ...patch }) : c
      );
      next = resolveOverlaps(next, id);
      return { ...prev, controls: next };
    });
  }, []);

  if (!layout) return null;

  return (
    <div style={root}>
      {/* ================= TOP BAR ================= */}
      <div style={topBar}>
        <button onClick={openMenu} style={iconBtn}>☰</button>

        <select
          value={selectedLayout || "basic"}
          onChange={e => setSelectedLayout(e.target.value)}
          style={variantSelect}
        >
          <option value="basic">Default</option>
          {variants.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        {!editMode ? (
          <>
            <button style={btnGreen} onClick={() => setShowSave(true)}>💾 Save</button>
            <button
              style={btnAmber}
              disabled={layout.id === "basic"}
              onClick={() => setShowRename(true)}
            >
              ✎ Rename
            </button>
            <button
              style={btnRed}
              disabled={layout.id === "basic"}
              onClick={remove}
            >
              🗑 Delete
            </button>
          </>
        ) : (
          <>
            {/* ADD CONTROL DROPDOWN */}
            <select
              onChange={e => {
                if (e.target.value) {
                  addControl(e.target.value);
                  e.target.value = "";
                }
              }}
              style={addControlSelect}
              defaultValue=""
            >
              <option value="" disabled>+ Add Control</option>
              <option value="steering">🎯 Steering</option>
              <option value="pedal">🦶 Pedal/Slider</option>
              <option value="button">🔘 Button</option>
              <option value="joystick">🕹️ Joystick</option>
              <option value="hshifter">⚙️ H-Shifter</option>
            </select>

            {/* TEST MODE TOGGLE */}
            <button
              style={testMode ? btnAmber : btnGray}
              onClick={() => setTestMode(!testMode)}
            >
              {testMode ? "🧪 Testing" : "🧪 Test"}
            </button>

            {/* SAVE BUTTON */}
            <button style={btnGreen} onClick={() => {
              setEditMode(false);
              setTestMode(false);
              setShowSave(true);
            }}>
              ✓ Done
            </button>
          </>
        )}

        <div style={spacer} />

        {/* EDIT MODE TOGGLE */}
        <button
          style={editMode ? btnPurple : iconBtn}
          onClick={() => {
            setEditMode(!editMode);
            if (editMode) setTestMode(false);
          }}
        >
          ⚙️
        </button>

        <div style={storage}>
          {storagePct.toFixed(1)}%
          <div style={bar}>
            <div
              style={{
                ...fill,
                width: `${storagePct}%`,
                background:
                  storagePct < 70 ? "#22c55e" :
                  storagePct < 90 ? "#f59e0b" : "#ef4444"
              }}
            />
          </div>
        </div>

        {latency != null && (
          <div style={latencyHud}>⚡ {latency} ms</div>
        )}
      </div>

      {/* ================= CANVAS ================= */}
      <div style={canvas}>
        {layout.controls.map(c => (
          <div key={c.id} style={{ position: "relative" }}>
            <ControlRenderer
              control={c}
              editMode={editMode && !testMode}
              onChange={(id, v) =>
                setControlState(s => ({ ...s, [id]: v }))
              }
              onUpdatePosition={updateControlPosition}
            />
            
            {/* DELETE BUTTON IN EDIT MODE */}
            {editMode && !testMode && (
              <button
                style={{
                  ...deleteBtn,
                  left: `${c.x * 100}%`,
                  top: `${c.y * 100}%`,
                }}
                onClick={() => deleteControl(c.id)}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <ControlEditor layout={layout} setLayout={setLayout} />

      {/* ================= MODALS ================= */}
      {showSave && (
        <NameModal
          title="Save Layout"
          initialValue={layout.name}
          successText="✓ Saved"
          onConfirm={confirmSave}
          onCancel={() => setShowSave(false)}
        />
      )}

      {showRename && (
        <NameModal
          title="Rename Layout"
          initialValue={layout.name}
          confirmText="Rename"
          successText="✓ Renamed"
          onConfirm={confirmRename}
          onCancel={() => setShowRename(false)}
        />
      )}
    </div>
  );
}

/* ====================== STYLES ====================== */

const root = {
  width: "100vw",
  height: "100vh",
  position: "relative",
  background: "radial-gradient(circle at top,#020617,#000)"
};

const topBar = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: TOPBAR_HEIGHT,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 14px",
  background: "rgba(2,6,23,.92)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  zIndex: 1000
};

const iconBtn = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "rgba(18,24,38,.9)",
  color: "#e5e7eb",
  cursor: "pointer"
};

const variantSelect = {
  padding: "6px 10px",
  borderRadius: 10,
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid rgba(255,255,255,.15)"
};

const btnGreen = {
  background: "linear-gradient(180deg,#22c55e,#15803d)",
  borderRadius: 999,
  padding: "6px 12px",
  color: "#fff",
  fontWeight: 700
};

const btnAmber = {
  background: "linear-gradient(180deg,#f59e0b,#b45309)",
  borderRadius: 999,
  padding: "6px 12px",
  color: "#fff",
  fontWeight: 700
};

const btnRed = {
  background: "linear-gradient(180deg,#ef4444,#991b1b)",
  borderRadius: 999,
  padding: "6px 12px",
  color: "#fff",
  fontWeight: 700
};

const btnGray = {
  background: "linear-gradient(180deg,#6b7280,#374151)",
  borderRadius: 999,
  padding: "6px 12px",
  color: "#fff",
  fontWeight: 700
};

const btnPurple = {
  background: "linear-gradient(180deg,#a855f7,#7e22ce)",
  borderRadius: 999,
  padding: "6px 12px",
  color: "#fff",
  fontWeight: 700
};

const addControlSelect = {
  padding: "6px 10px",
  borderRadius: 10,
  background: "#15803d",
  color: "#fff",
  border: "1px solid rgba(255,255,255,.3)",
  fontWeight: 600
};

const spacer = { flex: 1 };

const storage = {
  fontSize: 11,
  opacity: 0.75,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end"
};

const bar = {
  width: 90,
  height: 6,
  background: "#020617",
  borderRadius: 6,
  overflow: "hidden",
  marginTop: 4
};

const fill = { height: "100%" };

const latencyHud = {
  padding: "6px 12px",
  borderRadius: 999,
  background: "rgba(255,255,255,.08)",
  color: "#fff",
  fontWeight: 700
};

const canvas = {
  position: "absolute",
  top: TOPBAR_HEIGHT,
  left: 0,
  right: 0,
  bottom: 0
};

const deleteBtn = {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  background: "#ef4444",
  color: "#fff",
  border: "2px solid #fff",
  borderRadius: "50%",
  width: 28,
  height: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 700,
  zIndex: 1001,
  boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
};
