require("dotenv").config();

const isLocal = process.env.LOCAL === "true" || process.env.NODE_ENV === "development";

module.exports = {
  isLocal: !!isLocal,
  port: process.env.PORT || 3001,
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  privateKey: process.env.PRIVATE_KEY || "",
  b33fCoinAddress: process.env.B33F_COIN_ADDRESS || "",
  cloutBattleAddress: process.env.CLOUT_BATTLE_ADDRESS || "",
};
