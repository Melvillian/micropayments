import { ethers, network } from "hardhat";
import { BigNumber, Signature } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestPaymentChannel, PermitERC20 } from "../typechain-types";

type Address = string;

// sign a permit
export async function signPermitMessage(
  erc20: PermitERC20,
  signer: SignerWithAddress,
  spender: Address,
  value: BigNumber,
  nonce: BigNumber,
  deadline: BigNumber
): Promise<Signature> {
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
}

// Sign a skMsg
export async function signSigningKeyMessage(
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
): Promise<Signature> {
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
}
