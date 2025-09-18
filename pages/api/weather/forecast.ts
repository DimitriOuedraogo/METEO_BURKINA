import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Clé API et URL de base OpenWeatherMap
const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const BASE_URL = process.env.OPEN_WEATHER_MAP_BASE_URL || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city } = req.query;

  // Vérifier que le nom de la ville est fourni et n'est pas un tableau
  if (!city || Array.isArray(city)) {
    return res.status(400).json({ error: "Le nom de la ville est requis" });
  }

  try {
    // Requête vers l'API OpenWeatherMap pour récupérer les prévisions
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,          // nom de la ville
        appid: API_KEY,   // clé API
        units: "metric",  // unité Celsius
        lang: "fr",       // description en français
      },
    });

    // Filtrer les prévisions toutes les 8 données (toutes les 24h sur 3h intervalle → 8*3=24h)
    const forecasts = response.data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5);

    // Formater les prévisions pour le front-end
    const formatted = forecasts.map((item: any) => ({
      date: new Date(item.dt * 1000).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      temp_min: Math.round(item.main.temp_min),  // température minimale
      temp_max: Math.round(item.main.temp_max),  // température maximale
      description: item.weather[0].description,  // description météo
      icon: item.weather[0].icon,               // icône météo
    }));

    // Retourner les prévisions formatées
    res.status(200).json(formatted);
  } catch (err: any) {
    // Gestion des erreurs
    console.error("Erreur prévisions:", err.message || err);
    res.status(500).json({ error: "Impossible de récupérer les prévisions" });
  }
}
