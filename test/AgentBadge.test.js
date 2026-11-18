const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("AgentBadge", function () {
  async function deployFixture() {
    const [owner, holder, stranger] = await ethers.getSigners();

    // Mock Agent ID contract (stands in for the real one on BNB Chain).
    const MockAgentId = await ethers.getContractFactory("MockAgentId");
    const agentId = await MockAgentId.deploy();

    const AgentBadge = await ethers.getContractFactory("AgentBadge");
    const badge = await AgentBadge.deploy(await agentId.getAddress());

    // Give `holder` an Agent ID; `stranger` gets none.
    await agentId.mint(holder.address);

    return { badge, agentId, owner, holder, stranger };
  }

  it("mints a badge for an Agent ID holder", async function () {
    const { badge, holder } = await loadFixture(deployFixture);

    await expect(badge.connect(holder).mint())
      .to.emit(badge, "BadgeMinted")
      .withArgs(holder.address, 1);

    expect(await badge.balanceOf(holder.address)).to.equal(1);
    expect(await badge.ownerOf(1)).to.equal(holder.address);
    expect(await badge.hasMinted(holder.address)).to.equal(true);
    expect(await badge.badgeOf(holder.address)).to.equal(1);
    expect(await badge.totalMinted()).to.equal(1);
  });

  it("reverts for an address without an Agent ID", async function () {
    const { badge, stranger } = await loadFixture(deployFixture);

    await expect(badge.connect(stranger).mint()).to.be.revertedWithCustomError(
      badge,
      "NotAgentIdHolder"
    );
  });

  it("reverts on a second mint from the same address", async function () {
    const { badge, holder } = await loadFixture(deployFixture);

    await badge.connect(holder).mint();
    await expect(badge.connect(holder).mint()).to.be.revertedWithCustomError(
      badge,
      "AlreadyMinted"
    );
  });

  it("pause blocks minting, unpause restores it (owner only)", async function () {
    const { badge, holder, stranger } = await loadFixture(deployFixture);

    // Non-owner cannot pause.
    await expect(badge.connect(stranger).pause())
      .to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount")
      .withArgs(stranger.address);

    await badge.pause();
    await expect(badge.connect(holder).mint()).to.be.revertedWithCustomError(
      badge,
      "EnforcedPause"
    );

    await badge.unpause();
    await badge.connect(holder).mint();
    expect(await badge.balanceOf(holder.address)).to.equal(1);
  });

  it("tokenURI returns on-chain metadata", async function () {
    const { badge, holder } = await loadFixture(deployFixture);

    await badge.connect(holder).mint();
    const uri = await badge.tokenURI(1);
    expect(uri.startsWith("data:application/json;base64,")).to.equal(true);

    const json = JSON.parse(
      Buffer.from(uri.replace("data:application/json;base64,", ""), "base64").toString("utf8")
    );
    expect(json.name).to.equal("AgentBadge #1");
    expect(json.attributes[0].value).to.equal("Agent ID Holder Badge");
  });

  it("reverts when deployed with a zero Agent ID address", async function () {
    const AgentBadge = await ethers.getContractFactory("AgentBadge");
    await expect(AgentBadge.deploy(ethers.ZeroAddress)).to.be.revertedWithCustomError(
      AgentBadge,
      "ZeroAgentIdAddress"
    );
  });
});
