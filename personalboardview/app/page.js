"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
        if (!selected) {
          e.currentTarget.style.borderColor = C.dark;
          e.currentTarget.style.borderLeftColor = hColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.borderColor = C.border;
          e.currentTarget.style.borderLeftColor = hColor;
        }
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

// ─── Card Detail + Comments Panel ───────────────────
function DetailPanel({ card, onClose }) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [description, setDescription] = useState("");
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!card) return;
    setComments([]);
    setDescription("");
    setLoadingComments(true);
    Promise.all([
      fetch(`/api/comments?cardId=${card.id}`).then((r) => r.json()),
      fetch(`/api/card?cardId=${card.id}`).then((r) => r.json()),
    ])
      .then(([commentsData, cardData]) => {
        setComments(commentsData.comments || []);
        setDescription(cardData.description || "");
      })
      .catch(() => {})
      .finally(() => setLoadingComments(false));
  }, [card?.id]);

  const submitComment = async () => {
    if (!newComment.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/comments?cardId=${card.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment.trim() }),
      });
      const created = await res.json();
      setComments((prev) => [created, ...prev]);
      setNewComment("");
    } catch {}
    setPosting(false);
  };

  if (!card) return null;
  const hColor = headerColor(card.header || card.typeName || "");

  return (
    <div
      style={{
        width: 360,
        borderLeft: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        background: "#050505",
        fontFamily: FONT,
        fontSize: 12,
        flexShrink: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
            <span style={{ color: hColor, fontSize: 10, letterSpacing: 1 }}>
              [{(card.header || card.typeName || "").toUpperCase()}]
            </span>
            {card.isBlocked && <span style={{ color: C.red, fontSize: 10 }}>■ BLOCKED</span>}
          </div>
          <div style={{ color: C.green, fontWeight: 700, lineHeight: 1.4 }}>{card.title}</div>
          {description && (
            <div
              style={{ color: C.dim, marginTop: 6, lineHeight: 1.5, fontSize: 11 }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
          {card.blockReason && (
            <div style={{ color: C.red, marginTop: 4, fontSize: 11 }}>reason: {card.blockReason}</div>
          )}
        </div>
        <div
          onClick={onClose}
          style={{ color: C.darkest, cursor: "pointer", fontSize: 10, padding: "4px 8px", border: `1px solid ${C.border}`, flexShrink: 0 }}
        >
          [ESC]
        </div>
      </div>

      {/* Comments list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px" }}>
        <div style={{ color: C.darkest, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>
          COMMENTS {!loadingComments && `(${comments.length})`}
        </div>
        {loadingComments && <div style={{ color: C.dim, fontSize: 11 }}>loading...</div>}
        {!loadingComments && comments.length === 0 && (
          <div style={{ color: C.darkest, fontSize: 11 }}>— no comments yet —</div>
        )}
        {comments.map((c) => (
          <div
            key={c.id}
            style={{
              borderLeft: `2px solid ${C.border}`,
              paddingLeft: 10,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: C.cyan, fontSize: 10 }}>{c.createdBy?.fullName || "unknown"}</span>
              <span style={{ color: C.darkest, fontSize: 10 }}>
                {new Date(c.createdOn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </div>
            <div
              style={{ color: C.text, fontSize: 11, lineHeight: 1.5 }}
              dangerouslySetInnerHTML={{ __html: c.text }}
            />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* New comment input */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitComment(); }}
          placeholder="Add a comment..."
          rows={2}
          style={{
            flex: 1,
            background: "#0d0d0d",
            border: `1px solid ${C.border}`,
            color: C.text,
            fontFamily: FONT,
            fontSize: 16,
            padding: "8px",
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
            WebkitTextSizeAdjust: "100%",
          }}
        />
        <span
          onClick={submitComment}
          style={{
            color: posting ? C.dim : C.green,
            fontSize: 11,
            cursor: posting ? "default" : "pointer",
            padding: "8px 10px",
            border: `1px solid ${posting ? C.border : C.green}`,
            transition: "all 0.15s",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {posting ? "..." : "POST"}
        </span>
      </div>
    </div>
  );
}

// ─── Status Bar ─────────────────────────────────────
function StatusBar({ totalCards, fetchedAt, error, loading, pollInterval, onPollChange }) {
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
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <span>POLL:</span>
        {[{ label: "30s", val: 30000 }, { label: "5m", val: 300000 }].map(({ label, val }) => (
          <span
            key={val}
            onClick={() => onPollChange(val)}
            style={{
              cursor: "pointer",
              color: pollInterval === val ? C.green : C.darkest,
              border: `1px solid ${pollInterval === val ? C.green : C.border}`,
              padding: "1px 6px",
              transition: "all 0.15s",
            }}
          >
            {label}
          </span>
        ))}
        <span style={{ marginLeft: 8 }}>{time}</span>
      </div>
    </div>
  );
}

// ─── List View ──────────────────────────────────────
function ListView({ lanes, selectedId, onSelect }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
      {lanes.map((lane) => {
        const isHold = lane.name === "ON_HOLD";
        const isDone = lane.name === "DONE";
        const hColor = isHold ? C.orange : isDone ? C.dim : C.green;
        return (
          <div key={lane.id} style={{ marginBottom: 32 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                paddingBottom: 6,
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <span style={{ color: hColor, fontSize: 11, fontFamily: FONT, fontWeight: 700, letterSpacing: 1.5 }}>
                {lane.name.replace(/_/g, " ")}
              </span>
              <span style={{ color: C.darkest, fontSize: 10, fontFamily: FONT }}>
                {lane.count}
              </span>
            </div>
            {lane.cards.length === 0 ? (
              <div style={{ color: C.darkest, fontSize: 11, fontFamily: FONT, padding: "8px 0" }}>— empty —</div>
            ) : (
              lane.cards.map((c) => (
                <Card key={c.id} card={c} selected={selectedId === c.id} onClick={() => onSelect(c)} />
              ))
            )}
          </div>
        );
      })}
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
  const [view, setView] = useState("board");
  const [pollInterval, setPollInterval] = useState(300000); // default 5min

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

  // Auto-refresh
  useEffect(() => {
    if (!booted) return;
    const i = setInterval(fetchBoard, pollInterval);
    return () => clearInterval(i);
  }, [booted, fetchBoard, pollInterval]);

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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            onClick={() => setView("board")}
            style={{
              color: view === "board" ? C.green : C.darkest,
              fontSize: 10,
              cursor: "pointer",
              padding: "4px 8px",
              border: `1px solid ${view === "board" ? C.green : C.border}`,
              fontFamily: FONT,
              transition: "all 0.15s",
            }}
          >
            BOARD
          </span>
          <span
            onClick={() => setView("list")}
            style={{
              color: view === "list" ? C.green : C.darkest,
              fontSize: 10,
              cursor: "pointer",
              padding: "4px 8px",
              border: `1px solid ${view === "list" ? C.green : C.border}`,
              fontFamily: FONT,
              transition: "all 0.15s",
            }}
          >
            LIST
          </span>
          <span
            onClick={fetchBoard}
            style={{
              color: loading ? C.orange : C.darkest,
              fontSize: 10,
              cursor: "pointer",
              padding: "4px 8px",
              border: `1px solid ${C.border}`,
              fontFamily: FONT,
              transition: "color 0.2s",
              marginLeft: 8,
            }}
          >
            {loading ? "↻ SYNCING..." : "↻ REFRESH"}
          </span>
        </div>
      </div>

      {/* Main content + detail panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Board / List */}
        {view === "board" ? (
          <div style={{ flex: 1, display: "flex", overflow: "auto" }}>
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
        ) : (
          <ListView
            lanes={data?.lanes || []}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
        )}

        {/* Detail + comments side panel */}
        <DetailPanel card={selected} onClose={() => setSelected(null)} />
      </div>

      {/* Status bar */}
      <StatusBar
        totalCards={data?.totalCards || 0}
        fetchedAt={data?.fetchedAt}
        error={error}
        loading={loading}
        pollInterval={pollInterval}
        onPollChange={setPollInterval}
      />
    </div>
  );
}
