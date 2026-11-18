// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title AgentBadge
/// @notice A free ERC-721 badge NFT, mintable only by Binance Agent ID holders.
/// @dev Agent ID is the on-chain name (name.ai) of a Binance Agentic Wallet.
///      It is an ERC-721 (SPACE ID) on BNB Chain at
///      0x60b9262456de011f7d15a54cdd8c48baaa8b022f. Holding an Agent ID is
///      proven by `balanceOf(holder) > 0` on that contract.
///      One badge per address, free to mint (value 0, gas only).
///      The contract owner can only pause/unpause minting. There is no
///      admin mint, no fee, no royalty, no upgradeability, and no way for
///      the owner to move or burn anyone's badge.
/// @custom:security-contact See README.md in the repository.
contract AgentBadge is ERC721, Ownable, Pausable {
    using Strings for uint256;

    /// @notice The Agent ID ERC-721 contract on BNB Chain.
    IERC721 public immutable agentId;

    /// @notice Next token id to mint (starts at 1).
    uint256 private _nextTokenId = 1;

    /// @notice Total badges minted so far.
    uint256 public totalMinted;

    /// @notice True if an address has already minted its one badge.
    mapping(address => bool) public hasMinted;

    /// @notice Badge token id owned by an address (0 if none).
    mapping(address => uint256) public badgeOf;

    /// @notice Emitted when a badge is minted.
    event BadgeMinted(address indexed minter, uint256 indexed tokenId);

    /// @notice Emitted when minting is paused/unpaused (from Pausable, kept for clarity).
    event MintingPaused(address indexed account);
    event MintingUnpaused(address indexed account);

    /// @notice Caller does not hold an Agent ID.
    error NotAgentIdHolder();
    /// @notice Caller already minted its one badge.
    error AlreadyMinted();
    /// @notice Agent ID contract address is zero.
    error ZeroAgentIdAddress();

    /// @param agentIdAddress Address of the Agent ID ERC-721 contract.
    constructor(address agentIdAddress) ERC721("AgentBadge", "ABADGE") Ownable(msg.sender) {
        if (agentIdAddress == address(0)) revert ZeroAgentIdAddress();
        agentId = IERC721(agentIdAddress);
    }

    /// @notice Mint the caller's one free badge.
    /// @dev Requirements:
    ///      - contract is not paused
    ///      - caller has not minted before
    ///      - caller holds at least one Agent ID (balanceOf > 0)
    /// @return tokenId The id of the newly minted badge.
    function mint() external whenNotPaused returns (uint256 tokenId) {
        if (hasMinted[msg.sender]) revert AlreadyMinted();
        if (agentId.balanceOf(msg.sender) == 0) revert NotAgentIdHolder();

        tokenId = _nextTokenId;
        _nextTokenId += 1;
        totalMinted += 1;
        hasMinted[msg.sender] = true;
        badgeOf[msg.sender] = tokenId;

        _safeMint(msg.sender, tokenId);
        emit BadgeMinted(msg.sender, tokenId);
    }

    /// @notice Pause minting (owner only). Existing badges are unaffected.
    function pause() external onlyOwner {
        _pause();
        emit MintingPaused(msg.sender);
    }

    /// @notice Unpause minting (owner only).
    function unpause() external onlyOwner {
        _unpause();
        emit MintingUnpaused(msg.sender);
    }

    /// @notice On-chain metadata for a badge (no external dependency).
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        string memory idStr = tokenId.toString();
        string memory json = string(
            abi.encodePacked(
                '{"name":"AgentBadge #',
                idStr,
                '","description":"A free badge proving the holder owns a Binance Agent ID (name.ai) on BNB Chain. One badge per Agent ID holder.","image":"https://raw.githubusercontent.com/rapppae/agentbadge/main/frontend/badge.svg","attributes":[{"trait_type":"Type","value":"Agent ID Holder Badge"},{"trait_type":"Token ID","value":"',
                idStr,
                '"}]}'
            )
        );
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }
}
