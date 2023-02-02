import { PaymentChannel2 } from "@prisma/client";
import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/prisma";

const createSigningMessagePayload = (paymentChannel: PaymentChannel2): any => {
  // TODO: Replace with real contract address
  const erc20Contract = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";

  // TODO: Replace with real contract address
  const paymentChannelContract = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";

  const domain = {
    name: "PaymentChannel",
    version: "1",
    chainId: 11155111,
    verifyingContract: paymentChannelContract,
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
    id: paymentChannel.id,
    token: erc20Contract,
    signingKeyAddress: paymentChannel.signingKeyAddress,
    recipient: paymentChannel.recipient,
    permitMsg: {
      owner: paymentChannel.owner,
      spender: paymentChannel.spender,
      value: paymentChannel.value.toString(),
      nonce: paymentChannel.nonce.toString(),
      deadline: paymentChannel.deadline,
    },
    v: paymentChannel.permitV,
    r: paymentChannel.permitR,
    s: paymentChannel.permitS,
  };

  return {
    domain,
    types,
    values,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (req.method === "POST") {
    if (!id || !req.body.v || !req.body.r || !req.body.s) {
      res.status(400).json({ error: "Require id, v, r, s" });
      return;
    }

    const paymentChannel = await prisma.paymentChannel2.findUnique({
      where: {
        id: parseInt(id as string),
      },
    });

    if (!paymentChannel) {
      res.status(400).json({ error: "Payment channel not found" });
      return;
    }

    let updatedPaymentChannel = await prisma.paymentChannel2.update({
      where: {
        id: parseInt(id as string),
      },
      data: {
        permitV: req.body.v,
        permitR: req.body.r,
        permitS: req.body.s,
      },
    });

    const payload = createSigningMessagePayload(updatedPaymentChannel);

    res.status(200).json(payload);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
