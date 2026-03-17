// app/api/board/route.js
// Server-side proxy to AgilePlace API — keeps token safe

export const dynamic = "force-dynamic";
export const revalidate = 0;

const HOST = process.env.AGILEPLACE_HOST || "ngarrett.leankit.com";
const BOARD_ID = process.env.AGILEPLACE_BOARD_ID;
const TOKEN = process.env.AGILEPLACE_API_TOKEN;

async function apiFetch(path) {
  const res = await fetch(`https://${HOST}/io${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`AgilePlace ${res.status}: ${res.statusText}`);
  return res.json();
}

// Lane IDs we care about (skip archive)
const LANE_CONFIG = [
  { id: "2431674921", name: "IDEAS", status: "backlog" },
  { id: "2431674926", name: "READY", status: "backlog" },
  { id: "2431674928", name: "ACTIVE", status: "active" },
  { id: "2431674929", name: "ON_HOLD", status: "active" },
  { id: "2431674919", name: "DONE", status: "done" },
];

export async function GET() {
  try {
    if (!TOKEN || !BOARD_ID) {
      return Response.json(
        { error: "Missing AGILEPLACE_API_TOKEN or AGILEPLACE_BOARD_ID" },
        { status: 500 }
      );
    }

    // Fetch all cards on the board
    const data = await apiFetch(`/board/${BOARD_ID}`);
    const allCards = data?.lanes
      ? data.lanes.flatMap((lane) =>
          (lane.cards || []).map((card) => ({ ...card, laneId: lane.id }))
        )
      : [];

    // Also grab card types for color mapping
    const cardTypes = data?.cardTypes || [];

    // Build lane → cards map
    const lanes = LANE_CONFIG.map((laneConf) => {
      const cards = allCards
        .filter((c) => c.laneId === laneConf.id)
        .map((c) => ({
          id: c.id,
          title: c.title,
          header: c.customId?.value || c.customId || "",
          description: c.description || "",
          priority: c.priority || "normal",
          tags: c.tags || [],
          color: c.color || "#00ff41",
          typeId: c.typeId,
          typeName:
            cardTypes.find((t) => t.id === c.typeId)?.name || "Unknown",
          typeColor:
            cardTypes.find((t) => t.id === c.typeId)?.cardColor || "#333",
          isBlocked: c.isBlocked || false,
          blockReason: c.blockReason || "",
        }));

      return {
        ...laneConf,
        cards,
        count: cards.length,
      };
    });

    const totalCards = lanes.reduce((sum, l) => sum + l.count, 0);

    return Response.json({
      boardId: BOARD_ID,
      host: HOST,
      lanes,
      totalCards,
      cardTypes: cardTypes.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.cardColor,
      })),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Board fetch error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
