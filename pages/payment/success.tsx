import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Success() {
  const router = useRouter();
  const { plan } = router.query; // Récupère le plan choisi depuis les paramètres de l'URL

  useEffect(() => {
    if (plan) {
      // Redirige vers la page d’accueil avec les paramètres du plan et paiement réussi
      router.push(`/?plan=${plan}&paid=true`);
    }
  }, [plan, router]); // Déclenche l'effet uniquement quand plan ou router change

  // Message affiché pendant la redirection
  return <p>Paiement validé, redirection...</p>;
}
