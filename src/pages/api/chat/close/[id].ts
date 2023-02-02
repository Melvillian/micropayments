import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../utils/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id } = req.query;

    const paymentChannel = await prisma.paymentChannel.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!paymentChannel) {
      res.status(404).json({ error: "Payment channel not found" });
      return;
    }

    if (paymentChannel.closed) {
      res.status(400).json({ error: "Payment channel already closed" });
      return;
    }

    const updatedPaymentChannel = await prisma.paymentChannel.update({
      where: {
        id: Number(id),
      },
      data: {
        closed: true,
      },
    });

    res.status(200).json(updatedPaymentChannel);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
