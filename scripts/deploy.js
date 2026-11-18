const { ethers } = require("hardhat");

// Agent ID contract (SPACE ID, ERC-721) on BNB Chain mainnet.
const AGENT_ID_MAINNET = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

/**
 * Deploy AgentBadge to the selected network.
 *
 * Usage (DO NOT run until the deploy wallet is funded and the user confirms):
 *   npx hardhat run scripts/deploy.js --network bsc
 *
 * Env:
 *   DEPLOY_KEY        deployer private key (never commit, never paste in chat)
 *   AGENT_ID_ADDRESS  override the Agent ID contract (defaults to mainnet)
 */
async function main() {
  const agentIdAddress = process.env.AGENT_ID_ADDRESS || AGENT_ID_MAINNET;
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);
  console.log("Agent ID contract:", agentIdAddress);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "BNB"
  );

  const AgentBadge = await ethers.getContractFactory("AgentBadge");
  const badge = await AgentBadge.deploy(agentIdAddress);
  await badge.waitForDeployment();
  const address = await badge.getAddress();
  const receipt = await badge.deploymentTransaction().wait();

  console.log("AgentBadge deployed at:", address);
  console.log("Deployment gas used:", receipt.gasUsed.toString());
  console.log("Tx hash:", receipt.hash);
  console.log("\nVerify on BscScan:");
  console.log(`  npx hardhat verify --network bsc ${address} ${agentIdAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
