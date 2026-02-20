const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const isLocal = process.env.LOCAL === "true" || process.env.NODE_ENV === "development";

const config = {
  isLocal: !!isLocal,
  port: process.env.PORT || 3001,
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  privateKey: process.env.PRIVATE_KEY || "",
  b33fCoinAddress: process.env.B33F_COIN_ADDRESS || "",
  cloutBattleAddress: process.env.CLOUT_BATTLE_ADDRESS || "",
};

// Debug: log config on startup (hide private key)
console.log("Backend config loaded:");
console.log("  RPC_URL:", config.rpcUrl);
console.log("  LOCAL:", config.isLocal);
console.log("  B33F_COIN_ADDRESS:", config.b33fCoinAddress || "(not set)");
console.log("  CLOUT_BATTLE_ADDRESS:", config.cloutBattleAddress || "(not set)");
console.log("  PRIVATE_KEY:", config.privateKey ? `${config.privateKey.slice(0, 10)}...` : "(not set)");

module.exports = config;
