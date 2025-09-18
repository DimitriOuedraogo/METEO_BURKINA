

export interface WeatherData {
  name: string;
  country: string;
  temperature: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
  timestamp: number;
}

export interface ForecastData {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
}

// Obtenir météo actuelle d'une ville
export const getCurrentWeather = async (cityName: string): Promise<WeatherData> => {
  const res = await fetch(`/api/weather/current?city=${encodeURIComponent(cityName)}`);
  if (!res.ok) throw new Error("Erreur récupération météo");
  return res.json();
};


// Obtenir météo par coordonnées GPS
export const getCurrentWeatherByCoords = async (lat: number, lon: number): Promise<WeatherData> => {
  const res = await fetch(`/api/weather/by-coords?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Erreur récupération météo par coordonnées");
  return res.json();
};

// Prévisions 5 jours (sera ajouté plus tard)
export const getForecast = async (cityName: string): Promise<ForecastData[]> => {
  const res = await fetch(`/api/weather/forecast?city=${cityName}`);
  if (!res.ok) throw new Error("Erreur récupération prévisions météo");
  return res.json();
};

// Helper fonction pour obtenir URL icône météo
export const getWeatherIconUrl = (iconCode: string): string => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};
