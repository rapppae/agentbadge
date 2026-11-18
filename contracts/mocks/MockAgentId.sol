// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/// @notice Minimal ERC-721 used ONLY in tests to stand in for the real
/// Agent ID contract (0x60b9262456de011f7d15a54cdd8c48baaa8b022f on BNB Chain).
/// It exposes a public mint so tests can give an address an "Agent ID".
contract MockAgentId is ERC721 {
    uint256 private _nextTokenId = 1;

    constructor() ERC721("MockAgentId", "MAID") {}

    function mint(address to) external returns (uint256 tokenId) {
        tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(to, tokenId);
    }
}
