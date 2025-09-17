
// Types pour les données météo
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

// Types pour les conseils intelligents
export interface WeatherAdvice {
  category: 'agriculture' | 'transport' | 'sante' | 'generale';
  message: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
}

// Types pour les villes du Burkina Faso
export interface BurkinaCity {
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
}

// Types pour les paramètres utilisateur
export interface UserPreferences {
  favoriteCity: string | null;
  notifications: boolean;
  language: 'fr' | 'en';
  units: 'celsius' | 'fahrenheit';
}

// Types pour les états de chargement
export interface LoadingState {
  weather: boolean;
  forecast: boolean;
  geolocation: boolean;
}

// Types pour la gestion d'erreur
export interface WeatherError {
  type: 'network' | 'api' | 'geolocation' | 'unknown';
  message: string;
  timestamp: number;
}