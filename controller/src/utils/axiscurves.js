/**
 * Applies a response curve to a normalized axis value.
 * Input range:  [-1, 1]
 * Output range: [-1, 1]
 */
export function applyCurve(x, curve) {
  if (!curve || curve.type === "linear") return x;

  const s = Math.sign(x);
  const a = Math.abs(x);

  switch (curve.type) {
    case "linear":
      return x;

    case "expo": {
      // amount > 1 softens center
      const k = curve.amount ?? 2;
      return s * Math.pow(a, k);
    }

    case "cubic":
      return x * x * x;

    case "soft-center": {
      // amount controls how soft the center feels
      const k = curve.amount ?? 0.5;
      return s * (a / (a + k));
    }

    case "custom": {
      // points: [{ x: 0..1, y: 0..1 }]
      const pts = curve.points;
      if (!pts || pts.length < 2) return x;

      for (let i = 1; i < pts.length; i++) {
        if (a <= pts[i].x) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const t = (a - p0.x) / (p1.x - p0.x);
          return s * (p0.y + t * (p1.y - p0.y));
        }
      }

      return s * pts[pts.length - 1].y;
    }

    default:
      return x;
  }
}
