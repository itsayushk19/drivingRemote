import { useEffect, useRef } from "react";
import { useApp } from "../state/appState";
import { connectWS, getWS } from "./ws";

export default function useControlSender() {
  const { controlPayload } = useApp();
  const payload = useRef(null);
  const last = useRef(0);
  const run = useRef(true);

  useEffect(() => {
    payload.current = controlPayload;
  }, [controlPayload]);

  useEffect(() => {
    connectWS();
    run.current = true;

    const loop = (t) => {
      if (!run.current) return;
      if (t - last.current >= 16) {
        last.current = t;
        const ws = getWS();
        if (ws?.readyState === WebSocket.OPEN && payload.current) {
          ws.send(JSON.stringify({ type: "controls", data: payload.current }));
        }
      }
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
    return () => (run.current = false);
  }, []);
}
