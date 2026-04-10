/** @typedef {Record<string, unknown>} JsonObject */

const FIELD_ORDER = [
  "customId",
  "description",
  "priority",
  "tags",
  "blockedStatus",
  "blockReason",
  "plannedStart",
  "plannedFinish",
  "createdOn",
  "updatedOn",
  "movedOn",
  "size",
  "cardType",
  "color",
  "laneId",
  "boardId",
  "id",
];

const LABEL_OVERRIDES = {
  customId: "Category",
  description: "Description",
  priority: "Priority",
  tags: "Tags",
  blockedStatus: "Block status",
  blockReason: "Block reason",
  plannedStart: "Planned start",
  plannedFinish: "Planned finish",
  createdOn: "Created",
  updatedOn: "Updated",
  movedOn: "Moved",
  size: "Size",
  cardType: "Card type",
  color: "Color",
  laneId: "Lane ID",
  boardId: "Board ID",
  id: "Card ID",
};

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return true;
  return false;
}

function labelForKey(key) {
  return LABEL_OVERRIDES[key] || key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
}

/**
 * @param {unknown} value
 * @returns {{ kind: "text"; text: string } | { kind: "html"; html: string } | { kind: "pre"; text: string } | null}
 */
function formatFieldValue(key, value) {
  if (isEmpty(value)) return null;

  if (key === "customId" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = /** @type {JsonObject} */ (value);
    if (!isEmpty(o.value)) return { kind: "text", text: String(o.value) };
    const s = JSON.stringify(value, null, 2);
    return s ? { kind: "pre", text: s } : null;
  }

  if (key === "blockedStatus" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = /** @type {JsonObject} */ (value);
    const parts = [];
    if (o.isBlocked === true) parts.push("Blocked: yes");
    if (!isEmpty(o.reason)) parts.push(`Reason: ${String(o.reason)}`);
    if (parts.length === 0 && Object.keys(o).length > 0) return { kind: "pre", text: JSON.stringify(value, null, 2) };
    if (parts.length === 0) return null;
    return { kind: "text", text: parts.join(" · ") };
  }

  if (key === "cardType" && typeof value === "object" && value !== null && !Array.isArray(value)) {
    const o = /** @type {JsonObject} */ (value);
    if (!isEmpty(o.name)) return { kind: "text", text: String(o.name) };
    return { kind: "pre", text: JSON.stringify(value, null, 2) };
  }

  if (key === "description" && typeof value === "string") {
    if (value.includes("<")) return { kind: "html", html: value };
    return { kind: "text", text: value };
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { kind: "text", text: String(value) };
  }

  if (Array.isArray(value)) {
    if (value.every((v) => v === null || ["string", "number", "boolean"].includes(typeof v))) {
      return { kind: "text", text: value.map(String).join(", ") };
    }
    return { kind: "pre", text: JSON.stringify(value, null, 2) };
  }

  if (typeof value === "object") {
    return { kind: "pre", text: JSON.stringify(value, null, 2) };
  }

  return { kind: "text", text: String(value) };
}

/**
 * Ordered keys: preferred list first, then remaining keys alphabetically (excluding title).
 * @param {JsonObject} card
 */
export function orderedCardKeys(card) {
  const keys = Object.keys(card);
  const rest = keys.filter((k) => k !== "title" && !FIELD_ORDER.includes(k)).sort();
  const primary = FIELD_ORDER.filter((k) => keys.includes(k));
  return [...primary, ...rest];
}

/**
 * @param {JsonObject} fullCard
 */
export function CardDetailBlock({ fullCard }) {
  if (!fullCard || typeof fullCard !== "object") return null;

  const title = typeof fullCard.title === "string" && fullCard.title.trim() ? fullCard.title : "Untitled";

  return (
    <article
      style={{
        marginBottom: "1.25rem",
        paddingBottom: "1.25rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "0.75rem" }}>{title}</h3>
      {orderedCardKeys(fullCard).map((key) => {
        const formatted = formatFieldValue(key, fullCard[key]);
        if (!formatted) return null;
        const label = labelForKey(key);
        return (
          <p key={key} style={{ margin: "0.35rem 0", lineHeight: 1.5 }}>
            <strong>{label}:</strong>{" "}
            {formatted.kind === "html" ? (
              <span dangerouslySetInnerHTML={{ __html: formatted.html }} />
            ) : formatted.kind === "pre" ? (
              <pre style={{ margin: "0.25rem 0 0", whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>{formatted.text}</pre>
            ) : (
              formatted.text
            )}
          </p>
        );
      })}
    </article>
  );
}
