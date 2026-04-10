/** @typedef {Record<string, unknown>} JsonObject */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (value === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function formatScalar(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return escapeHtml(String(value));
  }
  if (Array.isArray(value)) {
    if (value.every((v) => v === null || ["string", "number", "boolean"].includes(typeof v))) {
      return escapeHtml(value.map(String).join(", "));
    }
    return `<pre style="white-space:pre-wrap;margin:0.25rem 0 0;font-size:0.85rem">${escapeHtml(
      JSON.stringify(value, null, 2)
    )}</pre>`;
  }
  if (typeof value === "object" && value !== null) {
    return `<pre style="white-space:pre-wrap;margin:0.25rem 0 0;font-size:0.85rem">${escapeHtml(
      JSON.stringify(value, null, 2)
    )}</pre>`;
  }
  return escapeHtml(String(value));
}

/**
 * @param {unknown[]} users
 */
function formatAssignedUsers(users) {
  const lines = users.map((u) => {
    if (u && typeof u === "object" && "fullName" in u) {
      const o = /** @type {JsonObject} */ (u);
      const name = o.fullName != null ? String(o.fullName) : JSON.stringify(u);
      return `<li>${escapeHtml(name)}</li>`;
    }
    return `<li>${formatScalar(u)}</li>`;
  });
  return `<ul style="margin:0.25rem 0;padding-left:1.25rem">${lines.join("")}</ul>`;
}

/**
 * @param {JsonObject} card
 */
function renderCardArticle(card) {
  const title =
    typeof card.title === "string" && card.title.trim() ? card.title : "Untitled";
  let body = "";

  body += `<h3 style="margin:0 0 0.75rem">${escapeHtml(title)}</h3>`;

  if (!isEmpty(card.customId) && typeof card.customId === "object" && !Array.isArray(card.customId)) {
    const cid = /** @type {JsonObject} */ (card.customId);
    if (!isEmpty(cid.value)) {
      body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Category:</strong> ${escapeHtml(String(cid.value))}</p>`;
    } else {
      body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Custom ID:</strong> ${formatScalar(card.customId)}</p>`;
    }
  }

  if (typeof card.description === "string" && card.description.trim()) {
    const d = card.description;
    if (d.includes("<")) {
      body += `<div style="margin:0.35rem 0;line-height:1.5"><strong>Description:</strong><div>${d}</div></div>`;
    } else {
      body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Description:</strong> ${escapeHtml(d)}</p>`;
    }
  }

  if (!isEmpty(card.priority)) {
    body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Priority:</strong> ${escapeHtml(String(card.priority))}</p>`;
  }

  if (Array.isArray(card.tags) && card.tags.length > 0) {
    body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Tags:</strong> ${escapeHtml(card.tags.map(String).join(", "))}</p>`;
  }

  const blocked =
    card.blockedStatus && typeof card.blockedStatus === "object"
      ? /** @type {JsonObject} */ (card.blockedStatus).isBlocked
      : undefined;
  const isBlocked = blocked !== undefined ? blocked : card.isBlocked;
  if (typeof isBlocked === "boolean") {
    body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Blocked:</strong> ${isBlocked ? "yes" : "no"}</p>`;
  }

  const reason =
    (card.blockedStatus && typeof card.blockedStatus === "object"
      ? /** @type {JsonObject} */ (card.blockedStatus).reason
      : undefined) ?? card.blockReason;
  if (reason != null && String(reason).trim() !== "") {
    body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Block reason:</strong> ${escapeHtml(String(reason))}</p>`;
  }

  const dateFields = [
    ["plannedStart", "Planned start"],
    ["plannedFinish", "Planned finish"],
    ["createdOn", "Created"],
    ["updatedOn", "Updated"],
    ["movedOn", "Moved"],
  ];
  for (const [key, label] of dateFields) {
    if (!isEmpty(card[key])) {
      body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>${label}:</strong> ${escapeHtml(String(card[key]))}</p>`;
    }
  }

  if (!isEmpty(card.size)) {
    body += `<p style="margin:0.35rem 0;line-height:1.5"><strong>Size:</strong> ${formatScalar(card.size)}</p>`;
  }

  if (Array.isArray(card.assignedUsers) && card.assignedUsers.length > 0) {
    body += `<div style="margin:0.35rem 0;line-height:1.5"><strong>Assigned users:</strong>${formatAssignedUsers(
      card.assignedUsers
    )}</div>`;
  }

  const shown = new Set([
    "title",
    "customId",
    "description",
    "priority",
    "tags",
    "blockedStatus",
    "isBlocked",
    "blockReason",
    "plannedStart",
    "plannedFinish",
    "createdOn",
    "updatedOn",
    "movedOn",
    "size",
    "assignedUsers",
  ]);

  const rest = Object.keys(card)
    .filter((k) => !shown.has(k))
    .sort();
  for (const key of rest) {
    const value = card[key];
    if (isEmpty(value)) continue;
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
    if (typeof value === "string" && value.includes("<")) {
      body += `<div style="margin:0.35rem 0;line-height:1.5"><strong>${escapeHtml(label)}:</strong><div>${value}</div></div>`;
    } else {
      body += `<div style="margin:0.35rem 0;line-height:1.5"><strong>${escapeHtml(label)}:</strong> ${formatScalar(value)}</div>`;
    }
  }

  return `<article style="margin-bottom:1.25rem;padding-bottom:1.25rem;border-bottom:1px solid #ddd">${body}</article>`;
}

/**
 * @param {string} snapshotAt
 * @param {JsonObject} data
 */
export function buildReadHtmlDocument(snapshotAt, data) {
  const lanes = /** @type {unknown[]} */ (data.lanes) || [];

  let main = `<main style="font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif;max-width:980px;margin:2rem auto;padding:0 1rem">`;
  main += `<h1 style="margin-bottom:0.5rem">BIG FELLAS BOARD</h1>`;
  main += `<p style="color:#666;margin-top:0"><strong>Snapshot:</strong> ${escapeHtml(snapshotAt)}</p>`;

  if (data.error) {
    main += `<p style="color:#b00020">Error: ${escapeHtml(String(data.error))}</p>`;
  } else {
    for (const lane of lanes) {
      const l = /** @type {JsonObject} */ (lane);
      const name = typeof l.name === "string" ? l.name.replace(/_/g, " ") : "";
      const count = l.count ?? 0;
      const cards = Array.isArray(l.cards) ? l.cards : [];
      main += `<section style="margin-bottom:2rem">`;
      main += `<h2 style="margin-bottom:1rem;border-bottom:1px solid #ccc;padding-bottom:0.35rem">${escapeHtml(
        `${name} (${count})`
      )}</h2>`;
      if (cards.length === 0) {
        main += `<p>No cards.</p>`;
      } else {
        for (const c of cards) {
          const entry = /** @type {JsonObject} */ (c);
          const full = entry.fullCard && typeof entry.fullCard === "object" ? entry.fullCard : entry;
          main += renderCardArticle(/** @type {JsonObject} */ (full));
        }
      }
      main += `</section>`;
    }
  }

  main += `</main>`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>BIG FELLAS BOARD</title></head><body>${main}</body></html>`;
}
