import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Success() {
  const router = useRouter();
  const { plan } = router.query;

  useEffect(() => {
    if (plan) {
      // Redirige vers la page d’accueil avec le plan choisi
      router.push(`/?plan=${plan}&paid=true`);
    }
  }, [plan, router]);

  return <p>✅ Paiement validé, redirection...</p>;
}
