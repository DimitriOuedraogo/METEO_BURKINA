// pages/api/payment/create-invoice.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { paydunyaService } from '../../../lib/services/paydunyaService';
import { Plan } from '../../../types/plan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { plan } = req.body as { plan: Plan };
    const origin =
      req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const invoice = await paydunyaService.createInvoice(plan, origin);
    
    console.log('BASE_URL:', process.env.PAYDUNYA_BASE_URL);
    console.log('PRIVATE_KEY:', process.env.PAYDUNYA_PRIVATE_KEY?.slice(0, 4) + '...');


    console.log('Réponse PayDunya:', JSON.stringify(invoice, null, 2));

    // ✅ PayDunya renvoie directement l’URL dans response_text
    const checkoutUrl =
      invoice?.response?.invoice_url || invoice?.checkout_url || invoice?.response_text;

    if (!checkoutUrl) {
      return res.status(500).json({ error: 'URL de paiement introuvable', invoice });
    }

    return res.status(200).json({ checkoutUrl });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erreur API PayDunya:', error.message);
      return res.status(500).json({ error: 'Erreur création facture PayDunya' });
    } else {
      console.error('Erreur API PayDunya inconnue:', error);
      return res.status(500).json({ error: 'Erreur création facture PayDunya inconnue' });
    }
  }

}
