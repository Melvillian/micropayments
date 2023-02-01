// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract PaymentChannel is EIP712 {
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256(
            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

    bytes32 private constant SIGNING_KEY_MESSAGE_TYPEHASH =
        keccak256(
            "SigningKeyMessage(uint256 id,address token,address signingKeyAddress,address recipient,Permit permitMsg,uint8 v,bytes32 r,bytes32 s)Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        );

    bytes32 private constant MICROPAYMENT_MESSAGE_TYPEHASH =
        keccak256("MicropaymentMessage(uint256 id,uint256 amount)");

    mapping(uint256 => bool) alreadyUsedIds;

    struct Permit {
        address owner;
        address spender;
        uint256 value;
        uint256 nonce;
        uint256 deadline;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct SigningKeyMessage {
        uint256 id;
        address token;
        address signingKeyAddress;
        address recipient;
        Permit permitMsg;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    struct MicropaymentMessage {
        uint256 id;
        uint256 amount;
        uint8 v;
        bytes32 r;
        bytes32 s;
    }

    constructor() EIP712("PaymentChannel", "1") {}

    function settleChannel(
        SigningKeyMessage calldata skMsg,
        MicropaymentMessage calldata mpMsg
    ) public {
        // 1. validate SigningKeyMessage
        _validateSigningKeyMessage(skMsg);

        // 2. validate MicropaymentMessage using signing key
        _validateMicropaymentMessage(skMsg.signingKeyAddress, mpMsg);

        // 3. check that id's match
        if (skMsg.id != mpMsg.id) revert InvalidId(skMsg.id, mpMsg.id);
        if (alreadyUsedIds[skMsg.id]) revert IdAlreadyUsed(skMsg.id);

        // 4. mark id as used
        alreadyUsedIds[skMsg.id] = true;

        // 5. approve funds to be transferred
        // TODO: handle fee-on-transfer tokens
        IERC20Permit(skMsg.token).permit(
            skMsg.permitMsg.owner,
            address(this),
            skMsg.permitMsg.value,
            skMsg.permitMsg.deadline,
            skMsg.permitMsg.v,
            skMsg.permitMsg.r,
            skMsg.permitMsg.s
        );

        // 6. transfer the difference between the channel balance and the micropayment amount
        //    to the recipient
        uint256 min = mpMsg.amount < skMsg.permitMsg.value
            ? mpMsg.amount
            : skMsg.permitMsg.value;
        uint256 amountToTransfer = skMsg.permitMsg.value - min;
        IERC20(skMsg.token).transfer(skMsg.recipient, amountToTransfer);
    }

    /// @notice Using an array of EIP-2612 messages, withdraw the authorized amount of ERC20 token from each user's wallet
    /// @dev This system will only work for EIP-2612-compatible ERC20
    /// tokens (e.g. USDC)
    /// @param skMsgs array of messages authorizing the channel to pull funds from the user's wallet
    /// into the channel
    /// @param mpMsgs array of messages that authorizes the channel to transfer funds to the recipient
    function settleChannels(
        SigningKeyMessage[] calldata skMsgs,
        MicropaymentMessage[] calldata mpMsgs
    ) external {
        if (skMsgs.length != mpMsgs.length) revert InvalidInputLength();
        for (uint256 i = 0; i < skMsgs.length; i++) {
            settleChannel(skMsgs[i], mpMsgs[i]);
        }
    }

    function _validateSigningKeyMessage(SigningKeyMessage calldata skMsg)
        internal
        view
    {
        bytes32 structHash = keccak256(
            abi.encode(
                SIGNING_KEY_MESSAGE_TYPEHASH,
                skMsg.id,
                skMsg.token,
                skMsg.signingKeyAddress,
                skMsg.recipient,
                keccak256(
                    abi.encode(
                        PERMIT_TYPEHASH,
                        skMsg.permitMsg.owner,
                        skMsg.permitMsg.spender,
                        skMsg.permitMsg.value,
                        skMsg.permitMsg.nonce,
                        skMsg.permitMsg.deadline
                    )
                ),
                skMsg.permitMsg.v,
                skMsg.permitMsg.r,
                skMsg.permitMsg.s
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address recoveredAddress = ecrecover(digest, skMsg.v, skMsg.r, skMsg.s);
        if (recoveredAddress != skMsg.permitMsg.owner)
            revert InvalidSigningMessageSignature();
    }

    function _validateMicropaymentMessage(
        address signingKeyAddress,
        MicropaymentMessage calldata mpMsg
    ) internal view {
        bytes32 structHash = keccak256(
            abi.encode(MICROPAYMENT_MESSAGE_TYPEHASH, mpMsg.id, mpMsg.amount)
        );
        bytes32 digest = _hashTypedDataV4(structHash);

        address recoveredAddress = ecrecover(digest, mpMsg.v, mpMsg.r, mpMsg.s);
        if (recoveredAddress != signingKeyAddress)
            revert InvalidMicropaymentMessageSignature();
    }

    error InvalidInputLength();
    error IdAlreadyUsed(uint256 id);
    error InvalidSigningMessageSignature();
    error InvalidMicropaymentMessageSignature();
    error InvalidSpender(address spender);
    error DeadlineTooEarly(uint256 blockTimestamp, uint256 deadline);
    error InvalidId(uint256 skMsgId, uint256 mpMsgId);
}
