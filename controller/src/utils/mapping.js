export function resolveButtonMappings(controls) {
  const used = new Set();
  const MAX_BUTTONS = 32;

  // collect already assigned buttons
  controls.forEach(c => {
    if (c.type === "button" && c.config?.button != null) {
      used.add(c.config.button);
    }
  });

  let nextFree = 1;
  const updated = [];

  for (const c of controls) {
    if (c.type !== "button") {
      updated.push(c);
      continue;
    }

    let btn = c.config?.button;

    // conflict or missing
    if (btn == null || used.has(btn) && used.has(btn + "_dup")) {
      while (used.has(nextFree) && nextFree <= MAX_BUTTONS) {
        nextFree++;
      }

      btn = nextFree;
      used.add(btn);

      updated.push({
        ...c,
        config: { ...c.config, button: btn }
      });

      console.log(`🟡 Auto-assigned ${c.id} → vJoy Button ${btn}`);
    } else {
      updated.push(c);
      used.add(btn);
    }
  }

  return updated;
}
