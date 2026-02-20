# Start Fresh – Local Test (Clout Battle)

Do this from the **repo root**. Use 3 terminals.

---

## 1. Clean slate (optional)

If you want to reset everything:

```bash
# Stop any running node/backend/frontend (Ctrl+C)

# Remove old env and deployed addresses
rm -f backend/.env backend/deployed-local.json

# Reinstall if things are broken (optional)
rm -rf node_modules backend/node_modules frontend/node_modules
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

---

## 2. Terminal 1 – Start the chain

```bash
npm run node
```

Leave it running. You should see something like:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545
Account #0: 0xf39Fd... (10000 ETH)
Private Key: 0xac0974...
```

---

## 3. Terminal 2 – Deploy contracts

```bash
npm run deploy:local
```

You must see:

- `B33fCoin deployed to: 0x...`
- `CloutBattle deployed to: 0x...`
- `Wrote backend/.env and backend/deployed-local.json`

If you don’t see “Wrote backend/.env and backend/deployed-local.json”, the chain in Terminal 1 probably isn’t running or isn’t localhost.

---

## 4. Terminal 2 – Start the backend

Same terminal, after deploy:

```bash
npm run backend
```

You should see:

- `Backend config: RPC=... B33F=set CloutBattle=set`
- `Clout Battle API running on http://localhost:3001`

Leave it running.

---

## 5. Terminal 3 – Start the frontend

```bash
npm run frontend
```

Open **http://localhost:3000** in your browser.

---

## 6. Use the app

1. **MetaMask**
   - Add network: RPC `http://127.0.0.1:8545`, Chain ID `31337`.
   - Import an account: use one of the **private keys** from the `npm run node` output (e.g. Account #0 or #1).

2. **In the app**
   - Click **Connect Wallet**.
   - You should see “Challenge someone” and either a dropdown + **Create Battle** or “No other registered users yet”.
   - **Register** (any Twitter + Reddit handles).
   - To battle: open another browser (or incognito), connect a **different** Hardhat account, register that one too. Then in the first window you’ll see that user in the dropdown; pick them and click **Create Battle**.

3. **Refresh** the page to see updated battles and leaderboard.

---

## If something’s wrong

- **“Contract addresses not loaded”**  
  - Backend must be running and must have started **after** `deploy:local`.  
  - Restart backend: stop it (Ctrl+C), then run `npm run backend` again.

- **No “Create Battle” / “Challenge someone”**  
  - Backend must be running on port 3001.  
  - Open http://localhost:3001/api/config – you should see `b33fCoinAddress` and `cloutBattleAddress` (non-empty).  
  - If that works but the app still doesn’t, hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R).

- **Deploy fails**  
  - Make sure `npm run node` is running in another terminal before `npm run deploy:local`.

- **Backend shows “B33F=missing” or “CloutBattle=missing”**  
  - Run `npm run deploy:local` again (with node running), then restart the backend.
