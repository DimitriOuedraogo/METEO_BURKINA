export interface Plan {
  id: string | number;
  type: "free" | "premium" | "enterprise" | string;
  title: string;
  price: string; // ex: "100 Fcfa"
  amount: number; // Montant numérique pour PayDunya
  currency?: "XOF" | string; // Par défaut: XOF
  period?: "month" | "year" | string;
  periodLabel?: string; // ex: "/ Month"
  description?: string;
  features?: string[];
  isPopular?: boolean;
  isEnterprise?: boolean;
  isActive?: boolean;
  color?: string;
  icon?: string;
}

export const AVAILABLE_PLANS: Record<string, Plan> = {
  free: {
    id: 'plan_free_001',
    type: 'free',
    title: 'Gratuit',
    price: '0 Fcfa',
    amount: 0,
    description: 'Plan gratuit avec conseils de base',
    features: [
      'Conseils Généraux',
      'Conseils Santé',
    ],
    color: '#10B981',
    icon: '🆓'
  },

  premium: {
    id: 'plan_premium_001',
    type: 'premium',
    title: 'Payant',
    price: '250 Fcfa',
    amount: 250,
    description: 'Plan premium avec conseils avancés',
    features: [
      'Conseils Généraux',
      'Conseils Santé',
      'Conseils Activités',
      'Conseils Agriculture',
    
    ],
    isPopular: true,
    color: '#3B82F6',
    icon: '⭐'
  },

  enterprise: {
    id: 'plan_enterprise_001',
    type: 'enterprise',
    title: 'Pour Entreprise',
    price: '450 Fcfa',
    amount: 450,
    description: 'Plan entreprise avec tous les conseils',
    features: [
      'Conseils Généraux',
      'Conseils Santé',
      'Conseils Activités',
      'Conseils Agriculture',
      'Conseils Entreprise',
    ],
    isEnterprise: true,
    color: '#7C3AED',
    icon: '🏢'
  }
};