import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Signature, Wallet } from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  TestPaymentChannel,
  TestPaymentChannel__factory,
  PermitERC20,
  PermitERC20__factory,
} from "../typechain-types";

// for readability
type Address = string;

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
    const PermitERC20: PermitERC20__factory = await ethers.getContractFactory(
      "PermitERC20"
    );
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

  // sign a permit
  const signPermitMessage = async (
    erc20: PermitERC20,
    signer: SignerWithAddress,
    spender: Address,
    value: BigNumber,
    nonce: BigNumber,
    deadline: BigNumber
  ): Promise<Signature> => {
    const domain = {
      name: "PermitERC20",
      version: "1",
      chainId: network.config.chainId,
      verifyingContract: erc20.address,
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };
    const values = {
      owner: signer.address,
      spender: spender,
      value: value,
      nonce: nonce,
      deadline: deadline,
    };
    const signature = await signer._signTypedData(domain, types, values);
    return ethers.utils.splitSignature(signature);
  };

  // Sign a skMsg
  const signSigningKeyMessage = async (
    erc20: PermitERC20,
    paymentChannel: TestPaymentChannel,
    signer: SignerWithAddress,
    id: BigNumber,
    signingKeyAddress: Address,
    recipient: Address,
    spender: Address,
    value: BigNumber,
    nonce: BigNumber,
    deadline: BigNumber,
    permitSigV: number,
    permitSigR: string,
    permitSigS: string
  ): Promise<Signature> => {
    const domain = {
      name: "PaymentChannel",
      version: "1",
      chainId: network.config.chainId,
      verifyingContract: paymentChannel.address,
    };
    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
      SigningKeyMessage: [
        { name: "id", type: "uint256" },
        { name: "token", type: "address" },
        { name: "signingKeyAddress", type: "address" },
        { name: "recipient", type: "address" },
        { name: "permitMsg", type: "Permit" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
      ],
    };
    const values = {
      id,
      token: erc20.address,
      signingKeyAddress,
      recipient,
      permitMsg: {
        owner: signer.address,
        spender: spender,
        value: value,
        nonce: nonce,
        deadline: deadline,
      },
      v: permitSigV,
      r: permitSigR,
      s: permitSigS,
    };
    const signature = await signer._signTypedData(domain, types, values);
    return ethers.utils.splitSignature(signature);
  };
});
