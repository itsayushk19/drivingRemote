/**
 * Control Registry System
 * 
 * This module defines the standardized control type system used throughout the application.
 * Each control type has a schema that defines its properties, validation rules, and defaults.
 */

/**
 * Base control schema - properties common to all control types
 */
const BASE_CONTROL_SCHEMA = {
  id: { type: 'string', required: true },
  type: { type: 'string', required: true },
  x: { type: 'number', required: true, min: 0, max: 1, default: 0.5 },
  y: { type: 'number', required: true, min: 0, max: 1, default: 0.5 },
  w: { type: 'number', required: true, min: 0.05, max: 1, default: 0.2 },
  h: { type: 'number', required: true, min: 0.05, max: 1, default: 0.2 },
};

/**
 * Control type definitions
 */
export const CONTROL_TYPES = {
  steering: {
    name: 'Steering Wheel',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      skin: { type: 'string', default: '/skins/steering.png' },
      config: {
        type: 'object',
        required: true,
        properties: {
          axis: { type: 'string', required: true, enum: ['X', 'Y', 'Z', 'RX', 'RY', 'RZ'], default: 'X' },
          mode: { type: 'string', required: true, enum: ['centered', 'normal'], default: 'centered' },
          deadzone: { type: 'number', min: 0, max: 0.5, default: 0.02 },
          range: { type: 'number', min: 0.1, max: 1, default: 1.0 },
          sensitivity: { type: 'number', min: 0.1, max: 5, default: 1.0 },
          maxRotation: { type: 'number', min: 90, max: 1800, default: 900 },
          curve: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['linear', 'soft-center', 'expo'], default: 'soft-center' },
              amount: { type: 'number', min: 0, max: 5, default: 0.6 }
            }
          }
        }
      }
    },
    defaultConfig: {
      axis: 'X',
      mode: 'centered',
      deadzone: 0.02,
      range: 1.0,
      sensitivity: 1.0,
      maxRotation: 900,
      curve: { type: 'soft-center', amount: 0.6 }
    }
  },

  pedal: {
    name: 'Pedal/Slider',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      config: {
        type: 'object',
        required: true,
        properties: {
          axis: { type: 'string', required: true, enum: ['X', 'Y', 'Z', 'RX', 'RY', 'RZ', 'SLIDER1', 'SLIDER2'], default: 'Y' },
          mode: { type: 'string', required: true, enum: ['centered', 'normal'], default: 'normal' },
          deadzone: { type: 'number', min: 0, max: 0.5, default: 0.02 },
          range: { type: 'number', min: 0.1, max: 1, default: 1.0 },
          orientation: { type: 'string', enum: ['vertical', 'horizontal'], default: 'vertical' },
          snapBack: { type: 'boolean', default: false },
          curve: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['linear', 'expo'], default: 'expo' },
              amount: { type: 'number', min: 1, max: 5, default: 2.0 }
            }
          }
        }
      }
    },
    defaultConfig: {
      axis: 'Y',
      mode: 'normal',
      deadzone: 0.02,
      range: 1.0,
      orientation: 'vertical',
      snapBack: false,
      curve: { type: 'expo', amount: 2.0 }
    }
  },

  button: {
    name: 'Button',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      label: { type: 'string', default: 'BTN' },
      config: {
        type: 'object',
        required: true,
        properties: {
          button: { type: 'number', required: true, min: 1, max: 32, default: 1 },
          type: { type: 'string', enum: ['momentary', 'toggle'], default: 'momentary' }
        }
      }
    },
    defaultConfig: {
      button: 1,
      type: 'momentary'
    }
  },

  joystick: {
    name: 'Joystick',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      config: {
        type: 'object',
        required: true,
        properties: {
          axisX: { type: 'string', required: true, enum: ['X', 'Y', 'Z', 'RX', 'RY', 'RZ'], default: 'RX' },
          axisY: { type: 'string', required: true, enum: ['X', 'Y', 'Z', 'RX', 'RY', 'RZ'], default: 'RY' },
          mode: { type: 'string', required: true, enum: ['centered', 'normal'], default: 'centered' },
          deadzoneX: { type: 'number', min: 0, max: 0.5, default: 0.1 },
          deadzoneY: { type: 'number', min: 0, max: 0.5, default: 0.1 },
          rangeX: { type: 'number', min: 0.1, max: 1, default: 1.0 },
          rangeY: { type: 'number', min: 0.1, max: 1, default: 1.0 },
          gate: { type: 'string', enum: ['circular', 'square'], default: 'circular' },
          returnToCenter: { type: 'boolean', default: true },
          curveX: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['linear', 'expo'], default: 'linear' },
              amount: { type: 'number', min: 1, max: 5, default: 1.0 }
            }
          },
          curveY: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['linear', 'expo'], default: 'linear' },
              amount: { type: 'number', min: 1, max: 5, default: 1.0 }
            }
          }
        }
      }
    },
    defaultConfig: {
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
  },

  hshifter: {
    name: 'H-Shifter',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      config: {
        type: 'object',
        required: true,
        properties: {
          rows: { type: 'number', min: 1, max: 4, default: 2 },
          columns: { type: 'number', min: 2, max: 4, default: 3 },
          endpoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                row: { type: 'number', min: 0 },
                col: { type: 'number', min: 0 },
                value: { type: 'string' },
                button: { type: 'number', min: 1, max: 32 }
              }
            }
          },
          neutralButton: { type: 'number', min: 1, max: 32, default: null },
          visualStyle: { type: 'string', enum: ['classic', 'modern'], default: 'classic' }
        }
      }
    },
    defaultConfig: {
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
  }
};

