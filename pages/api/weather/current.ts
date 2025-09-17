import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const BASE_URL = process.env.OPEN_WEATHER_MAP_BASE_URL || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city } = req.query;

  if (!city || typeof city !== "string") {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city, appid: API_KEY, units: "metric", lang: "fr" }
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
      timestamp: Date.now()
    });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Impossible de récupérer la météo" });
  }
}
