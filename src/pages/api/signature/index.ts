// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/prisma";

const createSignature = async (req: NextApiRequest, res: NextApiResponse) => {
  const signature = await prisma.signature.create({
    data: {
      walletAddress: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      signature: {
        types: [],
        domains: [],
        values: [],
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
