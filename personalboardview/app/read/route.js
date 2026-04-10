import { getBoardPayload } from "../api/board/route";
import { buildReadHtmlDocument } from "./html-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const READ_RESPONSE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  const snapshotAt = new Date().toISOString();
  const data = await getBoardPayload({ includeFullCard: true });
  const html = buildReadHtmlDocument(snapshotAt, data);
  const status = data.error ? 500 : 200;
  return new Response(html, { status, headers: READ_RESPONSE_HEADERS });
}
