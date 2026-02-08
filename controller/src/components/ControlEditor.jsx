import { useRef, useState } from "react";
import { useApp } from "../state/appState";

const AXES = ["X", "Y", "Z", "RX", "RY", "RZ", "SLIDER1", "SLIDER2"];

const CURVE_TYPES = [
  { id: "linear", label: "Linear" },
  { id: "soft-center", label: "Soft Center" },
  { id: "expo", label: "Exponential" },
  { id: "cubic", label: "Cubic" }
];

export default function ControlEditor({ layout, setLayout }) {
  const { selectedControl, setSelectedControl } = useApp();
  if (!selectedControl) return null;

  /* ---------- DRAG ---------- */
  const drag = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const startDrag = (e) => {
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      ox: pos.x,
      oy: pos.y
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onDrag = (e) => {
    if (!drag.current) return;
    setPos({
      x: drag.current.ox + (e.clientX - drag.current.x),
      y: drag.current.oy + (e.clientY - drag.current.y)
    });
  };

  const stopDrag = (e) => {
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  /* ---------- UPDATE HELPERS ---------- */
  const update = (patch) => {
    setLayout(prev => ({
      ...prev,
      controls: prev.controls.map(c =>
        c.id === selectedControl.id ? { ...c, ...patch } : c
      )
    }));
    setSelectedControl(prev => ({ ...prev, ...patch }));
  };

  const updateConfig = (patch) =>
    update({
      config: {
        ...selectedControl.config,
        ...patch
      }
    });

  /* ====================== UI ====================== */

  return (
    <div
      style={{
        ...panel,
        transform: `translate(${pos.x}px, ${pos.y}px)`
      }}
      onPointerMove={onDrag}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
    >
      {/* HEADER (DRAG HANDLE, NON-SCROLLING) */}
      <div style={header} onPointerDown={startDrag}>
        <div style={headerTitle}>
          EDIT {selectedControl.type.toUpperCase()}
        </div>
        <button
          style={closeBtn}
          onClick={() => setSelectedControl(null)}
        >
          ✕
        </button>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div style={content}>
        <Slider
          label="X Position"
          value={selectedControl.x}
          onChange={v => update({ x: v })}
        />

        <Slider
          label="Y Position"
          value={selectedControl.y}
          onChange={v => update({ y: v })}
        />

        <Slider
          label="Width"
          min={0.05}
          value={selectedControl.w}
          onChange={v => update({ w: v })}
        />

        <Slider
          label="Height"
          min={0.05}
          value={selectedControl.h}
          onChange={v => update({ h: v })}
        />

        {(selectedControl.type === "steering" ||
          selectedControl.type === "pedal" ||
          selectedControl.type === "joystick") && (
          <>
            {/* AXIS MAPPING */}
            <Section title="Axis Mapping">
              {selectedControl.type !== "joystick" && (
                <>
                  <label style={label}>vJoy Axis</label>
                  <select
                    value={selectedControl.config.axis || ""}
                    onChange={e =>
                      updateConfig({ axis: e.target.value })
                    }
                    style={select}
                  >
                    {AXES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </>
              )}

              {selectedControl.type === "joystick" && (
                <>
                  <label style={label}>X Axis</label>
                  <select
                    value={selectedControl.config.xAxis || "RX"}
                    onChange={e =>
                      updateConfig({ xAxis: e.target.value })
                    }
                    style={select}
                  >
                    {AXES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>

                  <label style={label}>Y Axis</label>
                  <select
                    value={selectedControl.config.yAxis || "RY"}
                    onChange={e =>
                      updateConfig({ yAxis: e.target.value })
                    }
                    style={select}
                  >
                    {AXES.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>

                  <label style={label}>Gate Type</label>
                  <select
                    value={selectedControl.config.gate || "circular"}
                    onChange={e =>
                      updateConfig({ gate: e.target.value })
                    }
                    style={select}
                  >
                    <option value="circular">Circular</option>
                    <option value="square">Square</option>
                  </select>
                </>
              )}

              <Slider
                label="Deadzone"
                max={0.5}
                value={selectedControl.config.deadzone ?? 0}
                onChange={v => updateConfig({ deadzone: v })}
              />

              <Slider
                label="Range"
                min={0.1}
                value={selectedControl.config.range ?? 1}
                onChange={v => updateConfig({ range: v })}
              />
            </Section>

            {/* AXIS CURVE */}
            <Section title="Axis Curve">
              <label style={label}>Curve Type</label>
              <select
                value={selectedControl.config.curve?.type || "linear"}
                onChange={e =>
                  updateConfig({
                    curve:
                      e.target.value === "linear"
                        ? undefined
                        : {
                            type: e.target.value,
                            amount:
                              selectedControl.config.curve?.amount ?? 1.5
                          }
                  })
                }
                style={select}
              >
                {CURVE_TYPES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              {["expo", "soft-center"].includes(
                selectedControl.config.curve?.type
              ) && (
                <Slider
                  label="Curve Amount"
                  min={0.1}
                  max={3}
                  step={0.05}
                  value={selectedControl.config.curve.amount}
                  onChange={v =>
                    updateConfig({
                      curve: {
                        ...selectedControl.config.curve,
                        amount: v
                      }
                    })
                  }
                />
              )}
            </Section>
          </>
        )}

        {selectedControl.type === "button" && (
          <Section title="Button">
            <Slider
              label="Button Number"
              min={1}
              max={32}
              step={1}
              value={selectedControl.config.button ?? 1}
              onChange={v => updateConfig({ button: v })}
            />

            <label style={label}>Mode</label>
            <select
              value={selectedControl.config.mode || "momentary"}
              onChange={e =>
                updateConfig({ mode: e.target.value })
              }
              style={select}
            >
              <option value="momentary">Momentary</option>
              <option value="toggle">Toggle</option>
            </select>
          </Section>
        )}

        {selectedControl.type === "hshifter" && (
          <Section title="H-Shifter">
            <label style={label}>vJoy Axis</label>
            <select
              value={selectedControl.config.axis || "RZ"}
              onChange={e =>
                updateConfig({ axis: e.target.value })
              }
              style={select}
            >
              {AXES.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <label style={label}>Gear Pattern</label>
            <select
              value={selectedControl.config.pattern || "7-speed"}
              onChange={e =>
                updateConfig({ pattern: e.target.value })
              }
              style={select}
            >
              <option value="6-speed">6-Speed</option>
              <option value="7-speed">7-Speed (with Reverse)</option>
            </select>
          </Section>
        )}

        {selectedControl.type === "steering" && (
          <Section title="Steering">
            <Slider
              label="Sensitivity"
              min={0.1}
              max={2}
              step={0.05}
              value={selectedControl.config.sensitivity ?? 1}
              onChange={v =>
                updateConfig({ sensitivity: v })
              }
            />

            <Slider
              label="Max Rotation (°)"
              min={180}
              max={1800}
              step={30}
              value={selectedControl.config.maxRotation ?? 900}
              onChange={v =>
                updateConfig({ maxRotation: v })
              }
            />
          </Section>
        )}
      </div>
    </div>
  );
}

/* ====================== UI COMPONENTS ====================== */

function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01
}) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div style={sliderWrap}>
      <div style={sliderHeader}>
        <span>{label}</span>
        <span style={sliderValue}>
          {value.toFixed(3)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(+e.target.value)}
        style={{
          ...slider,
          background: `linear-gradient(
            to right,
            #22c55e 0%,
            #22c55e ${percent}%,
            rgba(255,255,255,.15) ${percent}%,
            rgba(255,255,255,.15) 100%
          )`
        }}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={section}>
      <div style={sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

/* ====================== STYLES ====================== */

const panel = {
  position: "absolute",
  right: 16,
  bottom: 90,
  width: 320,

  /* 🔑 CRITICAL FOR SCROLLING */
  maxHeight: "75vh",
  display: "flex",
  flexDirection: "column",

  borderRadius: 20,
  background: "rgba(18,24,38,.9)",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,.65)",
  zIndex: 500,
  color: "#e5e7eb",
  touchAction: "none"
};

const header = {
  padding: "12px 14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid rgba(255,255,255,.08)",
  cursor: "grab",
  flexShrink: 0   // 🔒 keep header fixed
};

const headerTitle = {
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 0.6,
  opacity: 0.8
};

const closeBtn = {
  background: "transparent",
  color: "#9ca3af",
  fontSize: 16,
  cursor: "pointer"
};

const content = {
  padding: 14,
  display: "flex",
  flexDirection: "column",
  gap: 14,

  /* 🔑 THIS ENABLES SCROLL */
  overflowY: "auto",
  overscrollBehavior: "contain"
};

const section = {
  marginTop: 8,
  paddingTop: 10,
  borderTop: "1px solid rgba(255,255,255,.08)"
};

const sectionTitle = {
  fontSize: 12,
  opacity: 0.6,
  marginBottom: 8,
  letterSpacing: 0.5
};

const label = {
  fontSize: 12,
  opacity: 0.7,
  marginBottom: 4,
  display: "block"
};

const select = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  background: "#020617",
  color: "#e5e7eb",
  border: "1px solid rgba(255,255,255,.12)",
  marginBottom: 10
};

const sliderWrap = {
  display: "flex",
  flexDirection: "column",
  gap: 6
};

const sliderHeader = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: 12,
  opacity: 0.75
};

const sliderValue = {
  fontVariantNumeric: "tabular-nums"
};

const slider = {
  width: "100%",
  height: 6,
  borderRadius: 6,
  appearance: "none",
  outline: "none"
};
