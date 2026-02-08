import { useState, useRef } from "react";

/**
 * H-Shifter Control Component
 * 
 * Grid-based shifter with configurable gate pattern
 */
export default function HShifter({ control, editMode, onChange }) {
  const [selectedGear, setSelectedGear] = useState(null);
  const [hoveredGear, setHoveredGear] = useState(null);
  const containerRef = useRef(null);

  const {
    rows = 2,
    columns = 3,
    endpoints = [],
    neutralButton = null,
    visualStyle = 'classic'
  } = control.config ?? {};

  const handleGearSelect = (gear) => {
    if (editMode) return;

    setSelectedGear(gear);

    // Create button states object
    const buttonStates = {};
    
    // Set neutral if no gear selected
    if (!gear && neutralButton) {
      buttonStates[neutralButton] = true;
    }
    
    // Set selected gear button
    if (gear && gear.button) {
      buttonStates[gear.button] = true;
    }

    onChange(control.id, {
      gear: gear ? gear.value : 'N',
      buttons: buttonStates
    });
  };

  const handlePointerDown = (e, gear) => {
    if (editMode) return;
    handleGearSelect(gear);
  };

  const handlePointerUp = () => {
    if (editMode) return;
    // Return to neutral
    handleGearSelect(null);
  };

  // Calculate grid layout
  const cellWidth = 100 / (columns + 1);
  const cellHeight = 100 / (rows + 1);

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div style={styles.shifter}>
        {/* Grid background */}
        <svg style={styles.svg} viewBox={`0 0 ${(columns + 1) * 50} ${(rows + 1) * 50}`}>
          {/* Grid lines */}
          {Array.from({ length: rows }).map((_, row) => (
            <line
              key={`row-${row}`}
              x1="25"
              y1={(row + 1) * 50}
              x2={(columns + 0.5) * 50}
              y2={(row + 1) * 50}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}
          {Array.from({ length: columns + 1 }).map((_, col) => (
            <line
              key={`col-${col}`}
              x1={(col + 0.5) * 50}
              y1="25"
              x2={(col + 0.5) * 50}
              y2={(rows + 0.5) * 50}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          ))}

          {/* Gate pattern */}
          {endpoints.map((endpoint, idx) => {
            const nextInCol = endpoints.find(
              (e, i) => i > idx && e.col === endpoint.col && e.row > endpoint.row
            );

            if (nextInCol) {
              return (
                <line
                  key={`gate-${idx}`}
                  x1={(endpoint.col + 0.5) * 50}
                  y1={(endpoint.row + 1) * 50}
                  x2={(nextInCol.col + 0.5) * 50}
                  y2={(nextInCol.row + 1) * 50}
                  stroke="rgba(100,150,255,0.4)"
                  strokeWidth="3"
                />
              );
            }
            return null;
          })}
        </svg>

        {/* Gear positions */}
        {endpoints.map((endpoint, idx) => {
          const isSelected = selectedGear?.value === endpoint.value;
          const isHovered = hoveredGear?.value === endpoint.value;

          return (
            <div
              key={idx}
              style={{
                ...styles.gearSlot,
                left: `${(endpoint.col + 0.5) * cellWidth}%`,
                top: `${(endpoint.row + 1) * cellHeight}%`
              }}
              onPointerDown={(e) => handlePointerDown(e, endpoint)}
              onPointerEnter={() => setHoveredGear(endpoint)}
              onPointerLeave={() => setHoveredGear(null)}
            >
              <div
                style={{
                  ...styles.gearDot,
                  ...(isSelected ? styles.gearDotActive : {}),
                  ...(isHovered && !isSelected ? styles.gearDotHover : {})
                }}
              />
              <div
                style={{
                  ...styles.gearLabel,
                  ...(isSelected ? styles.gearLabelActive : {})
                }}
              >
                {endpoint.value}
              </div>
            </div>
          );
        })}

        {/* Neutral position (center) */}
        <div
          style={{
            ...styles.neutral,
            left: '50%',
            top: '50%'
          }}
        >
          <div
            style={{
              ...styles.neutralDot,
              ...(selectedGear === null ? styles.neutralDotActive : {})
            }}
          />
          <div style={styles.neutralLabel}>N</div>
        </div>

        {/* Current gear display */}
        <div style={styles.currentGear}>
          {selectedGear ? selectedGear.value : 'N'}
        </div>
      </div>
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
  shifter: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(30,30,50,0.9), rgba(10,10,20,0.95))',
    borderRadius: '12px',
    border: '2px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
    overflow: 'hidden'
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  gearSlot: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    cursor: 'pointer',
    touchAction: 'none'
  },
  gearDot: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(100,150,255,0.3)',
    border: '2px solid rgba(100,150,255,0.5)',
    transition: 'all 0.15s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  },
  gearDotHover: {
    background: 'rgba(100,150,255,0.5)',
    border: '2px solid rgba(100,150,255,0.7)',
    transform: 'scale(1.1)'
  },
  gearDotActive: {
    background: 'rgba(100,200,255,0.9)',
    border: '2px solid rgba(150,220,255,1)',
    boxShadow: '0 0 12px rgba(100,200,255,0.8), 0 2px 4px rgba(0,0,0,0.3)',
    transform: 'scale(1.2)'
  },
  gearLabel: {
    position: 'absolute',
    top: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.6)',
    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
    transition: 'color 0.15s ease',
    pointerEvents: 'none'
  },
  gearLabelActive: {
    color: 'rgba(100,200,255,1)',
    textShadow: '0 0 8px rgba(100,200,255,0.8)'
  },
  neutral: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none'
  },
  neutralDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: 'rgba(200,200,200,0.3)',
    border: '2px solid rgba(200,200,200,0.5)',
    transition: 'all 0.15s ease'
  },
  neutralDotActive: {
    background: 'rgba(200,220,255,0.7)',
    border: '2px solid rgba(220,240,255,0.9)',
    boxShadow: '0 0 8px rgba(200,220,255,0.6)'
  },
  neutralLabel: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '10px',
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    pointerEvents: 'none'
  },
  currentGear: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'rgba(100,200,255,0.9)',
    textShadow: '0 0 12px rgba(100,200,255,0.6), 0 2px 4px rgba(0,0,0,0.5)',
    fontFamily: 'monospace',
    pointerEvents: 'none'
  }
};
