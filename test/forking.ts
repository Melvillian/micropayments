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
      "id": 18,
      "token": "0x99109f7aed252eb4bf42c857ad57d3f056d1f692",
      "signingKeyAddress": "0x3dd2551C297ED26524Adc628463c465A7929f0eB",
      "recipient": "0x0c6f066cd27a055e13dc3e476e429733641e4dcf",
      "permitMsg": {
        "owner": "0xb8F80C130fA10491C0f06D7b4eE1d87093940640",
        "spender": "0x3afa5f5c6577a85be70a73b60eb08aea903ebc8b",
        "value": "10000000000000000",
        "nonce": "1",
        "deadline": "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        "v": 28,
        "r": "0x2b1df6550f252c4f356c84498762f9758c3ac1d7b7899e7b0ace6545e10a1642",
        "s": "0x60c64250ba1fc5016aabca8cfc43b4573b7334a5aabdd9bc0447785c4a9a5c80"
      },
      "v": 28,
      "r": "0xf3bf59397db417df2845232486a04dddbda0edb5c5d6daa071a793beb83374a0",
      "s": "0x4c3193d692c9dc0e7000a5855b583796576c0ba9132c14d9ba21a9aa233e3975"
    }
    
    const micropaymentMessage = {
      "id": 18,
      "amount": 2,
      "v": 28,
      "r": "0xd4dfd81968dc15dbe5dacdc7c47a276cf2d905685615d781e3c2aef4dee14991",
      "s": "0x2f8e030a51857b24f7cf0a4b08f9e98f2683f16b414059d2654184fd2e6c212e"
    }
    await paymentChannel.connect(impersonatedSigner).settleChannel(
      signingKeyMessage,
      micropaymentMessage
    );

  })
});
