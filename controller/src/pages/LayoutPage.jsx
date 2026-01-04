import { useState, useEffect } from "react";
import { useApp } from "../state/appState";
import NameModal from "../components/NameModal";
import {
  loadLayouts,
  decompressLayout,
  compressLayout,
  saveLayouts,
  deleteLayout,
  renameLayout,
  deleteAllLayouts,
  storagePercentUsed
} from "../utils/layoutStorage";
import defaultLayout from "../layouts/basic"; 

/* ================= EXPORT / IMPORT ================= */

function exportLayout(layout) {
  const payload = {
    app: "controller-layout",
    version: 1,
    exportedAt: Date.now(),
    layout: compressLayout(layout)
  };

  const blob = new Blob(
    [JSON.stringify(payload, null, 2)],
    { type: "application/dr" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${layout.name || "layout"}.dr`;
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importLayout(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (
    data.app !== "controller-layout" ||
    data.version !== 1 ||
    !data.layout
  ) {
    throw new Error("Invalid layout file");
  }

  return decompressLayout(data.layout);
}

/* ================= COMPONENT ================= */

export default function LayoutPage() {
  const { setSelectedLayout, setActiveTab } = useApp();

  const [renameId, setRenameId] = useState(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [saved, setSaved] = useState([]);

  /* ---------- LOAD SAVED LAYOUTS ---------- */
  const refreshSaved = () => {
    setSaved(
      Object.entries(loadLayouts()).map(
        ([id, d]) => ({ id, ...decompressLayout(d) })
      )
    );
  };

  useEffect(() => {
    if (!confirmDeleteAll) {
      refreshSaved();
    }
  }, [confirmDeleteAll]);

  /* ---------- OPEN LAYOUT ---------- */
  const open = id => {
    setSelectedLayout(id);
    setActiveTab("controller");
  };

  return (
    <div style={page}>
      <div style={container}>
        {/* HEADER */}
        <header>
          <div style={title}>Layouts</div>
          <div style={subtitle}>Manage your controller layouts</div>
        </header>

        {/* DEFAULT */}
        <div
          style={layoutCard}
          onClick={() => open(defaultLayout.id)}
        >
          <div style={layoutTitle}>
            {defaultLayout.name}
          </div>
          <div style={layoutDesc}>
            Built-in
          </div>
        </div>

        {/* CUSTOM */}
        {/* CUSTOM */}
        <div style={sectionHeader}>
          <span>Local Storage</span>

          <div style={{ display: "flex", gap: 8 }}>
            {/* IMPORT — ALWAYS AVAILABLE */}
            <label style={btnImport}>
              ⤵ Import
              <input
                type="file"
                accept=".dr"
                hidden
                onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;

                  try {
                    const imported = await importLayout(file);
                    const id = `imported_${Date.now()}`;

                    const all = loadLayouts();
                    all[id] = compressLayout({
                      ...imported,
                      id,
                      baseId: imported.baseId || "basic",
                      name: imported.name || "Imported Layout"
                    });

                    saveLayouts(all);
                    refreshSaved();
                  } catch {
                    alert("Invalid .dr layout file");
                  }

                  e.target.value = "";
                }}
              />
            </label>

            {/* DELETE ALL — ONLY IF THERE ARE LAYOUTS */}
            {saved.length > 0 && (
              <button
                style={deleteAllBtn}
                onClick={() => setConfirmDeleteAll(true)}
              >
                🗑 Delete All
              </button>
            )}
          </div>
        </div>

        {/* LIST OF SAVED LAYOUTS */}
        {saved.length > 0 && saved.map(l => (
          <div key={l.id} style={layoutCard}>
            <div style={layoutTitle}>{l.name}</div>
            <div style={layoutDesc}>
              {l.controls.length} controls
            </div>

            <div style={row}>
              <button style={btnOpen} onClick={() => open(l.id)}>
                Open
              </button>

              <button style={btnRename} onClick={() => setRenameId(l.id)}>
                Rename
              </button>

              <button style={btnExport} onClick={() => exportLayout(l)}>
                Export
              </button>

              <button
                style={btnDelete}
                onClick={() => {
                  if (confirm("Delete this layout?")) {
                    deleteLayout(l.id);
                    setSaved(prev => prev.filter(x => x.id !== l.id));
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}


        {/* STORAGE METER */}
        <div style={meter}>
          Storage {storagePercentUsed().toFixed(1)}%
          <div style={bar}>
            <div
              style={{
                ...fill,
                width: `${storagePercentUsed()}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* RENAME MODAL */}
      {renameId && (
        <NameModal
          title="Rename Layout"
          initialValue={saved.find(l => l.id === renameId)?.name}
          confirmText="Rename"
          successText="✓ Renamed"
          onConfirm={name => {
            renameLayout(renameId, name);
            refreshSaved();
            setRenameId(null);
          }}
          onCancel={() => setRenameId(null)}
        />
      )}

      {/* DELETE ALL MODAL */}
      {confirmDeleteAll && (
        <NameModal
          title="Delete ALL layouts?"
          placeholder='Type "DELETE" to confirm'
          confirmText="Delete All"
          successText="✓ All layouts deleted"
          validate={v => v === "DELETE"}
          onConfirm={() => { }}
          onSuccess={() => {
            deleteAllLayouts();
            setSaved([]);
            setSelectedLayout("basic");
            setConfirmDeleteAll(false);
          }}
          onCancel={() => setConfirmDeleteAll(false)}
        />
      )}
    </div>
  );
}

