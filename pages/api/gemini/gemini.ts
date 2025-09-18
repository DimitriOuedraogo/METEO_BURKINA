import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Récupérer le corps de la requête envoyé depuis le front
    const body = req.body;

    // Logs pour debug 
    console.log('Base Url:', process.env.GEMINI_BASE_URL);
    console.log('API Key:', process.env.GEMINI_API_KEY);

    // Requête POST vers l'API Gemini pour générer du contenu
    const response = await fetch(
      `${process.env.GEMINI_BASE_URL}/models/${process.env.GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    // Vérifier si la réponse est OK
    if (!response.ok) {
      const text = await response.text();
      console.error('Erreur Gemini:', text);
      return res.status(500).json({ error: text });
    }

    // Récupérer les données JSON renvoyées par Gemini et les retourner au front
    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    // Gestion des erreurs serveur
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
