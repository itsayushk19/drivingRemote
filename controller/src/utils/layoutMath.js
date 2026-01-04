export function rect(c) {
  return {
    left: c.x,
    top: c.y,
    right: c.x + c.w,
    bottom: c.y + c.h
  };
}

export function overlaps(a, b) {
  return !(
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}
export function clampToScreen(c) {
  return {
    ...c,
    x: Math.min(Math.max(c.x, 0), 1 - c.w),
    y: Math.min(Math.max(c.y, 0), 1 - c.h)
  };
}
