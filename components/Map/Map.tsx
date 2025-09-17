import 'leaflet/dist/leaflet.css';
import { ArrowLeft, Cloud, Droplets, Loader, MapPin, Wind } from 'lucide-react';
import { useCallback, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import { WeatherData } from '../../types/weather';

// Fix pour les icônes Leaflet
import L from 'leaflet';
import { getCurrentWeatherByCoords } from '../../lib/services/weatherService';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface BurkinaMeteoMapProps {
  onBackToWeather: () => void;
  isPremium: boolean;
}

interface Position {
  lat: number;
  lng: number;
}

// Composant pour gérer les clics sur la carte
import type { LeafletMouseEvent } from 'leaflet';

function MapClickHandler({ onLocationClick }: { onLocationClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationClick(lat, lng);
    },
  });
  return null;
}

// Composant pour afficher les infos météo
function WeatherInfo({ weather, position }: { weather: WeatherData; position: Position }) {
  return (
    <div className="w-full max-w-md">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{weather.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-blue-500" />
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
          alt={weather.description}
          className="w-20 h-20 drop-shadow-md"
        />
      </div>

      {/* Température */}
      <div className="text-center mb-6">
        <p className="text-6xl font-extrabold text-gray-900">
          {weather.temperature}°C
        </p>
        <p className="text-gray-600 text-lg">
          Ressenti : {weather.feels_like}°C
        </p>
        <p className="capitalize text-gray-700 mt-2 font-medium">
          {weather.description}
        </p>
      </div>

      {/* Infos complémentaires */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center">
          <Droplets className="w-6 h-6 text-blue-500 mb-1" />
          <p className="text-sm text-gray-500">Humidité</p>
          <p className="text-lg font-semibold">{weather.humidity}%</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col items-center">
          <Wind className="w-6 h-6 text-gray-500 mb-1" />
          <p className="text-sm text-gray-500">Vent</p>
          <p className="text-lg font-semibold">{weather.wind_speed} km/h</p>
        </div>
      </div>
    </div>

  );
}


export default function BurkinaMeteoMap({ onBackToWeather, isPremium }: BurkinaMeteoMapProps) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Centre sur le Burkina Faso
  const burkinaCenter: [number, number] = [12.3714, -1.5197];

  const api_: string = process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY || '';
  console.log('API Key from env:', api_);

  const handleLocationClick = useCallback(async (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const weather = await getCurrentWeatherByCoords(lat, lng);
      setWeatherData(weather);
    } catch (err) {
      setError('Impossible de récupérer les données météo pour cette position');
      console.error('Erreur météo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    // Conteneur principal avec position fixed pour occuper tout l'écran
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 z-50">
      <div className="w-full h-full flex flex-col">
        {/* Header avec bouton retour */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToWeather}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Cloud className="w-6 h-6" />
                  Burkina Météo - Carte Interactive
                </h1>
                <p className="text-blue-100 mt-1">
                  Cliquez sur la carte pour obtenir la météo de n'importe quelle localité
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>

        </div>
        {/* Container principal de la carte */}
        <div className="flex-1 flex">
          {/* Carte à gauche (70%) */}
          <div className="flex-[2] relative">
            <MapContainer
              center={burkinaCenter}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
            >

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {isPremium && (
                <>
                  {/* Precipitatrion */}
                  <TileLayer
                    url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY}`}
                    attribution="&copy; OpenWeatherMap Precipitation"
                    opacity={0.5}
                  />
                  {/* Nuages */}
                  <TileLayer
                    url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPEN_WEATHER_MAP_API_KEY}`}
                    attribution="&copy; OpenWeatherMap Clouds"
                    opacity={0.5}
                  />
                </>
              )}
              <MapClickHandler onLocationClick={handleLocationClick} />

              {selectedPosition && (
                <Marker position={[selectedPosition.lat, selectedPosition.lng]}>
                  <Popup>
                    <div className="text-center">
                      <MapPin className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                      <p className="font-semibold">Position sélectionnée</p>
                      <p className="text-xs text-gray-600">
                        {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* Panneau infos à droite (30%) */}
          <div className="flex-[1] bg-white border-l shadow-lg overflow-y-auto">
            <div className="p-6">
              <h2 className="text-3xl text-center text-bold"> Informations</h2>
              {!selectedPosition && (
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Sélectionnez une position</p>
                  <p className="text-sm mt-2">
                    Cliquez n'importe où sur la carte pour obtenir les données météo
                  </p>
                </div>
              )}

              {selectedPosition && isLoading && (
                <div className="text-center">
                  <Loader className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-600" />
                  <p className="text-lg font-medium text-gray-700">
                    Récupération des données météo...
                  </p>
                </div>
              )}

              {selectedPosition && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <Cloud className="w-5 h-5" />
                    <p className="font-medium">Erreur</p>
                  </div>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => handleLocationClick(selectedPosition.lat, selectedPosition.lng)}
                    className="mt-3 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {selectedPosition && weatherData && !isLoading && (
                <div className="flex justify-center mt-4">
                  <WeatherInfo weather={weatherData} position={selectedPosition} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}