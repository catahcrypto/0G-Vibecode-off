"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { WalletConnect } from "@/components/WalletConnect";
import { RegisterForm } from "@/components/RegisterForm";
import { CreateBattle } from "@/components/CreateBattle";
import { BattleList } from "@/components/BattleList";
import { Leaderboard } from "@/components/Leaderboard";
import "./globals.css";

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

  useEffect(() => {
    fetch(`${API}/api/config`).then((r) => r.json()).then(setConfig).catch(() => ({}));
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
    if (!address || !config.cloutBattleAddress || typeof window === "undefined" || !window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    provider.getSigner().then((signer) => {
      setWriteContract(new ethers.Contract(config.cloutBattleAddress, CLOUT_BATTLE_ABI, signer));
    }).catch(() => setWriteContract(null));
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
              Deploy contracts first: run <code>npx hardhat node</code>, then <code>npm run deploy:local</code>, then set B33F_COIN_ADDRESS and CLOUT_BATTLE_ADDRESS in backend .env and restart backend.
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
