"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Theme ──────────────────────────────────────────
const C = {
  green: "#00ff41",
  dim: "#00aa2a",
  dark: "#005500",
  darkest: "#003300",
  bg: "#0a0a0a",
  bgCard: "#0d0d0d",
  border: "#1a3318",
  text: "#cccccc",
  white: "#e0e0e0",
  red: "#ff4444",
  orange: "#ffaa00",
  yellow: "#ffff00",
  cyan: "#00ffcc",
  blue: "#00aaff",
  pink: "#ff66ff",
  // Card type colors
  VEHICLE: "#00aaff",
  HOME: "#ff66ff",
  YARD: "#44ff44",
  DEV: "#ffff00",
  PERSONAL: "#00ffcc",
  HEALTH: "#ff4444",
};

const FONT = "'JetBrains Mono', 'IBM Plex Mono', 'Courier New', monospace";

function headerColor(header) {
  if (!header) return C.dim;
  const key = header.toUpperCase();
  return C[key] || C.green;
}

function priorityIcon(p) {
  if (p === "critical") return { icon: "▲▲", color: C.red };
  if (p === "high") return { icon: "▲", color: C.red };
  if (p === "low") return { icon: "▽", color: C.dim };
  return { icon: "●", color: C.dim };
}

// ─── Boot Sequence ──────────────────────────────────
function BootSequence({ onDone }) {
  const lines = [
    { text: "$ openclaw --board personal --render kanban", color: C.green },
    { text: "initializing openclaw v0.1...", color: C.dim },
    { text: "connecting to agileplace mcp...", color: C.dim },
    { text: "authenticated ✓", color: C.green },
    { text: "fetching board data...", color: C.dim },
  ];
  const [shown, setShown] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const b = setInterval(() => setBlink((v) => !v), 530);
    return () => clearInterval(b);
  }, []);

  useEffect(() => {
    if (shown < lines.length) {
      const delay = shown === 0 ? 600 : 150 + Math.random() * 250;
      const t = setTimeout(() => setShown((s) => s + 1), delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
  }, [shown, onDone]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: C.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 13, lineHeight: 1.8 }}>
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} style={{ color: l.color }}>
            {l.text}
          </div>
        ))}
        <span style={{ color: C.green, opacity: blink ? 1 : 0 }}>█</span>
      </div>
    </div>
  );
}

// ─── Card ───────────────────────────────────────────
function Card({ card, selected, onClick }) {
  const hdr = card.header || card.typeName || "";
  const hColor = headerColor(hdr);
  const prio = priorityIcon(card.priority);

  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? C.green : C.border}`,
        background: selected ? "#001a00" : C.bgCard,
        padding: "8px 10px",
        marginBottom: 4,
        cursor: "pointer",
        transition: "all 0.12s ease",
        fontFamily: FONT,
        borderLeft: `3px solid ${hColor}`,
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.borderColor = C.dark;
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.borderColor = C.border;
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <span style={{ color: hColor, fontSize: 10, letterSpacing: 1 }}>
          [{hdr.toUpperCase() || "—"}]
        </span>
        {card.isBlocked && (
          <span style={{ color: C.red, fontSize: 10 }}>■ BLOCKED</span>
        )}
      </div>
      <div
        style={{
          color: selected ? C.green : C.text,
          fontSize: 12,
          lineHeight: 1.4,
        }}
      >
        {card.title}
      </div>
      {card.tags && card.tags.length > 0 && (
        <div style={{ marginTop: 4 }}>
          {card.tags.map((t, i) => (
            <span
              key={i}
              style={{
                color: C.dark,
                fontSize: 9,
                marginRight: 6,
                letterSpacing: 0.5,
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Column ─────────────────────────────────────────
function Column({ lane, selectedId, onSelect }) {
  const isHold = lane.name === "ON_HOLD";
  const isDone = lane.name === "DONE";
  const headerColor = isHold ? C.orange : isDone ? C.dim : C.green;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 220,
        maxWidth: 320,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${C.border}`,
      }}
    >
      {/* Lane header */}
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#050505",
        }}
      >
        <span
          style={{
            color: headerColor,
            fontSize: 11,
            fontFamily: FONT,
            fontWeight: 700,
            letterSpacing: 1.5,
          }}
        >
          {lane.name.replace(/_/g, " ")}
        </span>
        <span
          style={{
            color: C.darkest,
            fontSize: 10,
            fontFamily: FONT,
          }}
        >
          {lane.count}
        </span>
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          padding: 6,
          overflowY: "auto",
          background: C.bg,
        }}
      >
        {lane.cards.map((c) => (
          <Card
            key={c.id}
            card={c}
            selected={selectedId === c.id}
            onClick={() => onSelect(c)}
          />
        ))}
        {lane.cards.length === 0 && (
          <div
            style={{
              color: C.darkest,
              fontSize: 11,
              fontFamily: FONT,
              padding: 16,
              textAlign: "center",
            }}
          >
            — empty —
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail Panel ───────────────────────────────────
function DetailPanel({ card, onClose }) {
  if (!card) return null;
  const hColor = headerColor(card.header || card.typeName || "");

  return (
    <div
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "12px 16px",
        fontFamily: FONT,
        fontSize: 12,
        background: "#050505",
        display: "flex",
        gap: 24,
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: hColor, fontSize: 10, letterSpacing: 1 }}>
            [{(card.header || card.typeName || "").toUpperCase()}]
          </span>
          <span style={{ color: C.green, fontWeight: 700 }}>{card.title}</span>
          {card.isBlocked && (
            <span style={{ color: C.red, fontSize: 10 }}>■ BLOCKED</span>
          )}
        </div>
        {card.description && (
          <div style={{ color: C.dim, lineHeight: 1.5, maxWidth: 600 }}>
            {card.description}
          </div>
        )}
        {card.blockReason && (
          <div style={{ color: C.red, marginTop: 4, fontSize: 11 }}>
            reason: {card.blockReason}
          </div>
        )}
      </div>
      <div
        onClick={onClose}
        style={{
          color: C.darkest,
          cursor: "pointer",
          fontSize: 10,
          padding: "4px 8px",
          border: `1px solid ${C.border}`,
        }}
      >
        [ESC]
      </div>
    </div>
  );
}

