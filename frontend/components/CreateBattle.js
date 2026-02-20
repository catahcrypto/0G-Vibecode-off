"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function CreateBattle({ contract, address, onCreated }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API}/api/users`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // Refresh users every 3 seconds when component is mounted
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  const opponents = users.filter((u) => u.address?.toLowerCase() !== address?.toLowerCase());

  const create = async () => {
    if (!contract || !address || !selected) return;
    setError("");
    setLoading(true);
    try {
      const tx = await contract.createBattle(selected);
      await tx.wait();
      setSelected("");
      await loadUsers(); // Refresh users after creating battle
      onCreated?.();
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!address) return null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Challenge someone</h3>
      
      {!contract ? (
        <div>
          <p style={{ color: "#a1a1aa", marginBottom: 8 }}>
            Waiting for contract connection... Make sure you're connected to the right network (localhost, chain 31337).
          </p>
          <button className="secondary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      ) : loadingUsers ? (
        <p style={{ color: "#a1a1aa" }}>Loading users...</p>
      ) : opponents.length === 0 ? (
        <div>
          <p style={{ color: "#a1a1aa", marginBottom: 8 }}>
            No other registered users yet. You need at least one other registered user to create a battle.
          </p>
          <p style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 8 }}>
            To test locally:
          </p>
          <ol style={{ color: "#a1a1aa", fontSize: 14, marginLeft: 20, marginBottom: 8 }}>
            <li>Open another browser window (or incognito)</li>
            <li>Connect a different MetaMask account (use another Hardhat account from <code>npm run node</code>)</li>
            <li>Register that account in the other window</li>
            <li>Come back here and refresh</li>
          </ol>
          <button className="secondary" onClick={loadUsers}>
            Refresh Users
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{ padding: 10, borderRadius: 8, background: "#18181b", color: "#e0e0e0", border: "1px solid #3f3f46", minWidth: 200 }}
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
            <button className="secondary" onClick={loadUsers} disabled={loadingUsers}>
              Refresh
            </button>
          </div>
          {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
