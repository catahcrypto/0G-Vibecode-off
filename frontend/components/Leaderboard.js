"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function Leaderboard({ refresh }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`${API}/api/users`)
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [refresh]);

  const sorted = [...users].sort((a, b) => {
    const wA = parseInt(a.battlesWon || "0", 10);
    const wB = parseInt(b.battlesWon || "0", 10);
    return wB - wA;
  });

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Leaderboard</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #3f3f46" }}>
            <th style={{ padding: "8px 0" }}>#</th>
            <th>Address</th>
            <th>Wins</th>
            <th>Losses</th>
            <th>Clout</th>
          </tr>
        </thead>
        <tbody>
          {sorted.slice(0, 10).map((u, i) => (
            <tr key={u.address} style={{ borderBottom: "1px solid #27272a" }}>
              <td style={{ padding: "8px 0" }}>{i + 1}</td>
              <td>{u.address?.slice(0, 10)}...</td>
              <td>{u.battlesWon ?? "-"}</td>
              <td>{u.battlesLost ?? "-"}</td>
              <td>{u.sentimentScore ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
