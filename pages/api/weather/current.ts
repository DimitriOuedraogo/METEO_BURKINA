import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// Clé API et URL de base OpenWeatherMap
const API_KEY = process.env.OPEN_WEATHER_MAP_API_KEY;
const BASE_URL = process.env.OPEN_WEATHER_MAP_BASE_URL || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city } = req.query;

  // Vérifier que le nom de la ville est fourni et qu'il est de type string
  if (!city || typeof city !== "string") {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    // Requête vers l'API OpenWeatherMap pour récupérer la météo actuelle
    const response = await axios.get(`${BASE_URL}/weather`, {
      params: { 
        q: city,           // nom de la ville
        appid: API_KEY,    // clé API
        units: "metric",   // unité Celsius
        lang: "fr"         // description en français
      }
    });

    const data = response.data;

    // Retourner les informations météo formatées
    res.status(200).json({
      name: data.name,                        // nom de la ville
      country: data.sys.country,              // code pays
      temperature: Math.round(data.main.temp), // température actuelle
      feels_like: Math.round(data.main.feels_like), // ressenti
      description: data.weather[0].description, // description météo
      humidity: data.main.humidity,           // humidité
      wind_speed: Math.round(data.wind.speed * 3.6), // vitesse du vent en km/h
      icon: data.weather[0].icon,            // icône météo
      timestamp: Date.now()                   // timestamp actuel
    });

  } catch (err: any) {
    // Gestion des erreurs
    console.error("Erreur récupération météo :", err);
    res.status(500).json({ error: "Impossible de récupérer la météo" });
  }
}
