// services/PayDunyaService.ts
import axios from 'axios';
import { Plan } from '../../types/plan';
import { PAYDUNYA_CONFIG } from '../config/paydunya';

class PayDunyaService {
  private baseURL: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseURL = PAYDUNYA_CONFIG.BASE_URL ?? '';
    console.log('PAYDUNYA_CONFIG.BASE_URL:', PAYDUNYA_CONFIG.BASE_URL);
    console.log('this.baseURL:', this.baseURL);

    this.headers = {
      'PAYDUNYA-MASTER-KEY': PAYDUNYA_CONFIG.MASTER_KEY ?? '',
      'PAYDUNYA-PRIVATE-KEY': PAYDUNYA_CONFIG.PRIVATE_KEY ?? '',
      'PAYDUNYA-TOKEN': PAYDUNYA_CONFIG.TOKEN ?? '',
      'Content-Type': 'application/json',
      'PAYDUNYA-MODE': PAYDUNYA_CONFIG.SANDBOX ? 'test' : 'live',
    };
  }

  // Créer une facture PayDunya pour utilisateur non authentifié
  async createInvoice(planData: Plan, origin: string) {
    try {
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
          callback_url: `${origin}/api/payment/webhook`,
          cancel_url: `${origin}/payment/cancel`,
          return_url: `${origin}/payment/success?plan=${planData.id}`,
        },

        custom_data: {
          plan_type: planData.type,
          user_id: 'anonymous',
          plan_duration: '1 month'
        }
      };
      const url = `${this.baseURL}/checkout-invoice/create`;
      console.log('URL PayDunya:', url);


      const response = await axios.post(
        `${this.baseURL}/checkout-invoice/create`,
        invoiceData,
        { headers: this.headers }
      );

      return response.data;
    } catch (error) {
      console.error('Erreur création facture PayDunya:', error);
      throw new Error('Impossible de créer la facture de paiement');
    }
  }
}

export const paydunyaService = new PayDunyaService();
