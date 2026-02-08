import { useRef, useState } from "react";
import { applyDeadzoneAndRange } from "../../utils/ControlMath";

/**
 * Joystick Control Component
 * 
 * A 2-axis analog input control with configurable gate type and return-to-center behavior
 */
export default function Joystick({ control, editMode, onChange }) {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const {
    axisX = 'RX',
    axisY = 'RY',
    mode = 'centered',
    deadzoneX = 0.1,
    deadzoneY = 0.1,
    rangeX = 1.0,
    rangeY = 1.0,
    gate = 'circular',
    returnToCenter = true,
    curveX = { type: 'linear', amount: 1.0 },
    curveY = { type: 'linear', amount: 1.0 }
  } = control.config ?? {};

  const handlePointerDown = (e) => {
    if (editMode) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e) => {
    if (!dragging.current || editMode) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate relative position (-1 to 1)
    let x = (e.clientX - rect.left - centerX) / centerX;
    let y = (e.clientY - rect.top - centerY) / centerY;

    // Apply gate constraint
    if (gate === 'circular') {
      const distance = Math.sqrt(x * x + y * y);
      if (distance > 1) {
        x /= distance;
        y /= distance;
      }
    } else {
      // Square gate
      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));
    }

    setPosition({ x, y });

    // Apply deadzone and curve for X axis
    const configX = {
      deadzone: deadzoneX,
      range: rangeX,
      curve: curveX,
      mode: mode
    };
    const valueX = applyDeadzoneAndRange(x, configX);

    // Apply deadzone and curve for Y axis
    const configY = {
      deadzone: deadzoneY,
      range: rangeY,
      curve: curveY,
      mode: mode
    };
    const valueY = applyDeadzoneAndRange(-y, configY); // Invert Y for intuitive up/down

    // Send both axis values
    onChange(control.id, { x: valueX, y: valueY, axisX, axisY });
  };

  const handlePointerUp = (e) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    if (returnToCenter) {
      setPosition({ x: 0, y: 0 });
      onChange(control.id, { x: 0, y: 0, axisX, axisY });
    }
  };

  // Calculate stick position for rendering
  const stickX = position.x * 50; // 50% is max distance from center
  const stickY = position.y * 50;

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Base */}
      <div style={styles.base}>
        {/* Gate indicator */}
        <div style={{
          ...styles.gate,
          borderRadius: gate === 'circular' ? '50%' : '8px'
        }} />
        
        {/* Center crosshair */}
        <div style={styles.crosshair}>
          <div style={styles.crosshairH} />
          <div style={styles.crosshairV} />
        </div>

        {/* Stick */}
        <div
          style={{
            ...styles.stick,
            transform: `translate(calc(-50% + ${stickX}%), calc(-50% + ${stickY}%))`
          }}
        >
          <div style={styles.stickTop} />
        </div>
      </div>

      {/* Label */}
      {!editMode && (
        <div style={styles.label}>
          {axisX} / {axisY}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'none',
    userSelect: 'none'
  },
  base: {
    position: 'relative',
    width: '100%',
    height: '100%',
    maxWidth: '200px',
    maxHeight: '200px',
    aspectRatio: '1',
    background: 'radial-gradient(circle, rgba(30,30,50,0.9), rgba(10,10,20,0.95))',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)'
  },
  gate: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '80%',
    height: '80%',
    border: '1px dashed rgba(255,255,255,0.15)',
    pointerEvents: 'none'
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'
  },
  crosshairH: {
    position: 'absolute',
    width: '30px',
    height: '1px',
    background: 'rgba(255,255,255,0.2)',
    top: '50%',
    left: '-15px'
  },
  crosshairV: {
    position: 'absolute',
    width: '1px',
    height: '30px',
    background: 'rgba(255,255,255,0.2)',
    left: '50%',
    top: '-15px'
  },
  stick: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '25%',
    height: '25%',
    minWidth: '30px',
    minHeight: '30px',
    maxWidth: '50px',
    maxHeight: '50px',
    transition: 'transform 0.05s ease-out',
    pointerEvents: 'none'
  },
  stickTop: {
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 30% 30%, rgba(100,150,255,0.9), rgba(50,80,200,0.95))',
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)'
  },
  label: {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    pointerEvents: 'none'
  }
};
