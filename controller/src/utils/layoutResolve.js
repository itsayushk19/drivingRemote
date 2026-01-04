import { rect, overlaps } from "./layoutMath";
import { clampToScreen } from "./layoutMath";

export function resolveOverlaps(controls, movedId) {
  const updated = controls.map(c => ({ ...c }));

  const moved = updated.find(c => c.id === movedId);
  if (!moved) return updated;

  for (const other of updated) {
    if (other.id === moved.id) continue;

    const r1 = rect(moved);
    const r2 = rect(other);

    if (overlaps(r1, r2)) {
      // Push both slightly toward center
      const push = 0.03;

      other.x += (other.x < 0.5 ? -push : push);
      other.y += (other.y < 0.5 ? -push : push);

      Object.assign(other, clampToScreen(other));
    }
  }

  return updated;
}
