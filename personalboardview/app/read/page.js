import { headers } from "next/headers";
import { getBoardPayload } from "../api/board/route";
import { CardDetailBlock } from "./card-detail";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReadPage() {
  headers();

  const snapshotAt = new Date().toISOString();
  const data = await getBoardPayload({ includeFullCard: true });
  const lanes = data?.lanes || [];

  return (
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>BIG FELLAS BOARD</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        <strong>Snapshot:</strong> {snapshotAt}
      </p>

      {data?.error ? (
        <p style={{ color: "#b00020" }}>Error: {data.error}</p>
      ) : (
        lanes.map((lane) => (
          <section key={lane.id} style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem", borderBottom: "1px solid #ccc", paddingBottom: "0.35rem" }}>
              {lane.name.replace(/_/g, " ")} ({lane.count})
            </h2>
            {lane.cards?.length ? (
              <div>
                {lane.cards.map((card) => (
                  <CardDetailBlock key={card.id} fullCard={card.fullCard} />
                ))}
              </div>
            ) : (
              <p>No cards.</p>
            )}
          </section>
        ))
      )}
    </main>
  );
}
