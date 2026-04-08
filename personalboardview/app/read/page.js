import { GET as getBoard } from "../api/board/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function loadBoard() {
  const response = await getBoard();
  const data = await response.json();
  return data;
}

export default async function ReadPage() {
  const data = await loadBoard();
  const lanes = data?.lanes || [];

  return (
    <main style={{ fontFamily: "Arial, sans-serif", maxWidth: 980, margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>BIG FELLAS BOARD</h1>
      <p style={{ color: "#666", marginTop: 0 }}>
        Server-rendered snapshot {data?.fetchedAt ? `(${new Date(data.fetchedAt).toLocaleString()})` : ""}
      </p>

      {data?.error ? (
        <p style={{ color: "#b00020" }}>Error: {data.error}</p>
      ) : (
        lanes.map((lane) => (
          <section key={lane.id} style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>
              {lane.name} ({lane.count})
            </h2>
            {lane.cards?.length ? (
              <ul>
                {lane.cards.map((card) => (
                  <li key={card.id}>
                    <strong>{card.title}</strong>
                    {card.header ? ` [${card.header}]` : ""}
                    {card.isBlocked ? " (BLOCKED)" : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No cards.</p>
            )}
          </section>
        ))
      )}
    </main>
  );
}
