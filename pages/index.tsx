// pages/index.tsx
"use client";

// Import des icônes et fonctions pour l'authentification
import { Menu } from 'lucide-react';

// Import dynamique pour le composant Map afin d'éviter le rendu côté serveur
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Import des composants de l'application
import ForecastSection from '../components/ForecastSection/ForecastSection';
import Sidebar from '../components/SideBar/Sidebar';
import WeatherAdviceComponent from '../components/WeatherAdvice/WeatherAdvice';
import WeatherCard from '../components/WeatherCard/weatherCard';
import WeatherDetailsGrid from '../components/WeatherCard/weatherDetailsGrid';

// Import des données et services
import BURKINA_CITIES from '../lib/data/Burkina_cities';
import { getCurrentWeather, getForecast } from '../lib/services/weatherService';
import { AVAILABLE_PLANS, Plan } from '../types/plan';
import { ForecastData, WeatherData } from '../types/weather';

// Import dynamique du composant map pour ne pas faire de SSR
const BurkinaMeteoMap = dynamic(() => import('../components/Map/Map'), {
  ssr: false,
});

// Type pour gérer l'affichage de la page
type ViewMode = 'weather' | 'map';

export default function HomePage() {
  // États principaux de l'application
  const [weather, setWeather] = useState<WeatherData | null>(null); // météo actuelle
  const [forecast, setForecast] = useState<ForecastData[]>([]); // prévisions météo
  const [selectedCity, setSelectedCity] = useState('Ouagadougou'); // ville sélectionnée
  const [loading, setLoading] = useState(true); // état de chargement
  const [sidebarOpen, setSidebarOpen] = useState(true); // affichage du menu latéral
  const [searchTerm, setSearchTerm] = useState(''); // recherche de ville
  const [currentView, setCurrentView] = useState<ViewMode>('weather'); // vue actuelle (météo ou map)
  const [paid, setPaid] = useState(false); // statut de paiement pour fonctionnalités premium
  const router = useRouter();

  // Nouvel état pour le plan utilisateur
  const [plan, setPlan] = useState<Plan | null>(null);

  // Chargement des données météo à chaque changement de ville ou de vue
  useEffect(() => {
    if (currentView === 'weather') {
      loadWeatherData(selectedCity);
    }
  }, [selectedCity, currentView]);

  // Gestion du retour de paiement (plan choisi + paid=true)
  useEffect(() => {
    const queryPlan = router.query.plan as string;
    const paid = router.query.paid === 'true';

    if (queryPlan && paid) {
      // Vérifie si le plan retourné existe dans la liste des plans disponibles
      const foundPlan = Object.values(AVAILABLE_PLANS).find(p => p.id === queryPlan);
      if (foundPlan) {
        setPlan(foundPlan);
        setPaid(true);
      }
      // Nettoyer l'URL pour éviter de relancer l'effet au rechargement
      router.replace('/', undefined, { shallow: true });
    }
  }, [router.query]);

  // Fonction pour charger la météo et les prévisions d'une ville
  const loadWeatherData = async (cityName: string) => {
    try {
      setLoading(true); // afficher spinner
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(cityName),
        getForecast(cityName),
      ]);
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (error) {
      console.error('Erreur chargement météo:', error);
    } finally {
      setLoading(false); // cacher spinner
    }
  };

  // Changer la vue vers la carte et fermer la sidebar
  const handleMapView = () => {
    setCurrentView('map');
    setSidebarOpen(false);
  };

  // Revenir à la vue météo
  const handleWeatherView = () => {
    setCurrentView('weather');
  };

  // Filtrer les villes selon le terme de recherche
  const filteredCities = BURKINA_CITIES.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Affichage conditionnel selon la vue actuelle
  if (currentView === 'map') {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <BurkinaMeteoMap isPremium={paid} onBackToWeather={handleWeatherView} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Menu mobile et sidebar responsive */}
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
        {/* Sidebar pour desktop */}
        <Sidebar
          cities={filteredCities}
          selectedCity={selectedCity}
          onCitySelect={setSelectedCity}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sidebarOpen={true} // toujours affiché sur desktop
          setSidebarOpen={setSidebarOpen}
          onMapView={handleMapView}
        />
      </div>

      <div className="main-content">
        {/* Affichage des composants météo ou messages de chargement / erreur */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des données météo...</p>
          </div>
        ) : weather ? (
          <>
            {/* Carte météo principale */}
            <WeatherCard weather={weather} />

            {/* Grille avec détails météo */}
            <WeatherDetailsGrid weather={weather} />

            {/* Conseils météo et gestion plan utilisateur */}
            <WeatherAdviceComponent
              weather={weather}
              plan={plan}
              setPlan={setPlan}
            />

            {/* Section prévisions si disponible */}
            {forecast.length > 0 && <ForecastSection forecast={forecast} />}
          </>
        ) : (
          <div className="error-container">
            <p>Erreur lors du chargement des données météo</p>
            <button onClick={() => loadWeatherData(selectedCity)}>Réessayer</button>
          </div>
        )}

        {/* Footer mobile - Affiché seulement sur mobile */}
        <div className="block md:hidden mt-8 py-4 text-center text-xs text-gray-500 border-t border-gray-200">
          Développé par{" "}
          <Link
            href="https://port-folio-gray-two.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            Dimitri OUEDRAOGO – Développeur Fullstack
          </Link>
        </div>
      </div>

      {/* Overlay pour fermer la sidebar sur mobile */}
      {sidebarOpen && (
        <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}