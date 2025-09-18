import axios from 'axios';
import { Plan } from '../../types/plan';
import { PAYDUNYA_CONFIG } from '../config/paydunya';

class PayDunyaService {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    // Initialiser l'URL de base et les headers pour PayDunya
    this.baseURL = PAYDUNYA_CONFIG.BASE_URL ?? '';
    console.log('PAYDUNYA_CONFIG.BASE_URL:', PAYDUNYA_CONFIG.BASE_URL);
    console.log('this.baseURL:', this.baseURL);

    // Définir les headers nécessaires pour l'API PayDunya
    this.headers = {
      'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.MASTER_KEY ?? '',
      'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.PRIVATE_KEY ?? '',
      'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.TOKEN ?? '',
      'Content-Type': 'application/json',
      'PAYDUNYA-MODE': PAYDUNYA_CONFIG.SANDBOX ? 'test' : 'live', // test ou live
    };
  }

  /**
   * Crée une facture PayDunya pour un utilisateur non authentifié
   * @param planData - informations sur le plan choisi
   * @param origin - URL de base de l'application pour les callbacks
   */
  async createInvoice(planData: Plan, origin: string) {
    try {
      // Préparer les données de la facture
      const invoiceData = {
        invoice: {
          total_amount: planData.amount,
          description: `Abonnement ${planData.title} - Conseils Météo`,
        },
        store: {
          name: "Conseils Météo App",
          tagline: "Vos conseils météo personnalisés",
          phone: "+226XXXXXXXX",
          email: "contact@votre-app.com",
          website: "https://votre-app.com"
        },
        actions: {
          callback_url: `${origin}/api/payment/webhook`, // webhook pour notifications
          cancel_url: `${origin}/payment/cancel`, // si l'utilisateur annule
          return_url: `${origin}/payment/success?plan=${planData.id}`, // après paiement
        },
        custom_data: {
          plan_type: planData.type,
          user_id: 'anonymous', // ici utilisateur non connecté
          plan_duration: '1 month'
        }
      };

      // Construire l'URL finale pour créer la facture
      const url = this.baseURL.endsWith('/')
        ? `${this.baseURL}checkout-invoice/create`
        : `${this.baseURL}/checkout-invoice/create`;

      console.log('URL PayDunya:', url);

      // Appel à l'API PayDunya
      const response = await axios.post(url, invoiceData, { headers: this.headers });

      // Retourner les données de la facture
      return response.data;
    } catch (error) {
      console.error('Erreur création facture PayDunya:', error);
      throw new Error('Impossible de créer la facture de paiement');
    }
  }
}

// Exporter une instance unique du service
export const paydunyaService = new PayDunyaService();
