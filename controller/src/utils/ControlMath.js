import { applyCurve } from "./axiscurves";

/* ================= BASIC UTILS ================= */

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

/* ================= AXIS PROCESSING ================= */

export function applyDeadzoneAndRange(value, config = {}) {
  const { deadzone = 0, range = 1.0, curve } = config;

  let v = value;

  // deadzone
  if (Math.abs(v) < deadzone) return 0;

  // normalize after deadzone
  v =
    Math.sign(v) *
    ((Math.abs(v) - deadzone) / (1 - deadzone));

  // apply curve
  const curved = applyCurve(v, curve);

  // 🔑 RENORMALIZE TO FULL RANGE
  const max = Math.abs(applyCurve(1, curve)) || 1;
  const normalized = curved / max;

  return clamp(normalized * range, -1, 1);
}
