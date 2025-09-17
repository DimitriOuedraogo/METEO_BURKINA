import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const BASE_URL = process.env.OPEN_WEATHER_MAP_BASE_URL || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { lat, lon } = req.query;

  if (!lat || !lon || Array.isArray(lat) || Array.isArray(lon)) {
    return res.status(400).json({ error: "Latitude et longitude sont requises" });
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: {
        lat: Number(lat),
        lon: Number(lon),
        appid: API_KEY,
        units: "metric",
        lang: "fr",
      },
    });

    const data = response.data;

    res.status(200).json({
      name: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      wind_speed: Math.round(data.wind.speed * 3.6),
      icon: data.weather[0].icon,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("Erreur géolocalisation météo:", err.message || err);
    res.status(500).json({ error: "Impossible de récupérer les données météo par géolocalisation" });
  }
}
