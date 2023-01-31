// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
pragma solidity ^0.8.9;

contract PermitERC20 is ERC20Permit {
    constructor() ERC20("Test", "TST") ERC20Permit("PermitERC20") {
        _mint(msg.sender, 1_000 * 10**decimals());
    }
}