// ─── Status Bar ─────────────────────────────────────
function StatusBar({ totalCards, fetchedAt, error, loading }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <div
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "6px 14px",
        display: "flex",
        justifyContent: "space-between",
        fontFamily: FONT,
        fontSize: 10,
        color: C.darkest,
        background: "#050505",
      }}
    >
      <div style={{ display: "flex", gap: 16 }}>
        <span>
          {loading ? (
            <span style={{ color: C.orange }}>● FETCHING...</span>
          ) : error ? (
            <span style={{ color: C.red }}>● ERROR: {error}</span>
          ) : (
            <span style={{ color: C.dark }}>● CONNECTED</span>
          )}
        </span>
        <span>{totalCards} cards</span>
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span>{time}</span>
        <span>openclaw v0.1</span>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────
export default function Home() {
  const [booted, setBooted] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [opacity, setOpacity] = useState(0);

  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/board");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch after boot
  useEffect(() => {
    if (booted) {
      fetchBoard().then(() => {
        setTimeout(() => setOpacity(1), 50);
      });
    }
  }, [booted, fetchBoard]);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!booted) return;
    const i = setInterval(fetchBoard, 30000);
    return () => clearInterval(i);
  }, [booted, fetchBoard]);

  // ESC to deselect
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!booted) {
    return <BootSequence onDone={() => setBooted(true)} />;
  }

  return (
    <div
      style={{
        background: C.bg,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        opacity,
        transition: "opacity 0.5s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: FONT,
          background: "#050505",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span
            style={{
              color: C.green,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 3,
            }}
          >
            BIG FELLAS BOARD
          </span>
          <span style={{ color: C.darkest, fontSize: 11 }}>
            // my projects
          </span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span
            onClick={fetchBoard}
            style={{
              color: loading ? C.orange : C.darkest,
              fontSize: 10,
              cursor: "pointer",
              padding: "4px 8px",
              border: `1px solid ${C.border}`,
              transition: "color 0.2s",
            }}
          >
            {loading ? "↻ SYNCING..." : "↻ REFRESH"}
          </span>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "auto",
        }}
      >
        {data?.lanes?.map((lane) => (
          <Column
            key={lane.id}
            lane={lane}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        ))}
        {!data && !error && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: FONT,
              color: C.dim,
              fontSize: 12,
            }}
          >
            loading board...
          </div>
        )}
      </div>

      {/* Detail panel */}
      <DetailPanel card={selected} onClose={() => setSelected(null)} />

      {/* Status bar */}
      <StatusBar
        totalCards={data?.totalCards || 0}
        fetchedAt={data?.fetchedAt}
        error={error}
        loading={loading}
      />
    </div>
  );
}
