import { createContext, useContext, useEffect, useRef, useState } from "react";
import { connectWS, disconnectWS } from "../network/ws";

const AppContext = createContext(undefined);
const LATENCY_WINDOW = 30;
const LAST_LAYOUT_KEY = "__last_selected_layout";

export function AppProvider({ children }) {
  /* ===================== CORE STATE ===================== */
  const [activeTab, setActiveTab] = useState("connection");
  const [connected, setConnected] = useState(false);

  const [latency, setLatency] = useState(null);
  const [controlPayload, setControlPayload] = useState(null);

  const [serverUrl, setServerUrl] = useState(
    `ws://${location.hostname}:8000/ws`
  );

  /* ===================== LAYOUT IDENTITY (🔑 FIX) ===================== */
  const [selectedLayout, setSelectedLayout] = useState(() =>
    localStorage.getItem(LAST_LAYOUT_KEY) || "basic"
  );

  // persist layout selection
  useEffect(() => {
    localStorage.setItem(LAST_LAYOUT_KEY, selectedLayout);
  }, [selectedLayout]);

  /* ===================== LATENCY ===================== */
  const latencyHistory = useRef([]);
  const pingIntervalRef = useRef(null);

  /* ===================== CONNECT ===================== */
  const connect = () => {
    disconnect();

    const ws = connectWS(serverUrl);
    if (!ws) return;

    ws.onopen = () => {
      setConnected(true);

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "ping",
              t: performance.now()
            })
          );
        }
      }, 1000);
    };

    ws.onclose = () => {
      setConnected(false);
      setLatency(null);
      latencyHistory.current = [];
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "pong") {
          const rtt = Math.round(performance.now() - msg.t);

          latencyHistory.current.push(rtt);
          if (latencyHistory.current.length > LATENCY_WINDOW) {
            latencyHistory.current.shift();
          }

          setLatency(rtt);
        }
      } catch {
        // ignore malformed packets
      }
    };

    ws.onerror = e => {
      console.log("🌐 WS ERROR", e);
    };
  };

  /* ===================== DISCONNECT ===================== */
  const disconnect = () => {
    clearInterval(pingIntervalRef.current);
    pingIntervalRef.current = null;

    disconnectWS();
    setConnected(false);
    setLatency(null);
    latencyHistory.current = [];
  };

  /* ===================== CONTEXT ===================== */
  const value = {
    /* navigation */
    activeTab,
    setActiveTab,

    /* layout identity */
    selectedLayout,
    setSelectedLayout,

    /* connection */
    connected,
    latency,

    serverUrl,
    setServerUrl,

    connect,
    disconnect,

    /* controls */
    controlPayload,
    setControlPayload
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return ctx;
}
