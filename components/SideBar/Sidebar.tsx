import { ChevronDown, ChevronRight, Map, MapPin, Search, Sun, X } from 'lucide-react';
import React, { useState } from 'react';
import styles from '../../styles/sidebar.module.css';
import { signIn, signOut, useSession } from "next-auth/react";


interface SidebarProps {
  cities: string[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
  onMapView: () => void;
  searchTerm: string;
  sidebarOpen: boolean;
  setSidebarOpen: (term: boolean) => void;
  setSearchTerm: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  cities,
  selectedCity,
  onCitySelect,
  onMapView,
  searchTerm,
  sidebarOpen,
  setSidebarOpen,
  setSearchTerm,
}) => {
  const [citiesExpanded, setCitiesExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session, status } = useSession();

  const filteredCities = cities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        {/* Close button mobile */}
        <div className="md:hidden flex justify-end mb-4">
          <button
            className="p-2"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Header / Logo */}
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Sun className={styles.logoIcon} />
            <h2>Météo Burkina</h2>
          </div>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchInput}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Rechercher une ville..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <div className={styles.navigationMenu}>
          {/* Villes */}
          <div className={styles.menuSection}>
            <div
              className={styles.menuItem}
              onClick={() => setCitiesExpanded(!citiesExpanded)}
            >
              {citiesExpanded ? (
                <ChevronDown className={styles.expandIcon} />
              ) : (
                <ChevronRight className={styles.expandIcon} />
              )}
              <MapPin className={styles.menuIcon} />
              <span>Voir les villes</span>
            </div>

            {citiesExpanded && (
              <div className={styles.submenu}>
                {filteredCities.map(city => (
                  <div
                    key={city}
                    className={`${styles.submenuItem} ${selectedCity === city ? styles.active : ''}`}
                    onClick={() => {
                      onCitySelect(city);
                      setSidebarOpen(false);
                    }}
                  >
                    <MapPin className={styles.cityIcon} />
                    <span>{city}</span>
                  </div>
                ))}
                {filteredCities.length === 0 && searchTerm && (
                  <div className={styles.noResults}>
                    Aucune ville trouvée
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Carte */}
          <div className={styles.menuSection}>
            <div
              className={styles.menuItem}
              onClick={() => {
                onMapView();
                setSidebarOpen(false);
              }}
            >
              <Map className={styles.menuIcon} />
              <span>Aller sur la carte</span>
            </div>
          </div>

          {/* --- Avatar utilisateur ou bouton connexion --- */}
          {session ? (
            <div className={styles.userMenu}>
              <div className={styles.avatar} onClick={() => setDropdownOpen(!dropdownOpen)}>
                {session.user?.name?.charAt(0).toUpperCase()}
              </div>
              {dropdownOpen && (
                <div className={styles.dropdown}>
                  <p className={styles.email}>{session.user?.email}</p>
                  <button className={styles.logoutBtn} onClick={() => signOut()}>
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.loginContainer}>
              <button className={styles.loginBtn} onClick={() => signIn()}>
                Connexion
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Sidebar;
