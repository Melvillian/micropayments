// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {PaymentChannel} from "../PaymentChannel.sol";

contract TestPaymentChannel is PaymentChannel {
    function validateSigningKeyMessage(SigningKeyMessage calldata skMsg)
        external
        view
    {
        super._validateSigningKeyMessage(skMsg);
    }

    function validateMicropaymentMessage(
        address signingKeyAddress,
        MicropaymentMessage calldata mpMsg
    ) external view {
        super._validateMicropaymentMessage(signingKeyAddress, mpMsg);
    }
}
