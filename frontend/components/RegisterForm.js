"use client";

import { useState } from "react";

export function RegisterForm({ contract, address, onRegistered }) {
  const [twitter, setTwitter] = useState("");
  const [reddit, setReddit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!contract || !address) return;
    setError("");
    setLoading(true);
    try {
      const tx = await contract.registerUser(twitter.trim() || "user", reddit.trim() || "user");
      setTxHash(tx.hash);
      await tx.wait();
      onRegistered?.();
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  if (!contract || !address) return null;

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Register (Twitter + Reddit handles)</h3>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 400 }}>
        <input
          placeholder="Twitter handle (no @)"
          value={twitter}
          onChange={(e) => setTwitter(e.target.value)}
        />
        <input
          placeholder="Reddit username"
          value={reddit}
          onChange={(e) => setReddit(e.target.value)}
        />
        <button type="submit" className="primary" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {txHash && <div style={{ fontSize: 12, color: "#a78bfa" }}>Tx: {txHash}</div>}
      {error && <div style={{ color: "#ef4444" }}>{error}</div>}
    </div>
  );
}
