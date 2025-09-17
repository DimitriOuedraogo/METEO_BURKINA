import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = req.body;
    console.log('Base Url:',process.env.GEMINI_BASE_URL );
    console.log('API Key:',process.env.GEMINI_API_KEY );
    const response = await fetch(
      `${process.env.GEMINI_BASE_URL}/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Erreur Gemini:', text);
      return res.status(500).json({ error: text });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
