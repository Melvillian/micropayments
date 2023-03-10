import { BigNumber } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../utils/prisma";

const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS;

const createPermitPayload = (from: string): any => {
  const erc20Contract = process.env.NEXT_PUBLIC_ERC20_ADDRESS;
  const paymentChannelContract = process.env.NEXT_PUBLIC_PAYMENT_CHANNEL_ADDRESS

  const domain = {
    name: "PermitERC20",
    version: "1",
    chainId: 11155111,
    verifyingContract: erc20Contract,
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
    owner: from,
    spender: paymentChannelContract,
    value: BigNumber.from(10).pow(16).toBigInt().toString(), // PermitERC20 0.01 TEST
    nonce: 0,
    deadline: BigNumber.from(2).pow(256).sub(1).toBigInt().toString(),
  };

  return {
    domain,
    types,
    values,
  };
};

async function storePaymentChannel(from: string, signingKeyAddress: string) {
  const permitPayload = createPermitPayload(from);
  const paymentChannel = await prisma.paymentChannel2.create({
    data: {
      owner: from,
      spender: permitPayload.values.spender,
      value: permitPayload.values.value,
      nonce: permitPayload.values.nonce,
      deadline: permitPayload.values.deadline,
      recipient: RECIPIENT_ADDRESS,
      token: permitPayload.domain.verifyingContract,
      paymentChannelContract: permitPayload.values.spender,
      signingKeyAddress: signingKeyAddress,
    },
  });
  return paymentChannel;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!req.body.from || !req.body.signingKeyAddress) {
      res.status(400).json({ error: "Require both from and contents" });
      return;
    }
    const from = req.body.from;

    const permitPayload = createPermitPayload(from);
    const paymentChannel = await storePaymentChannel(
      from,
      req.body.signingKeyAddress
    );
    permitPayload.paymentChannelId = paymentChannel.id;
    res.status(200).json(permitPayload);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
