const express = require("express");
const cors = require("cors");
const config = require("./config");
const { getContractService } = require("./services/contractService");
const { computeMockSentiment, pickWinner } = require("./services/battleResolver");

const app = express();
app.use(cors());
app.use(express.json());

let contracts = null;
const registeredUsers = new Map(); // address -> { twitterHandle, redditHandle }

async function init() {
  if (!config.b33fCoinAddress || !config.cloutBattleAddress) {
    console.warn("B33F_COIN_ADDRESS or CLOUT_BATTLE_ADDRESS not set. Contract APIs will fail until you deploy and set .env");
    return;
  }
  try {
    contracts = await getContractService(config);
    console.log("Connected to contracts at", config.rpcUrl);

    // Index UserRegistered from past events and new ones
    const filter = contracts.cloutBattle.filters.UserRegistered();
    const past = await contracts.cloutBattle.queryFilter(filter);
    past.forEach((e) => {
      registeredUsers.set(e.args.user.toLowerCase(), {
        twitterHandle: e.args.twitterHandle,
        redditHandle: e.args.redditHandle,
      });
    });
    contracts.cloutBattle.on("UserRegistered", (user, twitterHandle, redditHandle) => {
      registeredUsers.set(user.toLowerCase(), { twitterHandle, redditHandle });
    });

    // On BattleCreated: resolve with mock sentiment (local mode)
    if (config.isLocal && config.privateKey) {
      contracts.subscribeBattleCreated(async ({ battleId, challenger, opponent }) => {
        console.log("BattleCreated", battleId, challenger, opponent);
        try {
          const [userChallenger, userOpponent] = await Promise.all([
            contracts.getUser(challenger),
            contracts.getUser(opponent),
          ]);
          const handlesChallenger = {
            twitterHandle: userChallenger.twitterHandle,
            redditHandle: userChallenger.redditHandle,
          };
          const handlesOpponent = {
            twitterHandle: userOpponent.twitterHandle,
            redditHandle: userOpponent.redditHandle,
          };

          const sentChallenger = computeMockSentiment(
            challenger,
            handlesChallenger.twitterHandle,
            handlesChallenger.redditHandle,
            opponent,
            handlesOpponent
          );
          const sentOpponent = computeMockSentiment(
            opponent,
            handlesOpponent.twitterHandle,
            handlesOpponent.redditHandle,
            challenger,
            handlesChallenger
          );

          await contracts.updateSentimentScore(challenger, sentChallenger.finalScore);
          await contracts.updateSentimentScore(opponent, sentOpponent.finalScore);

          const winnerIsChallenger = pickWinner(sentChallenger.finalScore, sentOpponent.finalScore) === "challenger";
          const winner = winnerIsChallenger ? challenger : opponent;
          const daBlobHash = "0x" + Buffer.from(`battle-${battleId}-${winner}`).toString("hex").padStart(64, "0").slice(0, 64);

          await contracts.resolveBattle(battleId, winner, daBlobHash);
          console.log("Battle resolved:", battleId, "winner:", winner);
        } catch (err) {
          console.error("Error resolving battle:", err);
        }
      });
    }
  } catch (e) {
    console.error("Contract init error:", e.message);
  }
}

// GET list of registered users (for opponent picker)
app.get("/api/users", async (req, res) => {
  try {
    const list = [];
    for (const [addr, handles] of registeredUsers) {
      try {
        const user = contracts ? await contracts.getUser(addr) : null;
        if (user && user.registered) {
          list.push({
            address: addr,
            twitterHandle: handles.twitterHandle,
            redditHandle: handles.redditHandle,
            sentimentScore: user.sentimentScore.toString(),
            battlesWon: user.battlesWon.toString(),
            battlesLost: user.battlesLost.toString(),
          });
        }
      } catch (_) {
        list.push({ address: addr, ...handles });
      }
    }
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/user/:address", async (req, res) => {
  const address = (req.params.address || "").toLowerCase();
  if (!contracts) return res.status(503).json({ error: "Contracts not configured" });
  try {
    const user = await contracts.getUser(address);
    const handles = registeredUsers.get(address) || {};
    res.json({
      address,
      twitterHandle: user.twitterHandle,
      redditHandle: user.redditHandle,
      sentimentScore: user.sentimentScore.toString(),
      battlesWon: user.battlesWon.toString(),
      battlesLost: user.battlesLost.toString(),
      registered: user.registered,
      ...handles,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/battle/:id", async (req, res) => {
  if (!contracts) return res.status(503).json({ error: "Contracts not configured" });
  try {
    const id = parseInt(req.params.id, 10);
    const battle = await contracts.getBattle(id);
    const status = ["Pending", "Resolved", "Cancelled"][Number(battle.status)] || "Unknown";
    res.json({
      id,
      challenger: battle.challenger,
      opponent: battle.opponent,
      challengerSentiment: battle.challengerSentiment.toString(),
      opponentSentiment: battle.opponentSentiment.toString(),
      winner: battle.winner,
      status,
      createdAt: battle.createdAt.toString(),
      resolvedAt: battle.resolvedAt.toString(),
      daBlobHash: battle.daBlobHash,
      rewardAmount: battle.rewardAmount.toString(),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/battles", async (req, res) => {
  if (!contracts) return res.status(503).json({ error: "Contracts not configured" });
  try {
    const total = await contracts.getTotalBattles();
    const list = [];
    for (let i = 0; i < Number(total); i++) {
      const b = await contracts.getBattle(i);
          list.push({
            id: i,
            challenger: b.challenger,
            opponent: b.opponent,
            winner: b.winner,
            status: ["Pending", "Resolved", "Cancelled"][Number(b.status)],
          });
    }
    res.json(list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/balance/:address", async (req, res) => {
  if (!contracts) return res.status(503).json({ error: "Contracts not configured" });
  try {
    const balance = await contracts.getBalance(req.params.address);
    res.json({ balance: balance.toString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/config", (req, res) => {
  res.json({
    chainId: config.rpcUrl.includes("8545") ? 31337 : 16602,
    b33fCoinAddress: config.b33fCoinAddress || "",
    cloutBattleAddress: config.cloutBattleAddress || "",
    isLocal: config.isLocal,
  });
});

const PORT = config.port;
init().then(() => {
  app.listen(PORT, () => {
    console.log(`Clout Battle API running on http://localhost:${PORT} (local=${config.isLocal})`);
  });
});
