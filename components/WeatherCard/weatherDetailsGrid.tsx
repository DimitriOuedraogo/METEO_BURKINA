import React from 'react';
import { Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { WeatherData } from '../../types/weather';

interface WeatherDetailsGridProps {
  weather: WeatherData;
}

const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({ weather }) => {
  return (
    <div className="weather-details-grid">
      {/* Température */}
      <div className="detail-card">
        <div className="detail-header">
          <Thermometer className="detail-icon" />
          <span>Température</span>
        </div>
        <div className="detail-value">{weather.temperature}°C</div>
        <div className="detail-subtitle">Ressenti {weather.feels_like}°C</div>
      </div>

      {/* Humidité */}
      <div className="detail-card">
        <div className="detail-header">
          <Droplets className="detail-icon" />
          <span>Humidité</span>
        </div>
        <div className="detail-value">{weather.humidity}%</div>
        <div className="detail-subtitle">Taux d'humidité</div>
      </div>

      {/* Vent */}
      <div className="detail-card">
        <div className="detail-header">
          <Wind className="detail-icon" />
          <span>Vent</span>
        </div>
        <div className="detail-value">{weather.wind_speed} km/h</div>
        <div className="detail-subtitle">Vitesse du vent</div>
      </div>

      {/* Visibilité */}
      <div className="detail-card">
        <div className="detail-header">
          <Eye className="detail-icon" />
          <span>Visibilité</span>
        </div>
        <div className="detail-value">Excellente</div>
        <div className="detail-subtitle">Conditions claires</div>
      </div>
    </div>
  );
};

export default WeatherDetailsGrid;
