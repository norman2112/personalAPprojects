export const dynamic = "force-dynamic";

const HOST = process.env.AGILEPLACE_HOST || "ngarrett.leankit.com";
const TOKEN = process.env.AGILEPLACE_API_TOKEN;

export async function PATCH(request) {
  try {
    if (!TOKEN) {
      return Response.json({ error: "Missing AGILEPLACE_API_TOKEN" }, { status: 500 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { cardId, laneId } = body || {};
    if (!cardId || laneId === undefined || laneId === null || laneId === "") {
      return Response.json({ error: "cardId and laneId required" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`https://${HOST}/io/card/${cardId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ op: "replace", path: "/laneId", value: laneId }]),
        cache: "no-store",
        signal: controller.signal,
      });

      const text = await res.text();
      let data;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      } else {
        data = {};
      }

      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && data.error
            ? data.error
            : `AgilePlace ${res.status}: ${res.statusText}`;
        return Response.json(
          typeof data === "object" && data !== null ? { ...data, error: message } : { error: message },
          { status: res.status }
        );
      }

      return Response.json(data);
    } finally {
      clearTimeout(timeout);
    }
  } catch (err) {
    console.error("Board move error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