/* ====================== STYLES ====================== */

const page = {
  height: "calc(100vh - 64px)",
  padding: "24px 16px",
  background: "radial-gradient(circle at top,#020617,#000)"
};

const container = {
  maxWidth: 520,
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: 18
};

const title = { fontSize: 22, fontWeight: 800 };
const subtitle = { fontSize: 13, opacity: 0.6 };

const sectionHeader = {
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  fontWeight: 700,
  opacity: 0.8
};

const deleteAllBtn = {
  background: "linear-gradient(180deg,#ef4444,#991b1b)",
  color: "#fff",
  borderRadius: 999,
  padding: "6px 12px",
  fontWeight: 700,
  cursor: "pointer",
  border: "none"
};

const layoutCard = {
  padding: 20,
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,.08)",
  background:
    "linear-gradient(180deg,rgba(37,99,235,.22),rgba(37,99,235,.04))"
};

const layoutTitle = { fontSize: 16, fontWeight: 700 };
const layoutDesc = { fontSize: 13, opacity: 0.65 };

const row = {
  marginTop: 10,
  display: "flex",
  gap: 8,
  flexWrap: "wrap"
};

const meter = {
  marginTop: 20,
  fontSize: 12,
  opacity: 0.7
};

const bar = {
  height: 6,
  background: "#020617",
  borderRadius: 6,
  overflow: "hidden",
  marginTop: 6
};

const fill = {
  height: "100%",
  background: "#22c55e"
};

const btnBase = {
  padding: "6px 12px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  border: "none"
};

const btnOpen = {
  ...btnBase,
  background: "linear-gradient(180deg,#3b82f6,#1e40af)",
  color: "#fff"
};

const btnRename = {
  ...btnBase,
  background: "linear-gradient(180deg,#f59e0b,#b45309)",
  color: "#fff"
};

const btnExport = {
  ...btnBase,
  background: "linear-gradient(180deg,#22c55e,#15803d)",
  color: "#fff"
};

const btnDelete = {
  ...btnBase,
  background: "linear-gradient(180deg,#ef4444,#991b1b)",
  color: "#fff"
};

const btnImport = {
  ...btnBase,
  background: "linear-gradient(180deg,#22c55e,#15803d)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center"
};
