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

## Next Steps

1. Deploy contracts to 0G testnet
2. Set up backend service for sentiment analysis
3. Build frontend interface
4. Integrate with 0G Compute Network for AI sentiment analysis
5. Integrate with 0G Storage for battle replays
