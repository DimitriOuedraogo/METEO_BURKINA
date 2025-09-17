import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const BASE_URL = process.env.OPEN_WEATHER_MAP_BASE_URL || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city } = req.query;

  if (!city || Array.isArray(city)) {
    return res.status(400).json({ error: "Le nom de la ville est requis" });
  }

  try {
    const response = await axios.get(`${BASE_URL}/forecast`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
        lang: "fr",
      },
    });

    // Grouper par jour (donnée 12h00)
    const forecasts = response.data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 5);

    const formatted = forecasts.map((item: any) => ({
      date: new Date(item.dt * 1000).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      temp_min: Math.round(item.main.temp_min),
      temp_max: Math.round(item.main.temp_max),
      description: item.weather[0].description,
      icon: item.weather[0].icon,
    }));

    res.status(200).json(formatted);
  } catch (err: any) {
    console.error("Erreur prévisions:", err.message || err);
    res.status(500).json({ error: "Impossible de récupérer les prévisions" });
  }
}
