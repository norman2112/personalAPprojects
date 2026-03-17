export const dynamic = "force-dynamic";

const HOST = process.env.AGILEPLACE_HOST || "ngarrett.leankit.com";
const TOKEN = process.env.AGILEPLACE_API_TOKEN;

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  if (!cardId) return Response.json({ error: "Missing cardId" }, { status: 400 });

  const res = await fetch(`https://${HOST}/io/card/${cardId}?excludeComments=true`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) return Response.json({ error: `AgilePlace ${res.status}` }, { status: res.status });
  const data = await res.json();
  return Response.json({ description: data.description || "" });
}

export async function POST(request) {
  const { title, description, comment, laneId } = await request.json();
  if (!title || !laneId) return Response.json({ error: "Missing title or laneId" }, { status: 400 });

  // Create the card
  const res = await fetch(`https://${HOST}/io/card/?returnFullRecord=true`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      destination: { laneId },
      title,
      description: description || "",
    }),
  });
  if (!res.ok) return Response.json({ error: `AgilePlace ${res.status}` }, { status: res.status });
  const card = await res.json();

  // Post initial comment if provided
  if (comment?.trim() && card.id) {
    await fetch(`https://${HOST}/io/card/${card.id}/comment`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text: comment.trim() }),
    });
  }

  return Response.json({ id: card.id, title: card.title }, { status: 201 });
}
