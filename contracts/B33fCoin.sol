// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title B33fCoin
 * @dev ERC20 token for Clout Battle dApp rewards
 * Only the CloutBattle contract can mint new tokens
 */
contract B33fCoin is ERC20, ERC20Burnable, Ownable {
    // Address of the CloutBattle contract that can mint tokens
    address public battleContract;

    event BattleContractUpdated(address indexed oldContract, address indexed newContract);

    constructor(address initialOwner) ERC20("B33f Coin", "B33F") Ownable(initialOwner) {
        // Initial supply: 0 (all tokens minted through battles)
    }

    /**
     * @dev Set the CloutBattle contract address
     * @param _battleContract Address of the CloutBattle contract
     */
    function setBattleContract(address _battleContract) external onlyOwner {
        require(_battleContract != address(0), "B33fCoin: battle contract cannot be zero address");
        address oldContract = battleContract;
        battleContract = _battleContract;
        emit BattleContractUpdated(oldContract, _battleContract);
    }

    /**
     * @dev Mint tokens to a winner
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external {
        require(msg.sender == battleContract, "B33fCoin: only battle contract can mint");
        require(to != address(0), "B33fCoin: cannot mint to zero address");
        _mint(to, amount);
    }

    /**
     * @dev Batch mint tokens to multiple addresses
     * @param recipients Array of addresses to mint to
     * @param amounts Array of amounts to mint
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external {
        require(msg.sender == battleContract, "B33fCoin: only battle contract can mint");
        require(recipients.length == amounts.length, "B33fCoin: arrays length mismatch");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "B33fCoin: cannot mint to zero address");
            _mint(recipients[i], amounts[i]);
        }
    }
}
