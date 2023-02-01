import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Signature, Wallet } from "ethers";

import {
  TestPaymentChannel,
  TestPaymentChannel__factory,
} from "../typechain-types";
import { signPermitMessage, signSigningKeyMessage } from "./utils";

const MAX_UINT256 = BigNumber.from(2).pow(256).sub(1);
const CHANNEL_MAX_AMOUNT = ethers.utils.parseEther("0.001");

describe("PaymentChannel", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // get 3 signers
    const [deployer, serviceProvider, bob] = await ethers.getSigners();

    // deploys the contracts
    const PaymentChannel: TestPaymentChannel__factory =
      await ethers.getContractFactory("TestPaymentChannel");
    const paymentChannel: TestPaymentChannel = await PaymentChannel.deploy();
    // use this as our example USDC token that supports EIP-2612
    const PermitERC20 = await ethers.getContractFactory("PermitERC20");
    const erc20 = await PermitERC20.deploy();

    return { paymentChannel, erc20, deployer, serviceProvider, bob };
  }

  describe("Everything", async () => {
    it("permit signing works", async () => {
      const { paymentChannel, erc20, deployer } = await loadFixture(
        deployFixture
      );

      const permitSig: Signature = await signPermitMessage(
        erc20,
        deployer,
        paymentChannel.address,
        CHANNEL_MAX_AMOUNT,
        BigNumber.from(0),
        MAX_UINT256 // never expires
      );
      const { v, r, s } = ethers.utils.splitSignature(permitSig);

      await expect(
        erc20.permit(
          deployer.address,
          paymentChannel.address,
          CHANNEL_MAX_AMOUNT,
          MAX_UINT256,
          v,
          r,
          s
        )
      ).to.not.be.reverted;

      expect(
        await erc20.allowance(deployer.address, paymentChannel.address)
      ).to.equal(CHANNEL_MAX_AMOUNT);
    });

    it("validateSigningKeyMessage works", async () => {
      const { paymentChannel, erc20, deployer, serviceProvider } =
        await loadFixture(deployFixture);

      const id = BigNumber.from(0);
      const nonce = BigNumber.from(0);

      const permitSig: Signature = await signPermitMessage(
        erc20,
        deployer,
        paymentChannel.address,
        CHANNEL_MAX_AMOUNT,
        nonce,
        MAX_UINT256 // never expires
      );
      const {
        v: permitSigV,
        r: permitSigR,
        s: permitSigS,
      } = ethers.utils.splitSignature(permitSig);

      const signingKeyAddress = Wallet.createRandom().address;

      const { v, r, s } = await signSigningKeyMessage(
        erc20,
        paymentChannel,
        deployer,
        id,
        signingKeyAddress,
        serviceProvider.address,
        paymentChannel.address,
        CHANNEL_MAX_AMOUNT,
        nonce,
        MAX_UINT256,
        permitSigV,
        permitSigR,
        permitSigS
      );

      const signingKeyMessage = {
        id,
        token: erc20.address,
        signingKeyAddress,
        recipient: serviceProvider.address,
        permitMsg: {
          owner: deployer.address,
          spender: paymentChannel.address,
          value: CHANNEL_MAX_AMOUNT,
          nonce,
          deadline: MAX_UINT256,
          v: permitSigV,
          r: permitSigR,
          s: permitSigS,
        },
        v,
        r,
        s,
      };

      await expect(paymentChannel.validateSigningKeyMessage(signingKeyMessage))
        .to.not.be.reverted;
    });
  });
});
