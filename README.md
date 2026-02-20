# Clout Battle dApp - Smart Contracts

Onchain battle game built on 0G blockchain where users compete 1v1 based on their social media community sentiment.

## Contracts

### B33fCoin.sol
ERC20 token contract for battle rewards. Features:
- Only the CloutBattle contract can mint tokens
- Burnable tokens
- Batch minting support

### CloutBattle.sol
Main battle game contract. Features:
- User registration with Twitter/X and Reddit handles
- Battle creation and resolution
- Sentiment score storage
- Battle history and leaderboard
- DA blob hash storage for verification
- Reward distribution

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Add your private key to `.env`:
```
PRIVATE_KEY=your_private_key_here
```

## Compile

```bash
npx hardhat compile
```

## Deploy

Deploy to 0G testnet:
```bash
npx hardhat run scripts/deploy.js --network 0g-testnet
```

## Network Configuration

- **Testnet**: Chain ID 16602, RPC: `https://evmrpc-testnet.0g.ai`
- **Mainnet**: Chain ID 16661, RPC: `https://evmrpc.0g.ai`

## Contract Verification

After deployment, verify contracts on 0G Chain Scan:
```bash
npx hardhat verify --network 0g-testnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

## Project Structure

```
contracts/
  ├── B33fCoin.sol      # ERC20 token contract
  └── CloutBattle.sol   # Main battle game contract

interfaces/
  └── IB33fCoin.sol     # B33fCoin interface

scripts/
  └── deploy.js         # Deployment script
```

## Features

- ✅ User registration with social handles
- ✅ Battle creation and resolution
- ✅ Sentiment score management
- ✅ Battle rewards (B33f Coin)
- ✅ DA blob hash storage for verification
- ✅ Battle history tracking
- ✅ Leaderboard support

---

## Test entirely locally

No API keys or testnet needed. Uses Hardhat local node + mock sentiment.

### 1. Install all dependencies

```bash
# Root (contracts)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Start local chain (Terminal 1)

```bash
npm run node
```

Leave this running (default: http://127.0.0.1:8545).

### 3. Deploy contracts (Terminal 2)

```bash
npm run deploy:local
```

This deploys B33fCoin and CloutBattle and writes `backend/.env` with addresses and the owner key for the backend.

### 4. Start backend (Terminal 2, same or new)

```bash
npm run backend
```

API: http://localhost:3001. In local mode it auto-resolves battles with mock sentiment when you create a battle.

### 5. Start frontend (Terminal 3)

```bash
npm run frontend
```

Open http://localhost:3000.

### 6. Use the app

1. **MetaMask**: Add Hardhat Local network (Chain ID 31337, RPC http://127.0.0.1:8545) and import an account from the Hardhat node (e.g. account #0 private key is in Hardhat docs, or use the one printed when you run `npm run node`).
2. **Connect** wallet in the app.
3. **Register** with any Twitter and Reddit handles (not used in local mock).
4. **Open a second browser (or incognito)**, connect a different Hardhat account, register that address too.
5. **Create Battle**: pick the other user and create a battle. The backend will resolve it automatically and the winner gets B33f Coin.
6. **Leaderboard** and **Battles** list update from the API.

---

## Next Steps

1. Deploy contracts to 0G testnet
2. Set up backend service for sentiment analysis
3. Integrate with 0G Compute Network for AI sentiment analysis
4. Integrate with 0G Storage for battle replays
