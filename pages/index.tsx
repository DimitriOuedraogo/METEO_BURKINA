// pages/index.tsx
"use client";
import { Menu } from 'lucide-react';
import { signIn, signOut, useSession } from "next-auth/react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ForecastSection from '../components/ForecastSection/ForecastSection';
import Sidebar from '../components/SideBar/Sidebar';
import WeatherAdviceComponent from '../components/WeatherAdvice/WeatherAdvice';
import WeatherCard from '../components/WeatherCard/weatherCard';
import WeatherDetailsGrid from '../components/WeatherCard/weatherDetailsGrid';
import BURKINA_CITIES from '../lib/data/Burkina_cities';
import { getCurrentWeather, getForecast } from '../lib/services/weatherService';
import { AVAILABLE_PLANS, Plan } from '../types/plan';
import { ForecastData, WeatherData } from '../types/weather';

// Import dynamique du composant Map (désactive SSR)
const BurkinaMeteoMap = dynamic(() => import('../components/Map/Map'), {
  ssr: false,
});

type ViewMode = 'weather' | 'map';

export default function HomePage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [selectedCity, setSelectedCity] = useState('Ouagadougou');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<ViewMode>('weather');
  const [paid, setPaid] = useState(false);
  const router = useRouter();

  // Nouvel état pour le plan utilisateur
  const [plan, setPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (currentView === 'weather') {
      loadWeatherData(selectedCity);
    }
  }, [selectedCity, currentView]);

  // ⚡ Gestion du retour de paiement (plan choisi + paid=true)
  useEffect(() => {
    const queryPlan = router.query.plan as string;
    const paid = router.query.paid === 'true';

    if (queryPlan && paid) {
      const foundPlan = Object.values(AVAILABLE_PLANS).find(p => p.id === queryPlan);
      if (foundPlan) {
        setPlan(foundPlan);
        setPaid(true);
      }
      // Nettoyer l’URL pour éviter de réexécuter l’effet
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query]);

  const loadWeatherData = async (cityName: string) => {
    try {
      setLoading(true);
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(cityName),
        getForecast(cityName),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (error) {
      console.error('Erreur chargement météo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapView = () => {
    setCurrentView('map');
    setSidebarOpen(false);
  };

  const handleWeatherView = () => {
    setCurrentView('weather');
  };

  const filteredCities = BURKINA_CITIES.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (currentView === 'map') {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <BurkinaMeteoMap isPremium={paid} onBackToWeather={handleWeatherView} />
      </div>
    );

  }

  return (
    <div className="dashboard">
      <div className="block md:hidden">
        <Menu className='menu-mobile' onClick={() => setSidebarOpen(true)} />
        <Sidebar
          cities={filteredCities}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onMapView={handleMapView}
        />
      </div>
      <div className='hidden md:block'>
        <Sidebar
          cities={filteredCities}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sidebarOpen={true}
          setSidebarOpen={setSidebarOpen}
          onMapView={handleMapView}
        />
      </div>
      <div className="main-content">

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des données météo...</p>
          </div>
        ) : weather ? (
          <>
            <WeatherCard weather={weather} />
            <WeatherDetailsGrid weather={weather} />

            {/* Passer plan et setter au composant conseils */}
            <WeatherAdviceComponent
              weather={weather}
              plan={plan}
              setPlan={setPlan}
            />

            {forecast.length > 0 && <ForecastSection forecast={forecast} />}
          </>
        ) : (
          <div className="error-container">
            <p>Erreur lors du chargement des données météo</p>
            <button onClick={() => loadWeatherData(selectedCity)}>Réessayer</button>
          </div>
        )}
      </div>

      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}
