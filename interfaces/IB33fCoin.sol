// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IB33fCoin {
    function mint(address to, uint256 amount) external;
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external;
    function battleContract() external view returns (address);
}
