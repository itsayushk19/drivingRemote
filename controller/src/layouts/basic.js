export default {
  id: "ATS/ETS2-SEQUENTIAL",
  name: "ATS / ETS2 Sequential",
  controls: [
    {
      id: "steer",
      type: "steering",
      x: 0.05,
      y: 0.2,
      w: 0.4,
      h: 0.55,
      skin: "/skins/steering.png",
      config: {
        axis: "X",
        mode: "centered",
        deadzone: 0.02,
        range: 1.0,
        sensitivity: 1.0,
        maxRotation: 900,

        curve: {
          type: "soft-center",
          amount: 0.6
        }
      }
    },

    {
      id: "throttle",
      type: "pedal",
      x: 0.8,
      y: 0.3,
      w: 0.05,
      h: 0.4,
      config: {
        axis: "Y",
        mode: "normal",
        deadzone: 0.02,
        range: 1.0,
        curve: {
          type: "expo",
          amount: 2.2
        }
      }
    },

    {
      id: "brake",
      type: "pedal",
      x: 0.72,
      y: 0.3,
      w: 0.05,
      h: 0.4,
      config: {
        axis: "Z",
        mode: "normal",
        deadzone: 0.02,
        range: 1.0,
        curve: {
          type: "expo",
          amount: 2
        }
      }
    },

    {
      id: "horn",
      type: "button",
      x: 0.55,
      y: 0.6,
      w: 0.12,
      h: 0.12,
      label: "HORN",
      config: { button: 1, type: "momentary" }
    },

    {
      id: "gear_up",
      type: "button",
      x: 0.55,
      y: 0.25,
      w: 0.12,
      h: 0.12,
      label: "GEAR +",
      config: { button: 2, type: "momentary" }
    },

    {
      id: "gear_down",
      type: "button",
      x: 0.55,
      y: 0.40,
      w: 0.12,
      h: 0.12,
      label: "GEAR -",
      config: { button: 3, type: "momentary" }
    }
  ]
};
