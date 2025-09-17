import { Calendar } from 'lucide-react';
import React from 'react';
import { ForecastData } from '../../types/weather';

interface ForecastSectionProps {
  forecast: ForecastData[];
}

const ForecastSection: React.FC<ForecastSectionProps> = ({ forecast }) => {
  if (forecast.length === 0) return null;

  return (
    <div className="forecast-section">
      <h2 className="section-title">
        <Calendar className="section-icon" />
        Prévisions 5 jours
      </h2>

      <div className="forecast-grid">
        {forecast.map((day, index) => (
          <div key={index} className="forecast-card">
            <div className="forecast-date">{day.date}</div>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="forecast-icon"
            />
            <div className="forecast-temps">
              <span className="temp-max">{day.temp_max}°</span>
              <span className="temp-min">{day.temp_min}°</span>
            </div>
            <div className="forecast-desc">{day.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastSection;
