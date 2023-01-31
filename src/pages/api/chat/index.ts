import { NextApiRequest, NextApiResponse } from "next";

const getGPTCompletion = async (req: NextApiRequest, res: NextApiResponse) => {
  const message = req.body.message;
  console.log(process.env);
  const response = await fetch("https://api.openai.com/v1/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-davinci-003",
      prompt: message,
      temperature: 0,
      max_tokens: 7,
    }),
  });
  res.status(200).json(await response.json());
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await getGPTCompletion(req, res);
  }
}
