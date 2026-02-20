const { ethers } = require("ethers");

const B33F_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function mint(address to, uint256 amount)",
];
const CLOUT_BATTLE_ABI = [
  "function registerUser(string twitterHandle, string redditHandle)",
  "function createBattle(address opponent) returns (uint256)",
  "function getUser(address) view returns (tuple(string twitterHandle, string redditHandle, uint256 sentimentScore, uint256 battlesWon, uint256 battlesLost, bool registered))",
  "function getBattle(uint256) view returns (tuple(address challenger, address opponent, uint256 challengerSentiment, uint256 opponentSentiment, address winner, uint8 status, uint256 createdAt, uint256 resolvedAt, bytes32 daBlobHash, uint256 rewardAmount))",
  "function getUserBattles(address) view returns (uint256[])",
  "function getTotalBattles() view returns (uint256)",
  "function updateSentimentScore(address user, uint256 newScore)",
  "function resolveBattle(uint256 battleId, address winner, bytes32 daBlobHash)",
  "event UserRegistered(address indexed user, string twitterHandle, string redditHandle)",
  "event BattleCreated(uint256 indexed battleId, address indexed challenger, address indexed opponent, uint256 timestamp)",
  "event BattleResolved(uint256 indexed battleId, address indexed winner, address indexed loser, uint256 rewardAmount, bytes32 daBlobHash)",
];

async function getContractService(config) {
  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const signer = config.privateKey
    ? new ethers.Wallet(config.privateKey, provider)
    : null;

  const b33f = new ethers.Contract(config.b33fCoinAddress, B33F_ABI, signer || provider);
  const cloutBattle = new ethers.Contract(config.cloutBattleAddress, CLOUT_BATTLE_ABI, signer || provider);

  return {
    provider,
    signer,
    b33f,
    cloutBattle,
    async getBalance(address) {
      return b33f.balanceOf(address);
    },
    async getUser(address) {
      return cloutBattle.getUser(address);
    },
    async getBattle(id) {
      return cloutBattle.getBattle(id);
    },
    async getUserBattles(address) {
      return cloutBattle.getUserBattles(address);
    },
    async getTotalBattles() {
      return cloutBattle.getTotalBattles();
    },
    async updateSentimentScore(userAddress, score) {
      if (!signer) throw new Error("No signer (PRIVATE_KEY) for updateSentimentScore");
      const tx = await cloutBattle.updateSentimentScore(userAddress, score);
      return tx.wait();
    },
    async resolveBattle(battleId, winnerAddress, daBlobHash) {
      if (!signer) throw new Error("No signer (PRIVATE_KEY) for resolveBattle");
      const tx = await cloutBattle.resolveBattle(battleId, winnerAddress, daBlobHash);
      return tx.wait();
    },
    subscribeBattleCreated(cb) {
      cloutBattle.on("BattleCreated", (battleId, challenger, opponent, timestamp) => {
        cb(Number(battleId), challenger, opponent, Number(timestamp));
      });
    },
  };
}

module.exports = { getContractService };
