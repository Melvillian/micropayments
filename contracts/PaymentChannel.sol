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

        // TODO: make sure only the skMsg.recipient (a.k.a. service provider) is able to call this function
        // for this id, otherwise the user could submit an earlier message and steal funds...
        // Update: but wait, then the service could act malicious and never close it out, and withdraw MAX_UINT256
        // from the user's wallet... hm, need to think about this more
        //
        // Ah ok here's how to solve it. There needs to be a penalty tx signed by the user that can be submitted
        // by the service provider if the user broadcasts an earlier message. There are needs to be a window of
        // time where the funds are not withdrawable by the user if they close it out, and the penalty tx needs
        // to be submitted within that window. If no earlier message is broadcast, then the service provider
        // should be able to close out the channel with the latest message, and withdraw the funds.

        // 4. mark id as used. This id is to ensure that the same message can't be used twice
        alreadyUsedIds[skMsg.id] = true;

        emit ChannelSettled(
            skMsg.id,
            skMsg.token,
            skMsg.signingKeyAddress,
            skMsg.recipient,
            mpMsg.amount
        );

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

        // 6. transfer the payment message amount to the recipient
        uint256 min = mpMsg.amount < skMsg.permitMsg.value
            ? mpMsg.amount
            : skMsg.permitMsg.value;
        IERC20(skMsg.token).transferFrom(
            skMsg.permitMsg.owner,
            skMsg.recipient,
            min
        );
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

    event ChannelSettled(
        uint256 id,
        address token,
        address signingKeyAddress,
        address recipient,
        uint256 amount
    );

    error InvalidInputLength();
    error IdAlreadyUsed(uint256 id);
    error InvalidSigningMessageSignature();
    error InvalidMicropaymentMessageSignature();
    error InvalidSpender(address spender);
    error DeadlineTooEarly(uint256 blockTimestamp, uint256 deadline);
    error InvalidId(uint256 skMsgId, uint256 mpMsgId);
}
