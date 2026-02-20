const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy B33fCoin
  console.log("\nDeploying B33fCoin...");
  const B33fCoin = await ethers.getContractFactory("B33fCoin");
  const b33fCoin = await B33fCoin.deploy(deployer.address);
  await b33fCoin.waitForDeployment();
  const b33fCoinAddress = await b33fCoin.getAddress();
  console.log("B33fCoin deployed to:", b33fCoinAddress);

  // Deploy CloutBattle
  console.log("\nDeploying CloutBattle...");
  const CloutBattle = await ethers.getContractFactory("CloutBattle");
  const cloutBattle = await CloutBattle.deploy(b33fCoinAddress, deployer.address);
  await cloutBattle.waitForDeployment();
  const cloutBattleAddress = await cloutBattle.getAddress();
  console.log("CloutBattle deployed to:", cloutBattleAddress);

  // Set CloutBattle as the battle contract in B33fCoin
  console.log("\nSetting CloutBattle as battle contract in B33fCoin...");
  const setBattleTx = await b33fCoin.setBattleContract(cloutBattleAddress);
  await setBattleTx.wait();
  console.log("Battle contract set successfully");

  console.log("\n=== Deployment Summary ===");
  console.log("B33fCoin:", b33fCoinAddress);
  console.log("CloutBattle:", cloutBattleAddress);
  console.log("\nSave these addresses for your .env file:");
  console.log(`B33F_COIN_ADDRESS=${b33fCoinAddress}`);
  console.log(`CLOUT_BATTLE_ADDRESS=${cloutBattleAddress}`);

  // When running on localhost, write backend/.env for local testing
  const network = process.env.HARDHAT_NETWORK || "";
  if (network === "localhost") {
    const fs = require("fs");
    const path = require("path");
    const backendEnv = path.join(__dirname, "..", "backend", ".env");
    const content = [
      "RPC_URL=http://127.0.0.1:8545",
      "LOCAL=true",
      `B33F_COIN_ADDRESS=${b33fCoinAddress}`,
      `CLOUT_BATTLE_ADDRESS=${cloutBattleAddress}`,
      "PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    ].join("\n");
    fs.writeFileSync(backendEnv, content, "utf8");
    console.log("\nWrote", backendEnv);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
