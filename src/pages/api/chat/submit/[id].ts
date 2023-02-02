import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "utils/prisma";

const getGPTCompletion = async (prompt: string) => {
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });
  return await response.json();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id } = req.query;
    const data = req.body.data;

    if (!data) {
      res.status(400).json({ error: "Missing data" });
      return;
    }

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

    if (paymentChannel.data) {
      res.status(400).json({ error: "Payment channel already submitted" });
      return;
    }

    // TODO: logic here to verify data

    const updatedPaymentChannel = await prisma.paymentChannel.update({
      where: {
        id: Number(id),
      },
      data: {
        data: data,
      },
    });

    console.log("paymentChannel.contents");
    console.log(paymentChannel.contents);
    const result = await getGPTCompletion(paymentChannel.contents);
    console.log("result");
    console.log(result);
    res.status(200).json({
      result,
      paymentChannel: updatedPaymentChannel,
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
