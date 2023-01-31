// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/prisma";

const createSignature = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const signature = await prisma.signature.create({
    data: {
      walletAddress: body.from,
      signature: {
        name: body.name,
        types: body.types,
        chain: body.chain,
        domain: body.domain,
        values: body.value,
        primaryType: body.primaryType,
        data: body.data,
      },
    },
  });

  res.status(200).json({ message: "signature created", signature: signature });
};

const fetchSignatures = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ signatures: await prisma.signature.findMany() });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    createSignature(req, res);
  } else if (req.method === "GET") {
    await fetchSignatures(req, res);
  } else {
    res.status(404).json({ message: "error" });
  }
  // create signature
}
