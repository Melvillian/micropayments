import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { BigNumber, Signature } from "ethers";
import { PermitERC20 } from "../typechain/PermitERC20";
import { PaymentChannel } from "../typechain/PaymentChannel";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

type Address = string;

describe("PaymentChannel", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    const [deployer, alice, bob] = await ethers.getSigners();

    const PaymentChannel: PaymentChannel = await ethers.getContractFactory(
      "PaymentChannel"
    );
    const paymentChannel = await PaymentChannel.deploy();

    const PermitERC20: PermitERC20 = await ethers.getContractFactory(
      "PermitERC20"
    );
    const erc20 = await PermitERC20.deploy();

    return { paymentChannel, erc20, deployer, alice, bob };
  }

  describe("Channel Setup", async () => {
    const { paymentChannel, erc20, deployer } = await loadFixture(deployFixture);

    const now = await time.latest();
    const permitSig: Signature = await signPermitMessage(
      erc20,
      deployer,
      paymentChannel.address,
      ethers.utils.parseEther("0.001"),
      0,
      now + 1000
    );
  });

  // sign a permit
  const signPermitMessage = async (
    erc20: PermitERC20,
    signer: SignerWithAddress,
    spender: Address,
    value: BigNumber,
    nonce: number,
    deadline: number
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
  // const signSigningKeyMessage = async (
  //   erc20: PermitERC20,
  //   paymentChannel: PaymentChannel,
  //   signer: SignerWithAddress,
  //   id: BigNumber,
  //   signingKey: Address,
  //   recipient: Address,
  //   spender: Address,
  //   value: BigNumber,
  //   nonce: number,
  //   deadline: number,
  //   permitMsg: Signature,
    
  // ): Promise<Signature> => {
  //   const domain = {
  //     name: "PermitERC20",
  //     version: "1",
  //     chainId: network.config.chainId,
  //     verifyingContract: erc20.address,
  //   };
  //   const types = {
  //     Permit: [
  //       { name: "owner", type: "address" },
  //       { name: "spender", type: "address" },
  //       { name: "value", type: "uint256" },
  //       { name: "nonce", type: "uint256" },
  //       { name: "deadline", type: "uint256" },
  //     ],
  //   };
  //   const values = {
  //     owner: signer.address,
  //     spender: spender,
  //     value: value,
  //     nonce: nonce,
  //     deadline: deadline,
  //   };
  //   const signature = await signer._signTypedData(domain, types, values);
  //   return ethers.utils.splitSignature(signature);
  // };
});
