// components/WeatherAdvice/WeatherAdvice.tsx
import { signIn, useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import geminiAdvisor from '../../lib/services/geminiWeatherAdvisor';
import { AVAILABLE_PLANS, Plan } from '../../types/plan';
import { WeatherData } from '../../types/weather';
import { WeatherAdvice } from '../../types/weatherAdvice';
import LoginModal from "../Modal/LoginModal";
import ModernPlanCard from './ModernPlanCard';


interface WeatherAdviceProps {
    weather: WeatherData;
    plan: Plan | null;
    setPlan: Dispatch<SetStateAction<Plan | null>>;
}

const WeatherAdviceComponent = ({ weather, plan, setPlan }: WeatherAdviceProps) => {
    const [advice, setAdvice] = useState<WeatherAdvice | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { data: session } = useSession();


    useEffect(() => {
        if (plan) {
            fetchAdvice(plan);
        }
    }, [plan]);


    const fetchAdvice = async (selectedPlan: Plan) => {
        try {
            setLoading(true);
            setError(null);
            const result = await geminiAdvisor.getAdvice(weather, selectedPlan);
            // Vérifier si Gemini est surchargé
            if (result.general[0]?.includes("⚠️ Service Gemini")) {
                alert("🚨 Le modèle Gemini est surchargé. Réessaie dans quelques minutes.");
                setError("⚠️ Service IA temporairement indisponible.");
                return;

            }
            setAdvice(result);
        } catch (err) {
            console.error('Erreur conseils météo:', err);
            setError('Erreur lors du chargement des conseils');
        } finally {
            setLoading(false);
        }
    };
    const handleSelectPlan = async (selectedPlan: Plan) => {
        if (!session) {
            setShowLoginModal(true);
            return;
        }
        setPlan(selectedPlan);

        if (selectedPlan.type !== 'free') {
            try {
                // Crée la facture côté serveur
                const res = await fetch('/api/payment/create-invoice', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: selectedPlan })
                });

                // Vérifie que la réponse est JSON
                const contentType = res.headers.get('content-type');
                if (!res.ok || !contentType?.includes('application/json')) {
                    const text = await res.text(); // récupère le HTML ou message d’erreur
                    throw new Error(`Erreur serveur: ${text}`);
                }

                const data = await res.json();
                console.log("Réponse backend:", data);

                if (data.checkoutUrl) {
                    // Redirection vers PayDunya
                    window.location.href = data.checkoutUrl;
                } else {
                    console.error('Pas d’URL de paiement reçue:', data);
                    setError('Impossible de récupérer le lien de paiement.');
                }

            } catch (err) {
                console.error('Erreur création facture PayDunya:', err);
                setError('Impossible de créer la facture de paiement');
            }
            return;
        }

        // Plan gratuit → on continue normalement
        fetchAdvice(selectedPlan);
    };



    const AdviceSection = ({
        title,
        items,
        icon
    }: {
        title: string;
        items: string[];
        icon: string;
    }) => {
        if (!items || items.length === 0) return null;
        return (
            <div className="advice-section mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    <span className="mr-2">{icon}</span>{title}
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                    {items.map((item, idx) => (
                        <li key={idx}>{item}</li>
                    ))}
                </ul>
            </div>
        );
    };


    // Affichage des cartes si aucun plan choisi
    if (!plan) {
        return (
            <div className="weather-advice p-8">
                <div className="advice-header mb-8 text-center">
                    <h2 className="text-3xl font-bold mb-3 text-gray-800">🧠 Choisissez votre plan</h2>
                    <p className=" text-black text-lg">
                        Sélectionnez le plan pour recevoir vos conseils météo personnalisés
                    </p>
                </div>

                <div className="h-auto grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(AVAILABLE_PLANS).map((planItem) => (
                        <ModernPlanCard
                            key={planItem.id}
                            plan={planItem}
                            onClick={() => handleSelectPlan(planItem)}
                        />
                    ))}
                </div>
                {showLoginModal && (
                    <LoginModal
                        onClose={() => setShowLoginModal(false)}
                        onLogin={() => {
                            setShowLoginModal(false);
                            signIn();
                        }}
                        message="Connectez-vous pour obtenir ce plan"
                    />
                )}
            </div>
        );
    }

    // Chargement
    if (loading) {
        return (
            <div className="weather-advice">
                <div className="advice-header">
                    <h2>🧠 Conseils Météo</h2>
                </div>
                <div className="advice-loading">
                    <div className="loading-spinner-small"></div>
                    <p>Génération des conseils en cours...</p>
                </div>
            </div>
        );
    }

    // Erreur
    if (error || !advice) {
        return (
            <div className="weather-advice">
                <div className="advice-header">
                    <h2>🧠 Conseils Météo</h2>
                </div>
                <div className="advice-error">
                    <p>⚠️ {error || 'Impossible de charger les conseils'}</p>
                </div>
            </div>
        );
    }

    // Affichage des conseils selon le plan choisi
    return (
        <div className="weather-advice">
            <div className="advice-header mb-6">
                <h2 className="text-2xl font-bold mb-2">
                    🧠 Conseils Météo - {plan.type === 'free' ? 'Plan Free' : 'Plan Premium'}
                </h2>
                <p className="text-gray-700">Conseils personnalisés pour {weather.name}</p>
            </div>

            <div className="advice-content">
                <AdviceSection title="Général" items={advice.general} icon="🌍" />
                <AdviceSection title="Santé & Confort" items={advice.health} icon="🏥" />

                {plan.type === 'premium' && advice.activities.length > 0 && (
                    <AdviceSection title="Activités" items={advice.activities} icon="🎯" />
                )}

                {plan.type === 'premium' && advice.agriculture && advice.agriculture.length > 0 && (
                    <AdviceSection title="Agriculture" items={advice.agriculture} icon="🌾" />
                )}
            </div>

            <div className="advice-footer mt-6 text-WHITE-500 text-sm">
                💡 Conseils générés par IA • Burkina Faso
            </div>
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onLogin={() => {
                        setShowLoginModal(false);
                        signIn();
                    }}
                    message="Connectez-vous pour obtenir ce plan"
                />
            )}
        </div>
    );
};

export default WeatherAdviceComponent;