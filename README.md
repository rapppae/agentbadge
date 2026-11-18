# AgentBadge

A free badge NFT for **Binance Agent ID** holders, built for the **Binance Agent ID Hackathon** (submission period 18 Nov – 9 Dec 2026).

Each mint is one on-chain interaction by an Agent ID holder — exactly the
engagement the hackathon's Growth Award measures.

## What it is

- **AgentBadge** is a free ERC-721 badge on BNB Chain.
- Only wallets that hold an **Agent ID** (`name.ai`, SPACE ID ERC-721 at
  `0x60b9262456de011f7d15a54cdd8c48baaa8b022f`) can mint.
- **One badge per address, free to mint** (value 0, gas only).
- No admin mint, no fees, no royalties, no upgradeability. The owner can
  only pause/unpause minting.

## How Agent ID is used

The contract calls `balanceOf(msg.sender)` on the Agent ID contract at mint
time. If the caller holds at least one Agent ID, the mint succeeds; otherwise
it reverts with `NotAgentIdHolder()`. No off-chain allowlist, no signature,
no database — the check is fully on-chain and auditable.

## Repo layout

- `contracts/AgentBadge.sol` — the badge contract (OpenZeppelin ERC721 + Ownable + Pausable)
- `contracts/mocks/MockAgentId.sol` — test-only stand-in for the Agent ID contract
- `test/AgentBadge.test.js` — Hardhat tests
- `scripts/deploy.js` — BSC mainnet deploy script
- `scripts/estimate-gas.js` — deployment gas estimate (no broadcast)
- `frontend/` — static mint page (injected wallet only, no backend, no QR login)

## Run the tests

```bash
npm install
npx hardhat test
```

## Estimate deployment gas (no broadcast)

```bash
npx hardhat run scripts/estimate-gas.js
```

## Deploy to BSC mainnet

Requires a funded deployer wallet (deployment costs gas; see the estimate
above) and the user's explicit confirmation.

```bash
export DEPLOY_KEY=<deployer private key>   # never commit this
npx hardhat run scripts/deploy.js --network bsc
```

## Verify on BscScan

```bash
export BSCSCAN_API_KEY=<your BscScan API key>
npx hardhat verify --network bsc <DEPLOYED_ADDRESS> 0x60b9262456de011f7d15a54cdd8c48baaa8b022f
```

## Deployed contract

- BNB Chain mainnet: **TODO — fill in after deployment**
- BscScan: **TODO**
- Frontend: **TODO (host `frontend/` as a static page)**

## Hackathon submission

- Announcement: https://www.binance.com/en/support/announcement/detail/95f5dbe0ea674a48a739b59e046648bf
- Submission form/link: **NOT PUBLISHED as of 18 Nov 2026.** The announcement
  says to "submit your project name, website, contract address(es), Agent ID
  usage description, and other required materials during the Submission
  Period" but gives no project-submission URL. The only survey link in the
  announcement is the Promotion Award's "campaign survey" on
  app.binance.com (for X post links). Check the Binance Wallet app and
  @BinanceWallet on X for the project-submission form once it is published.

## Safety notes (hackathon red lines)

- No QR-code login anywhere; the frontend uses only the wallet's injected
  provider and the user confirms every transaction in their own wallet.
- No prompts that bypass user transaction confirmation; no unauthorized
  transfers; no collection of seeds, private keys, API secrets, or pairing
  codes.
- No "Binance"/"BNB" in the project name, token name, or domain.
- No promised returns. The badge is a free proof-of-holding collectible.
- The contract is open-source (this repo) and owner permissions are
  disclosed here: the owner can only pause/unpause minting.
