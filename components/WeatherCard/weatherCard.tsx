import React from 'react';
import { MapPin } from 'lucide-react';
import { WeatherData } from '../../types/weather';

interface WeatherCardProps {
  weather: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather }) => {
  return (
    <div className="current-weather">
      <div className="weather-main">
        {/* Localisation */}
        <div className="location">
          <MapPin className="location-icon" />
          <div>
            <h1>{weather.name}</h1>
            <p className="country">{weather.country}</p>
          </div>
        </div>

        {/* Température et icône */}
        <div className="temperature-section">
          <div className="temp-main">
            <span className="temperature">{weather.temperature}</span>
            <span className="unit">°C</span>
          </div>
          <div className="weather-icon">
            <img
              src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
              alt={weather.description}
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="weather-description">
        <p className="description">{weather.description}</p>
        <p className="feels-like">Ressenti {weather.feels_like}°C</p>
      </div>
    </div>
  );
};

export default WeatherCard;
