// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PIDToken is ERC20, Ownable {
    constructor() ERC20("Piduct Token", "PID") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }

    // Testnet faucet — anyone can call this on Sepolia
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}