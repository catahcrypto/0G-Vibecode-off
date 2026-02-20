const path = require("path");
const fs = require("fs");

const backendDir = path.join(__dirname, "..");
require("dotenv").config({ path: path.join(backendDir, ".env") });

let config = {
  isLocal: process.env.LOCAL === "true" || process.env.NODE_ENV === "development",
  port: process.env.PORT || 3001,
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  privateKey: process.env.PRIVATE_KEY || "",
  b33fCoinAddress: process.env.B33F_COIN_ADDRESS || "",
  cloutBattleAddress: process.env.CLOUT_BATTLE_ADDRESS || "",
};

// Fallback: if addresses missing, read from deployed-local.json (written by deploy script)
if ((!config.b33fCoinAddress || !config.cloutBattleAddress)) {
  const jsonPath = path.join(backendDir, "deployed-local.json");
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    config.b33fCoinAddress = config.b33fCoinAddress || data.B33F_COIN_ADDRESS || "";
    config.cloutBattleAddress = config.cloutBattleAddress || data.CLOUT_BATTLE_ADDRESS || "";
    config.rpcUrl = config.rpcUrl || data.RPC_URL || config.rpcUrl;
    if (config.b33fCoinAddress) console.log("Loaded addresses from deployed-local.json");
  } catch (_) {}
}

config.isLocal = !!config.isLocal;
if (!config.privateKey && config.isLocal) {
  config.privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
}

console.log("Backend config: RPC=" + config.rpcUrl + " B33F=" + (config.b33fCoinAddress ? "set" : "missing") + " CloutBattle=" + (config.cloutBattleAddress ? "set" : "missing"));

module.exports = config;
