# Control Registry System

The Control Registry defines all available control types in the Driving Remote Controller application.

## Overview

Each control type is defined with a standardized schema that includes:
- **Type identifier**: Unique name for the control type
- **Schema**: Properties and their validation rules
- **Default configuration**: Default values for new controls

## Control Types

### 1. Steering Wheel

**Type**: `steering`

**Description**: Rotation-based steering control with configurable range and response curves.

**Properties**:
- `axis`: Target axis (X, Y, Z, RX, RY, RZ)
- `mode`: centered (default) or normal
- `deadzone`: Deadzone value (0.0 - 0.5)
- `range`: Range multiplier (0.1 - 1.0)
- `sensitivity`: Sensitivity multiplier (0.1 - 5.0)
- `maxRotation`: Maximum rotation in degrees (90 - 1800)
- `curve.type`: Response curve (linear, soft-center, expo)
- `curve.amount`: Curve intensity (0 - 5)

**Default Configuration**:
```javascript
{
  axis: 'X',
  mode: 'centered',
  deadzone: 0.02,
  range: 1.0,
  sensitivity: 1.0,
  maxRotation: 900,
  curve: { type: 'soft-center', amount: 0.6 }
}
```

### 2. Pedal/Slider

**Type**: `pedal`

**Description**: Linear sliding control for throttle, brake, or other analog inputs.

**Properties**:
- `axis`: Target axis (X, Y, Z, RX, RY, RZ, SLIDER1, SLIDER2)
- `mode`: centered or normal (default)
- `deadzone`: Deadzone value (0.0 - 0.5)
- `range`: Range multiplier (0.1 - 1.0)
- `orientation`: vertical (default) or horizontal
- `snapBack`: Auto-return to zero (boolean)
- `curve.type`: Response curve (linear, expo)
- `curve.amount`: Curve intensity (1 - 5)

**Default Configuration**:
```javascript
{
  axis: 'Y',
  mode: 'normal',
  deadzone: 0.02,
  range: 1.0,
  orientation: 'vertical',
  snapBack: false,
  curve: { type: 'expo', amount: 2.0 }
}
```

### 3. Button

**Type**: `button`

**Description**: Digital on/off input control.

**Properties**:
- `button`: Button number (1 - 32)
- `type`: momentary (default) or toggle

**Default Configuration**:
```javascript
{
  button: 1,
  type: 'momentary'
}
```

### 4. Joystick

**Type**: `joystick`

**Description**: 2-axis analog input with independent X/Y configuration.

**Properties**:
- `axisX`: X-axis target (X, Y, Z, RX, RY, RZ)
- `axisY`: Y-axis target (X, Y, Z, RX, RY, RZ)
- `mode`: centered (default) or normal
- `deadzoneX`: X-axis deadzone (0.0 - 0.5)
- `deadzoneY`: Y-axis deadzone (0.0 - 0.5)
- `rangeX`: X-axis range (0.1 - 1.0)
- `rangeY`: Y-axis range (0.1 - 1.0)
- `gate`: circular (default) or square
- `returnToCenter`: Auto-return behavior (boolean)
- `curveX.type`: X-axis curve (linear, expo)
- `curveX.amount`: X-axis curve intensity
- `curveY.type`: Y-axis curve (linear, expo)
- `curveY.amount`: Y-axis curve intensity

**Default Configuration**:
```javascript
{
  axisX: 'RX',
  axisY: 'RY',
  mode: 'centered',
  deadzoneX: 0.1,
  deadzoneY: 0.1,
  rangeX: 1.0,
  rangeY: 1.0,
  gate: 'circular',
  returnToCenter: true,
  curveX: { type: 'linear', amount: 1.0 },
  curveY: { type: 'linear', amount: 1.0 }
}
```

### 5. H-Shifter

**Type**: `hshifter`

**Description**: Grid-based gear shifter with configurable gate patterns.

**Properties**:
- `rows`: Number of horizontal rails (1 - 4)
- `columns`: Number of vertical positions (2 - 4)
- `endpoints`: Array of gear positions
  - Each endpoint: `{ row, col, value, button }`
- `neutralButton`: Button number for neutral (1 - 32)
- `visualStyle`: classic (default) or modern

**Default Configuration** (Standard 6-speed + R):
```javascript
{
  rows: 2,
  columns: 3,
  endpoints: [
    { row: 0, col: 0, value: '1', button: 10 },
    { row: 1, col: 0, value: '2', button: 11 },
    { row: 0, col: 1, value: '3', button: 12 },
    { row: 1, col: 1, value: '4', button: 13 },
    { row: 0, col: 2, value: '5', button: 14 },
    { row: 1, col: 2, value: '6', button: 15 },
    { row: 0, col: 3, value: 'R', button: 16 }
  ],
  neutralButton: 9,
  visualStyle: 'classic'
}
```

## Using the Control Registry

### Creating a New Control

```javascript
import { createControl } from './services/controlRegistry';

// Create a steering wheel with defaults
const steering = createControl('steering');

// Create a joystick with custom position
const joystick = createControl('joystick', {
  x: 0.8,
  y: 0.5,
  w: 0.15,
  h: 0.15
});

// Create a button with custom config
const hornButton = createControl('button', {
  x: 0.5,
  y: 0.7,
  label: 'HORN',
  config: { button: 5, type: 'momentary' }
});
```

### Validating a Control

```javascript
import { validateControl } from './services/controlRegistry';

const result = validateControl(myControl);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### Getting Control Metadata

```javascript
import { getControlTypeMeta, getControlTypes } from './services/controlRegistry';

// Get all available control types
const types = getControlTypes(); // ['steering', 'pedal', 'button', 'joystick', 'hshifter']

// Get metadata for a specific type
const meta = getControlTypeMeta('steering');
console.log(meta.name); // "Steering Wheel"
console.log(meta.defaultConfig); // { axis: 'X', mode: 'centered', ... }
```

## Base Control Properties

All controls share these base properties:

- `id` (string, required): Unique identifier
- `type` (string, required): Control type identifier
- `x` (number, 0-1): X position as percentage of screen width
- `y` (number, 0-1): Y position as percentage of screen height
- `w` (number, 0.05-1): Width as percentage of screen width
- `h` (number, 0.05-1): Height as percentage of screen height

## Response Curves

### Linear
- No modification to input value
- Direct 1:1 mapping

### Soft Center
- Reduces sensitivity near center
- Makes fine adjustments easier
- Used for steering wheels

### Exponential (Expo)
- Increases sensitivity away from center
- Better control at low inputs
- Used for throttle/brake pedals

## Axis Mapping

Available axes:
- `X`: Typically steering
- `Y`: Typically throttle
- `Z`: Typically brake
- `RX`: Rotation X (joystick)
- `RY`: Rotation Y (joystick)
- `RZ`: Rotation Z
- `SLIDER1`: Slider 1
- `SLIDER2`: Slider 2

## Extending the Registry

To add a new control type:

1. Define the schema in `controlRegistry.js`
2. Create the React component in `components/controls/`
3. Add the component to `ControlRenderer.jsx`
4. Update this documentation

Example:
```javascript
// In controlRegistry.js
export const CONTROL_TYPES = {
  ...existing types...,
  
  myNewControl: {
    name: 'My New Control',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      // Add custom properties
      customProp: { type: 'number', default: 0 },
      config: {
        type: 'object',
        required: true,
        properties: {
          // Define config properties
        }
      }
    },
    defaultConfig: {
      // Define defaults
    }
  }
};
```
