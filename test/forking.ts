import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import * as helpers from "@nomicfoundation/hardhat-network-helpers";

import { expect } from "chai";
import hre, { ethers } from "hardhat";

// The following code is an example of how we can use Hardhat's mainnet forking
// feature to pretend to be the owner of the USDC contract, and mint 1 million USDC
// to an arbitrary address (Alice's).
//
// I see 2 big ways this is useful:
//
// 1) You are a protocol dev who is about to make a complicated and possibly destructive
// change to your mainnet contracts (for instance, upgrading a contract) and you want to
// simulate exactly how it will work when you execute your upgrade on mainnet
//
// 2) You are a [white/black]hat hacker, and you want to simulate your attack on the
// victims contract
describe("debug settleChannel", function () {
  it("test", async () => {
    // all of the addresses we'll need
    const me = "0xb8F80C130fA10491C0f06D7b4eE1d87093940640"
    const paymentChannelAddress = '0x3afa5f5c6577a85be70a73b60eb08aea903ebc8b'

    // Impersonate as the owner of the master USDC minter contract
    // so we can mint some USDC for Alice
    
    await helpers.impersonateAccount(me);

    // setup all the contract state we'll need
    const impersonatedSigner: SignerWithAddress = await ethers.getSigner(me);
    const [alice] = await ethers.getSigners();

    const paymentChannelFactory = await ethers.getContractFactory("PaymentChannel");

    const paymentChannel = await paymentChannelFactory.attach(paymentChannelAddress)

    const signingKeyMessage = {
      "id": 9,
      "token": "0x99109f7aed252eb4bf42c857ad57d3f056d1f692",
      "signingKeyAddress": "0xEc7d8A1C3F11EeAfFf0ACC3d5a68AAe6e8ccD3B1",
      "recipient": "0x0c6f066cd27a055e13dc3e476e429733641e4dcf",
      "permitMsg": {
        "owner": "0xb8F80C130fA10491C0f06D7b4eE1d87093940640",
        "spender": "0x3afa5f5c6577a85be70a73b60eb08aea903ebc8b",
        "value": "10000000000000000",
        "nonce": 0,
        "deadline": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "v": 27,
        "r": "0x8ae409378c84856d2a856ce5dba49bba97a33dc23e6bce31b5a8ad6e1988c99f",
        "s": "0x6ca47d13b87586d29435ce4e37ee5e40f3190e962c8e5d7c893360004616b33e"
      },
      "v": 27,
      "r": "0x7c1ffe079e7e643ce847be5227efd5d3a623c6f286910813d8633d030bfb2713",
      "s": "0x59757880d80e0d4ba23112331b85265f87294421f6095733eda505eaca1ffd0c"
    }
    const micropaymentMessage = {
      "id": 9,
      "amount": 1,
      "v": 28,
      "r": "0xafb10713122cccd6d82dc8f90bfbc69fd03a69fa981bb7edca7c4d080a451df1",
      "s": "0x4b39e1e67250f31f737f99c8709719780a91796f6e7f8227374b2734bbd47255"
    }
    await paymentChannel.connect(impersonatedSigner).settleChannel(
      signingKeyMessage,
      micropaymentMessage
    );

  })
});
