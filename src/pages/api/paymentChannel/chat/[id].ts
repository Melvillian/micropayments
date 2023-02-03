import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../../utils/prisma";

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
  if (!response.ok) return "Error";
  const result = await response.json();
  console.log("Chat GPT result:");
  console.log(result);
  return result.choices[0].text;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { id } = req.query;
    const prompt = req.body.prompt;
    const signedMicropaymentMessage = req.body.signedMicropaymentMessage;

    if (!prompt) {
      res.status(400).json({ error: "Missing data" });
      return;
    }

    const paymentChannel = await prisma.paymentChannel2.findUnique({
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

    // TODO: make this into it's own endpoint so
    // we have a clean separation between gpt response requests
    // and micropayment message update requests
    await prisma.paymentChannel2.update({
      where: {
        id: Number(id),
      },
      data: {
        microPaymentMessageV: signedMicropaymentMessage.v,
        microPaymentMessageR: signedMicropaymentMessage.r,
        microPaymentMessageS: signedMicropaymentMessage.s,
        amount: paymentChannel.amount + 1,
      }
    })

    const gptPayload = await getGPTCompletion(prompt);
    const unsignedPaymentMessage = {
      id: paymentChannel.id,
      amount: paymentChannel.amount + 1,
    }


    const result = {
      gptPayload,
      unsignedPaymentMessage
    }

    res.status(200).json({
      result,
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
