import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/prisma";

const createSignature = (from: string, contents: string): object => {
  return {
    name: "Send Prompt to OpenAI",
    chain: "0x5",
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Prompt: [
        { name: "from", type: "address" },
        { name: "contents", type: "string" },
      ],
    },
    domain: {
      name: "Send Prompt to OpenAI",
      version: "1",
      chainId: 5,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    primaryType: "Prompt",
    value: {
      from,
      contents,
    },
  };
};

async function storePaymentChannel(
  from: string,
  contents: string,
  signature: object
) {
  const paymentChannel = await prisma.paymentChannel.create({
    data: {
      from: from,
      contents: contents,
      signature: signature,
      data: "",
    },
  });
  return paymentChannel;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (!req.body.from || !req.body.contents) {
      res.status(400).json({ error: "Require both from and contents" });
      return;
    }
    const from = req.body.from;
    const contents = req.body.contents;
    const signature = createSignature(from, contents);
    console.log(signature);
    const paymentChannel = await storePaymentChannel(from, contents, signature);

    res.status(200).json(paymentChannel);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
