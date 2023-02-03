import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Signature, Wallet } from "ethers";

import {
  PermitERC20,
  TestPaymentChannel,
} from "../typechain-types";
import {
  signPermitMessage,
  signSigningKeyMessage,
  generateMicropaymentMessage,
} from "./utils";

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
    const PaymentChannel =
      await ethers.getContractFactory("TestPaymentChannel");
    const paymentChannel: TestPaymentChannel = await PaymentChannel.deploy() as TestPaymentChannel;
    // use this as our example USDC token that supports EIP-2612
    const PermitERC20 = await ethers.getContractFactory("PermitERC20");
    const erc20: PermitERC20 = await PermitERC20.deploy() as PermitERC20;

    return { paymentChannel, erc20, deployer, serviceProvider, bob };
  }

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

    await expect(paymentChannel.validateSigningKeyMessage(signingKeyMessage)).to
      .not.be.reverted;
  });

  it("validateMicropaymentMessage works", async () => {
    const { paymentChannel } = await loadFixture(deployFixture);

    const id = BigNumber.from(0);
    let amount = BigNumber.from(1);
    const signingKey = Wallet.createRandom();

    let micropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      amount
    );

    // sign the first one, with amount == 1
    await expect(
      paymentChannel.validateMicropaymentMessage(
        signingKey.address,
        micropaymentMessage
      )
    ).to.not.be.reverted;

    // now generate and sign the second one, with amount == 2
    amount = BigNumber.from(2);
    micropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      amount
    );

    await expect(
      paymentChannel.validateMicropaymentMessage(
        signingKey.address,
        micropaymentMessage
      )
    ).to.not.be.reverted;
  });

  it("E2E test: settling a micropayment channel works", async () => {
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

    const signingKey = Wallet.createRandom();
    const signingKeyAddress = signingKey.address;

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

    // now simulate multiple micropayment channel signings, which will steadily increase
    // the amount of the channel

    // simulate generating the 1st micropayment message
    let amount = BigNumber.from(1);
    let micropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      amount
    );

    // simulate generating the 1st micropayment message
    amount = BigNumber.from(1);
    micropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      amount
    );

    // simulator fast forwarding, as if we had paid for 1000's of
    // prompts
    // simulate generating the 1st micropayment message
    amount = BigNumber.from(10_000);
    micropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      amount
    );

    // at this point, the user is done using the service, and so it
    // comes time for the service provider to settle the channel onchain
    // using the signatures provided by the user

    // check balances before settling
    expect(await erc20.balanceOf(deployer.address)).to.equal(
      BigNumber.from(1_000).mul(BigNumber.from(10).pow(18))
    );
    expect(await erc20.balanceOf(paymentChannel.address)).to.equal(
      BigNumber.from(0)
    );
    expect(await erc20.balanceOf(serviceProvider.address)).to.equal(
      BigNumber.from(0)
    );

    // settle the channel
    await expect(
      paymentChannel.settleChannel(signingKeyMessage, micropaymentMessage)
    )
      .to.emit(paymentChannel, "ChannelSettled")
      .withArgs(
        id,
        erc20.address,
        signingKeyAddress,
        serviceProvider.address,
        amount
      );

    // check balances after settling
    expect(await erc20.balanceOf(deployer.address)).to.equal(
      BigNumber.from(1_000).mul(BigNumber.from(10).pow(18)).sub(amount)
    );
    expect(await erc20.balanceOf(paymentChannel.address)).to.equal(
      BigNumber.from(0)
    );
    expect(await erc20.balanceOf(serviceProvider.address)).to.equal(amount);

    // now test that the same channel cannot be settled again
    await expect(
      paymentChannel.settleChannel(signingKeyMessage, micropaymentMessage)
    ).to.be.revertedWithCustomError(paymentChannel, "IdAlreadyUsed");
  });

  it("settling a micropayment channel with greater than the max channel amount will not fail", async () => {
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

    const signingKey = Wallet.createRandom();
    const signingKeyAddress = signingKey.address;

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

    // attempt to settle the channel with a micropayment message amount
    // that is too high, and it should max out at the channel max amount
    const failingAmount = CHANNEL_MAX_AMOUNT.add(1);
    const failingMicropaymentMessage = await generateMicropaymentMessage(
      paymentChannel,
      signingKey,
      id,
      failingAmount
    );
    await expect(
      paymentChannel.settleChannel(
        signingKeyMessage,
        failingMicropaymentMessage
      )
    ).to.not.be.reverted;

    // check balances after settling
    expect(await erc20.balanceOf(deployer.address)).to.equal(
      BigNumber.from(1_000)
        .mul(BigNumber.from(10).pow(18))
        .sub(CHANNEL_MAX_AMOUNT)
    );
    expect(await erc20.balanceOf(paymentChannel.address)).to.equal(
      BigNumber.from(0)
    );
    expect(await erc20.balanceOf(serviceProvider.address)).to.equal(
      CHANNEL_MAX_AMOUNT
    );
  });
});
