"use client";

import { useState, useEffect } from "react";

const LOCAL_CHAIN_ID = "0x7a69"; // 31337

export function WalletConnect({ onConnect, onDisconnect }) {
  const [address, setAddress] = useState("");
  const [chainId, setChainId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;
    window.ethereum.request({ method: "eth_chainId" }).then(setChainId).catch(() => {});
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts && accounts[0]) setAddress(accounts[0]);
    }).catch(() => {});
    const handleAccounts = (accounts) => {
      if (accounts && accounts[0]) {
        setAddress(accounts[0]);
        onConnect?.(accounts[0]);
      } else {
        setAddress("");
        onDisconnect?.();
      }
    };
    const handleChain = (id) => setChainId(id);
    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    };
  }, [onConnect, onDisconnect]);

  const connect = async () => {
    setError("");
    if (!window.ethereum) {
      setError("Install MetaMask");
      return;
    }
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts[0]) {
        setAddress(accounts[0]);
        onConnect?.(accounts[0]);
      }
      const id = await window.ethereum.request({ method: "eth_chainId" });
      if (id !== LOCAL_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: LOCAL_CHAIN_ID }],
          });
        } catch (e) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: LOCAL_CHAIN_ID,
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
            }],
          });
        }
        setChainId(LOCAL_CHAIN_ID);
      }
    } catch (e) {
      setError(e.message || "Connection failed");
    }
  };

  const disconnect = () => {
    setAddress("");
    onDisconnect?.();
  };

  if (address) {
    return (
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <strong>Connected:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          {chainId !== LOCAL_CHAIN_ID && (
            <span style={{ color: "#f59e0b", marginLeft: 8 }}>Switch to Localhost (31337)</span>
          )}
        </div>
        <button className="secondary" onClick={disconnect}>Disconnect</button>
        {error && <div style={{ color: "#ef4444", width: "100%" }}>{error}</div>}
      </div>
    );
  }

  return (
    <div className="card">
      <button className="primary" onClick={connect}>Connect Wallet</button>
      {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
    </div>
  );
}