/**
 * Validate a control object against its schema
 */
export function validateControl(control) {
  const errors = [];

  if (!control || typeof control !== 'object') {
    errors.push('Control must be an object');
    return { valid: false, errors };
  }

  if (!control.type || !CONTROL_TYPES[control.type]) {
    errors.push(`Invalid or missing control type: ${control.type}`);
    return { valid: false, errors };
  }

  const schema = CONTROL_TYPES[control.type].schema;

  // Validate base properties
  for (const [key, rules] of Object.entries(schema)) {
    if (rules.required && control[key] === undefined) {
      errors.push(`Missing required property: ${key}`);
    }

    if (control[key] !== undefined) {
      if (rules.type === 'number') {
        if (typeof control[key] !== 'number') {
          errors.push(`Property ${key} must be a number`);
        } else {
          if (rules.min !== undefined && control[key] < rules.min) {
            errors.push(`Property ${key} must be >= ${rules.min}`);
          }
          if (rules.max !== undefined && control[key] > rules.max) {
            errors.push(`Property ${key} must be <= ${rules.max}`);
          }
        }
      }

      if (rules.enum && !rules.enum.includes(control[key])) {
        errors.push(`Property ${key} must be one of: ${rules.enum.join(', ')}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a new control with default values
 */
export function createControl(type, overrides = {}) {
  const controlType = CONTROL_TYPES[type];
  if (!controlType) {
    throw new Error(`Unknown control type: ${type}`);
  }

  const id = overrides.id || `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const control = {
    id,
    type,
    x: overrides.x ?? 0.5,
    y: overrides.y ?? 0.5,
    w: overrides.w ?? 0.2,
    h: overrides.h ?? 0.2,
    config: { ...controlType.defaultConfig, ...(overrides.config || {}) },
    ...overrides
  };

  return control;
}

/**
 * Get available axes for assignment
 */
export function getAvailableAxes() {
  return ['X', 'Y', 'Z', 'RX', 'RY', 'RZ', 'SLIDER1', 'SLIDER2'];
}

/**
 * Get all control types
 */
export function getControlTypes() {
  return Object.keys(CONTROL_TYPES);
}

/**
 * Get control type metadata
 */
export function getControlTypeMeta(type) {
  return CONTROL_TYPES[type] || null;
}
