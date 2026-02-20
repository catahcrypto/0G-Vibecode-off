"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function BattleList({ refresh }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/battles`)
      .then((r) => r.json())
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [refresh]);

  if (loading) return <div className="card">Loading battles...</div>;
  if (!list.length) return <div className="card">No battles yet. Create one!</div>;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Battles</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {list.map((b) => (
          <li key={b.id} style={{ padding: "8px 0", borderBottom: "1px solid #3f3f46" }}>
            <strong>#{b.id}</strong> {b.challenger?.slice(0, 8)}... vs {b.opponent?.slice(0, 8)}...
            — {b.status}
            {b.winner && ` — Winner: ${b.winner.slice(0, 8)}...`}
          </li>
        ))}
      </ul>
    </div>
  );
}
