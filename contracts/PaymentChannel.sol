// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";

contract PaymentChannel {

    uint256 constant SAFE_DURATION = 2 days;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant SIGNING_KEY_MESSAGE_TYPEHASH =
        keccak256("SigningKeyMessage(uint256 id,address token,address signingKey,uint256 expiration,address recipient,Permit msg)Permit(address owner,address spender,uint256 value,uint256 deadline)");

    bytes32 private constant MICROPAYMENT_MESSAGE_TYPEHASH =
        keccak256("MicropaymentMessages(uint256 id,uint256 nonce,uint256 amount)");

    struct Permit {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct SigningKeyMessage {
        uint256 id;
        address token;
        address signingKey;
        uint256 expiration;
        address recipient;

        Permit msg;
    }

    struct MicropaymentMessages {
        uint256 id;
        uint256 nonce;
        uint256 amount;
    }

    function approveFunds(IERC20Permit token, address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) private {
        if (spender != address(this)) revert InvalidSpender(spender);
        if (deadline < block.timestamp + SAFE_DURATION) revert DeadlineTooEarly(block.timestamp, deadline);
        token.permit(owner, spender, value, deadline, v, r, s);
    }

    function createChannel(SigningKeyMessage calldata message) external { 

    }
    
    /// @notice Using an array of EIP-2612 messages, withdraw the authorized amount of ERC20 token from each user's wallet
    /// @dev This system will only work for EIP-2612-compatible ERC20
    /// tokens (e.g. USDC)
    /// @param arrayOfPermitMessages an array of structs containing data necessary to securely authorize user micropayments to the service provider
    function settleChannels(MicropaymentMessages[] calldata arrayOfPermitMessages) external {

    }

    function getDomainSeparator() public view returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    DOMAIN_TYPEHASH,
                    keccak256(bytes("PaymentChannel")),
                    block.chainid,
                    address(this)
                )
            );
    }

    error InvalidSpender(address spender);
    error DeadlineTooEarly(uint256 blockTimestamp, uint256 deadline);
}
