"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function CreateBattle({ contract, address, onCreated }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/users`)
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const opponents = users.filter((u) => u.address?.toLowerCase() !== address?.toLowerCase());

  const create = async () => {
    if (!contract || !address || !selected) return;
    setError("");
    setLoading(true);
    try {
      const tx = await contract.createBattle(selected);
      await tx.wait();
      onCreated?.();
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!contract || !address) return null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Challenge someone</h3>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        style={{ padding: 10, borderRadius: 8, background: "#18181b", color: "#e0e0e0", border: "1px solid #3f3f46", marginRight: 8 }}
      >
        <option value="">Select opponent</option>
        {opponents.map((u) => (
          <option key={u.address} value={u.address}>
            {u.twitterHandle || u.address?.slice(0, 10)}... (W:{u.battlesWon ?? 0})
          </option>
        ))}
      </select>
      <button className="primary" onClick={create} disabled={!selected || loading}>
        {loading ? "Creating..." : "Create Battle"}
      </button>
      {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
