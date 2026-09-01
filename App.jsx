import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "choral-ledger:pieces";

const STATUSES = [
  { key: "idea", label: "Idea", color: "#5B6770" },
  { key: "arranging", label: "Arranging", color: "#A98130" },
  { key: "midi", label: "MIDI programming", color: "#A98130" },
  { key: "recording", label: "Recording & editing", color: "#7A2E2E" },
  { key: "scheduled", label: "Scheduled", color: "#3F6E5B" },
  { key: "uploaded", label: "Uploaded", color: "#2E5245" },
];

const VOICINGS = ["SATB", "SSA", "TTBB", "SAB", "Unison", "Other"];

function statusMeta(key) {
  return STATUSES.find((s) => s.key === key) || STATUSES[0];
}

function emptyPiece() {
  return {
    id: crypto.randomUUID(),
    title: "",
    composer: "",
    arranger: "",
    voicing: "SATB",
    status: "idea",
    youtubeUrl: "",
    scheduledDate: "",
    tags: "",
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

function loadPieces() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export default function App() {
  const [pieces, setPieces] = useState(() => loadPieces());
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [drawer, setDrawer] = useState(null); // piece being added/edited, or null
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pieces));
      setError("");
    } catch (e) {
      setError("Couldn't save — your browser storage may be full or blocked.");
    }
  }, [pieces]);

  function savePiece(piece) {
    const exists = pieces.some((p) => p.id === piece.id);
    const next = exists
      ? pieces.map((p) => (p.id === piece.id ? piece : p))
      : [piece, ...pieces];
    setPieces(next);
    setDrawer(null);
  }

  function deletePiece(id) {
    setPieces(pieces.filter((p) => p.id !== id));
    setDrawer(null);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pieces
      .filter((p) => statusFilter === "all" || p.status === statusFilter)
      .filter((p) => {
        if (!q) return true;
        return (
          p.title.toLowerCase().includes(q) ||
          p.composer.toLowerCase().includes(q) ||
          p.arranger.toLowerCase().includes(q) ||
          p.tags.toLowerCase().includes(q) ||
          p.notes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [pieces, query, statusFilter]);

  const counts = useMemo(() => {
    const c = {};
    STATUSES.forEach((s) => (c[s.key] = 0));
    pieces.forEach((p) => (c[p.status] = (c[p.status] || 0) + 1));
    return c;
  }, [pieces]);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: "#EDEAE1",
        color: "#23211D",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; }
        input, select, textarea {
          font-family: 'Inter', sans-serif;
          background: #F7F5EF;
          border: 1px solid #C9C2B4;
          color: #23211D;
          border-radius: 3px;
          padding: 8px 10px;
          font-size: 14px;
          width: 100%;
        }
        input:focus, select:focus, textarea:focus {
          outline: 2px solid #7A2E2E;
          outline-offset: 1px;
        }
        button { font-family: 'Inter', sans-serif; cursor: pointer; }
        ::placeholder { color: #8A8474; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "28px 20px 20px", borderBottom: "2px solid #23211D" }}>
        <div
          style={{
            fontFamily: "'Spectral', serif",
            fontWeight: 600,
            fontSize: "26px",
            letterSpacing: "0.2px",
          }}
        >
          Choral Ledger
        </div>
        <div style={{ fontSize: "13px", color: "#5B6770", marginTop: "2px" }}>
          MIDI-realized SATB arrangements for the channel
        </div>
      </div>

      {/* Search bar - sticky, always visible */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#EDEAE1",
          padding: "16px 20px 12px",
          borderBottom: "1px solid #C9C2B4",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              placeholder="Search by title, composer, arranger, tag, or note…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: "34px" }}
              aria-label="Search pieces"
            />
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#8A8474",
                fontSize: "14px",
                pointerEvents: "none",
              }}
            >
              ⌕
            </span>
          </div>
          <button
            onClick={() => setDrawer(emptyPiece())}
            style={{
              background: "#7A2E2E",
              color: "#F7F5EF",
              border: "none",
              borderRadius: "3px",
              padding: "0 18px",
              fontSize: "14px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            + Add piece
          </button>
        </div>
        {query.trim() && (
          <div style={{ fontSize: "12.5px", color: "#5B6770", marginTop: "8px" }}>
            {filtered.length} {filtered.length === 1 ? "match" : "matches"} for "{query.trim()}"
          </div>
        )}
      </div>

      {/* Status summary strip */}
      <div
        style={{
          display: "flex",
          gap: "0",
          overflowX: "auto",
          borderBottom: "1px solid #C9C2B4",
        }}
      >
        <button
          onClick={() => setStatusFilter("all")}
          style={{
            background: statusFilter === "all" ? "#23211D" : "transparent",
            color: statusFilter === "all" ? "#EDEAE1" : "#23211D",
            border: "none",
            padding: "10px 14px",
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          All ({pieces.length})
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(s.key)}
            style={{
              background: statusFilter === s.key ? s.color : "transparent",
              color: statusFilter === s.key ? "#F7F5EF" : "#23211D",
              border: "none",
              borderLeft: "1px solid #C9C2B4",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {s.label} ({counts[s.key] || 0})
          </button>
        ))}
      </div>

      {error && (
        <div style={{ padding: "10px 20px 0", color: "#7A2E2E", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* List */}
      <div style={{ padding: "0 20px 40px" }}>
        {filtered.length === 0 && (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              color: "#5B6770",
              fontSize: "14px",
            }}
          >
            {pieces.length === 0
              ? "No pieces yet. Add the first one to start your ledger."
              : "Nothing matches this search or filter."}
          </div>
        )}
        {filtered.map((p) => {
          const meta = statusMeta(p.status);
          return (
            <div
              key={p.id}
              onClick={() => setDrawer(p)}
              style={{
                borderTop: "1px solid #C9C2B4",
                borderBottom: "1px solid #C9C2B4",
                marginTop: "-1px",
                padding: "14px 4px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: meta.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "'Spectral', serif",
                    fontSize: "16px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.title || "Untitled piece"}
                </div>
                <div style={{ fontSize: "12.5px", color: "#5B6770", marginTop: "2px" }}>
                  {p.composer || "Composer unknown"}
                  {p.arranger ? ` · arr. ${p.arranger}` : ""} · {p.voicing}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: meta.color, fontWeight: 600, flexShrink: 0 }}>
                {meta.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {drawer && (
        <PieceDrawer
          piece={drawer}
          onClose={() => setDrawer(null)}
          onSave={savePiece}
          onDelete={deletePiece}
          isNew={!pieces.some((p) => p.id === drawer.id)}
        />
      )}
    </div>
  );
}

function PieceDrawer({ piece, onClose, onSave, onDelete, isNew }) {
  const [form, setForm] = useState(piece);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(35,33,29,0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#F7F5EF",
          width: "min(420px, 100%)",
          height: "100%",
          overflowY: "auto",
          padding: "22px",
          borderLeft: "2px solid #23211D",
        }}
      >
        <div
          style={{
            fontFamily: "'Spectral', serif",
            fontSize: "19px",
            fontWeight: 600,
            marginBottom: "18px",
          }}
        >
          {isNew ? "New piece" : "Edit piece"}
        </div>

        <Field label="Title">
          <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Danny Boy" />
        </Field>
        <Field label="Composer">
          <input value={form.composer} onChange={(e) => set("composer", e.target.value)} placeholder="Traditional" />
        </Field>
        <Field label="Arranger">
          <input value={form.arranger} onChange={(e) => set("arranger", e.target.value)} placeholder="You" />
        </Field>
        <Field label="Voicing">
          <select value={form.voicing} onChange={(e) => set("voicing", e.target.value)}>
            {VOICINGS.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={form.status} onChange={(e) => set("status", e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="YouTube link">
          <input value={form.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} placeholder="https://youtube.com/watch?v=…" />
        </Field>
        <Field label="Scheduled / upload date">
          <input type="date" value={form.scheduledDate} onChange={(e) => set("scheduledDate", e.target.value)} />
        </Field>
        <Field label="Tags">
          <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="sacred, christmas, a cappella" />
        </Field>
        <Field label="Notes">
          <textarea rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Voicing notes, MIDI plugin used, tempo, etc." />
        </Field>

        <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
          <button
            onClick={() => onSave(form)}
            style={{
              flex: 1,
              background: "#7A2E2E",
              color: "#F7F5EF",
              border: "none",
              borderRadius: "3px",
              padding: "10px",
              fontWeight: 500,
              fontSize: "14px",
            }}
          >
            Save
          </button>
          {!isNew && (
            <button
              onClick={() => onDelete(form.id)}
              style={{
                background: "transparent",
                color: "#7A2E2E",
                border: "1px solid #7A2E2E",
                borderRadius: "3px",
                padding: "10px 14px",
                fontSize: "14px",
              }}
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#5B6770",
              border: "1px solid #C9C2B4",
              borderRadius: "3px",
              padding: "10px 14px",
              fontSize: "14px",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "12.5px", color: "#5B6770", marginBottom: "5px", fontWeight: 500 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
