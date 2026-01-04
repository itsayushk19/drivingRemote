import { AppProvider, useApp } from "./state/appState";

import ConnectionPage from "./pages/ConnectionPage";
import LayoutPage from "./pages/LayoutPage";
import BottomBar from "./components/BottomBar";
import ControllerPage from "./pages/ControllerPage";
import useControlSender from "./network/useControlSender";

import { useState, useEffect } from "react";

function Screen({ barCollapsed, setBarCollapsed }) {
  const { activeTab } = useApp();
  useControlSender();

  // Auto-collapse when entering controller
  useEffect(() => {
    if (activeTab === "controller") {
      setBarCollapsed(true);
    }
  }, [activeTab, setBarCollapsed]);

  return (
    <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
      {activeTab === "connection" && <ConnectionPage />}
      {activeTab === "layout" && <LayoutPage />}
      {activeTab === "controller" && (
        <ControllerPage openMenu={() => setBarCollapsed(false)} />
      )}
    </div>
  );
}

export default function App() {
  const [barCollapsed, setBarCollapsed] = useState(false);

  return (
    <AppProvider>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#000",
          color: "#fff",
          overflow: "hidden"
        }}
      >
        <Screen
          barCollapsed={barCollapsed}
          setBarCollapsed={setBarCollapsed}
        />

        <BottomBar
          collapsed={barCollapsed}
          setCollapsed={setBarCollapsed}
        />
      </div>
    </AppProvider>
  );
}
