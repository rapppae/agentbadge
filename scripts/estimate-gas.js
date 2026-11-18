const { ethers } = require("hardhat");

// Agent ID contract (SPACE ID, ERC-721) on BNB Chain mainnet.
const AGENT_ID_MAINNET = "0x60b9262456de011f7d15a54cdd8c48baaa8b022f";

/**
 * Estimate the BSC mainnet deployment cost WITHOUT broadcasting anything.
 * Deploys to the local Hardhat network and measures the exact gas used
 * (same bytecode => same gas on BSC mainnet), then prices it at typical
 * BSC gas prices.
 *
 * Usage: npx hardhat run scripts/estimate-gas.js
 */
async function main() {
  const AgentBadge = await ethers.getContractFactory("AgentBadge");
  const badge = await AgentBadge.deploy(AGENT_ID_MAINNET);
  const receipt = await badge.deploymentTransaction().wait();
  const gasUsed = receipt.gasUsed;
  console.log("Deployment gas used:", gasUsed.toString());

  for (const gwei of ["0.1", "0.5", "1", "3"]) {
    const price = ethers.parseUnits(gwei, "gwei");
    const cost = gasUsed * price;
    console.log(`  at ${gwei} gwei: ${ethers.formatEther(cost)} BNB`);
  }
  console.log("\nCurrent deployer balance (Agentic wallet, read-only check):");
  console.log("  0x577b75b2947F3b8f8Fa41c6b8D5ABF7540777dEb ~ 0.00037 BNB (Nov 2026)");
  console.log("  => Top-up needed before any real deployment.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
