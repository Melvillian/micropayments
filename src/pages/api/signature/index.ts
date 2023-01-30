// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(404).json({ message: "error" });
    return;
  }
  // create signature
  res.status(200).json({ message: "signature created" });
}
