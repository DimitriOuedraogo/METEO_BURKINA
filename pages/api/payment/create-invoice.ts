import type { NextApiRequest, NextApiResponse } from 'next';
import { paydunyaService } from '../../../lib/services/paydunyaService';
import { Plan } from '../../../types/plan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vérifier que la méthode est POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST'); // Indiquer les méthodes autorisées
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Récupérer le plan choisi depuis le corps de la requête
    const { plan } = req.body as { plan: Plan };

    // Déterminer l'URL d'origine pour le callback (frontend)
    const origin =
      req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Créer la facture via le service PayDunya
    const invoice = await paydunyaService.createInvoice(plan, origin);
    
    // Logs utiles pour debug (ne pas exposer la clé privée en production)
    console.log('BASE_URL:', process.env.PAYDUNYA_BASE_URL);
    console.log('PRIVATE_KEY:', process.env.PAYDUNYA_PRIVATE_KEY?.slice(0, 4) + '...');
    console.log('Réponse PayDunya:', JSON.stringify(invoice, null, 2));

    // Récupérer l'URL de paiement (PayDunya renvoie l'URL dans response_text ou invoice_url)
    const checkoutUrl =
      invoice?.response?.invoice_url || invoice?.checkout_url || invoice?.response_text;

    if (!checkoutUrl) {
      // Si aucune URL trouvée, renvoyer une erreur
      return res.status(500).json({ error: 'URL de paiement introuvable', invoice });
    }

    // Retourner l'URL de paiement au front-end
    return res.status(200).json({ checkoutUrl });
  } catch (error: unknown) {
    // Gestion des erreurs
    if (error instanceof Error) {
      console.error('Erreur API PayDunya:', error.message);
      return res.status(500).json({ error: 'Erreur création facture PayDunya' });
    } else {
      console.error('Erreur API PayDunya inconnue:', error);
      return res.status(500).json({ error: 'Erreur création facture PayDunya inconnue' });
    }
  }
}
