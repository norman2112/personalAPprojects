export const dynamic = "force-dynamic";

const HOST = process.env.AGILEPLACE_HOST || "ngarrett.leankit.com";
const TOKEN = process.env.AGILEPLACE_API_TOKEN;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  if (!cardId) return Response.json({ error: "Missing cardId" }, { status: 400 });

  const res = await fetch(`https://${HOST}/io/card/${cardId}/comment?sortBy=newest`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return Response.json({ error: `AgilePlace ${res.status}` }, { status: res.status });
  const data = await res.json();
  return Response.json({ comments: data.comments || [] });
}

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  if (!cardId) return Response.json({ error: "Missing cardId" }, { status: 400 });

  const body = await request.json();
  const res = await fetch(`https://${HOST}/io/card/${cardId}/comment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: body.text }),
  });
  if (!res.ok) return Response.json({ error: `AgilePlace ${res.status}` }, { status: res.status });
  const data = await res.json();
  return Response.json(data, { status: 201 });
}
