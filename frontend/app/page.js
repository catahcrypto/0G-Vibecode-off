"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { WalletConnect } from "@/components/WalletConnect";
import { RegisterForm } from "@/components/RegisterForm";
import { CreateBattle } from "@/components/CreateBattle";
import { BattleList } from "@/components/BattleList";
import { Leaderboard } from "@/components/Leaderboard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const CLOUT_BATTLE_ABI = [
  "function registerUser(string twitterHandle, string redditHandle)",
  "function createBattle(address opponent) returns (uint256)",
  "function getUser(address) view returns (tuple(string twitterHandle, string redditHandle, uint256 sentimentScore, uint256 battlesWon, uint256 battlesLost, bool registered))",
];

const B33F_ABI = ["function balanceOf(address) view returns (uint256)"];

export default function Home() {
  const [address, setAddress] = useState("");
  const [config, setConfig] = useState({});
  const [cloutBattle, setCloutBattle] = useState(null);
  const [b33f, setB33f] = useState(null);
  const [userRegistered, setUserRegistered] = useState(false);
  const [balance, setBalance] = useState("");
  const [refresh, setRefresh] = useState(0);

  const loadConfig = async () => {
    try {
      const res = await fetch(`${API}/api/config`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log("Config loaded:", data);
      setConfig(data);
    } catch (err) {
      console.error("Failed to load config:", err);
      setConfig({});
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum || !config.cloutBattleAddress) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    setCloutBattle(new ethers.Contract(config.cloutBattleAddress, CLOUT_BATTLE_ABI, provider));
    if (config.b33fCoinAddress) {
      setB33f(new ethers.Contract(config.b33fCoinAddress, B33F_ABI, provider));
    }
  }, [config.cloutBattleAddress, config.b33fCoinAddress]);

  const [writeContract, setWriteContract] = useState(null);
  useEffect(() => {
    if (!address || !config.cloutBattleAddress || typeof window === "undefined" || !window.ethereum) {
      setWriteContract(null);
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getSigner().then((signer) => {
      const contract = new ethers.Contract(config.cloutBattleAddress, CLOUT_BATTLE_ABI, signer);
      setWriteContract(contract);
    }).catch((err) => {
      console.error("Failed to get signer:", err);
      setWriteContract(null);
    });
  }, [address, config.cloutBattleAddress]);

  useEffect(() => {
    if (!address || !cloutBattle) return;
    cloutBattle.getUser(address).then((u) => setUserRegistered(u.registered)).catch(() => setUserRegistered(false));
  }, [address, cloutBattle, refresh]);

  useEffect(() => {
    if (!address || !b33f) return;
    b33f.balanceOf(address).then((b) => setBalance(ethers.formatEther(b))).catch(() => setBalance(""));
  }, [address, b33f, refresh]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>Clout Battle</h1>
      <p style={{ color: "#a1a1aa", marginBottom: 24 }}>Battle for clout on 0G. Connect wallet (localhost).</p>

      <WalletConnect onConnect={setAddress} onDisconnect={() => setAddress("")} />

      {address && (
        <>
          <div className="card">
            <strong>Your address:</strong> {address.slice(0, 10)}...{address.slice(-8)}
            {balance !== "" && <span style={{ marginLeft: 16 }}>B33f balance: {balance}</span>}
            {userRegistered && <span style={{ marginLeft: 16, color: "#22c55e" }}>Registered</span>}
          </div>

          {!config.cloutBattleAddress && (
            <div className="card" style={{ borderColor: "#f59e0b" }}>
              <strong>Contract addresses not loaded.</strong>
              <ol style={{ margin: "12px 0 0 0", paddingLeft: 20 }}>
                <li>Start chain: <code>npm run node</code> (leave running)</li>
                <li>Deploy: <code>npm run deploy:local</code> (writes backend/.env)</li>
                <li>Start backend: <code>npm run backend</code> (or restart it)</li>
                <li>
                  <button className="secondary" onClick={loadConfig} style={{ marginTop: 8 }}>
                    Reload Config
                  </button>
                </li>
              </ol>
              <details style={{ marginTop: 12, fontSize: 12, color: "#a1a1aa" }}>
                <summary>Debug info</summary>
                <pre style={{ marginTop: 8, overflow: "auto", fontSize: 11 }}>
                  Config from API: {JSON.stringify(config, null, 2)}
                  WriteContract: {writeContract ? "Set ✓" : "Not set ✗"}
                  API URL: {API}
                </pre>
                <div style={{ marginTop: 8 }}>
                  <a href={`${API}/api/debug`} target="_blank" rel="noopener" style={{ color: "#a78bfa" }}>
                    Check backend debug endpoint
                  </a>
                </div>
              </details>
            </div>
          )}

          <RegisterForm contract={writeContract} address={address} onRegistered={() => setRefresh((r) => r + 1)} />
          <CreateBattle contract={writeContract} address={address} onCreated={() => setRefresh((r) => r + 1)} />
          <div style={{ marginTop: 16 }}>
            <button className="secondary" onClick={() => setRefresh((r) => r + 1)}>Refresh</button>
          </div>
        </>
      )}

      <BattleList refresh={refresh} />
      <Leaderboard refresh={refresh} />
    </div>
  );
}
