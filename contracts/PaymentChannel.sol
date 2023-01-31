// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract PaymentChannel {

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant SIGNING_KEY_MESSAGE_TYPEHASH =
        keccak256("SigningKeyMessage(address signingKey,uint256 expiration,EIP2612PermitMessage msg)EIP2612PermitMessage(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)");

    bytes32 private constant MICROPAYMENT_MESSAGE_TYPEHASH =
        keccak256("MicropaymentMessages(address recipient,uint256 nonce,uint256 amount,uint8 v,bytes32 r,bytes32 s)");

    struct EIP2612PermitMessage {
        address owner;
        address spender;
        uint256 value;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct SigningKeyMessage {
        address signingKey;
        uint256 expiration;
        EIP2612PermitMessage msg;
    }

    struct MicropaymentMessages {
        address recipient;
        uint256 nonce;
        uint256 amount;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }
    
    /// @notice Using an array of EIP-2612 messages, withdraw the authorized amount of ERC20 token from each user's wallet
    /// @dev This system will only work for EIP-2612-compatible ERC20
    /// tokens (e.g. USDC)
    /// @param arrayOfPermitMessages an array of structs containing data necessary to securely authorize user micropayments to the service provider
    function settleChannels(MicropaymentMessages[] calldata arrayOfPermitMessages) external {

    }
}
