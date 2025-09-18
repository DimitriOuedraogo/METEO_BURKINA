// src/pages/auth/verify.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const router = useRouter();

  // Récupération des paramètres token et email depuis l'URL
  const { token, email } = router.query;

  // États pour gérer le statut de la vérification et le message affiché
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // Effet pour lancer la vérification dès que token et email sont disponibles
  useEffect(() => {
    if (token && email) {
      const verifyEmail = async () => {
        try {
          // Appel API pour vérifier le token et l'email
          const res = await fetch(`/api/auth/verify?token=${token}&email=${email}`);
          const data = await res.json();

          if (data.success) {
            setStatus("success"); // vérification réussie
            setMessage("✅ Email vérifié avec succès !");
            // Redirection vers la page de connexion après 3 secondes
            setTimeout(() => router.push("/auth/signin"), 3000);
          } else {
            setStatus("error"); // échec de la vérification
            setMessage(data.error || "❌ Lien invalide ou expiré.");
          }
        } catch (error) {
          setStatus("error"); // erreur serveur
          setMessage("❌ Une erreur est survenue.");
        }
      };

      verifyEmail();
    }
  }, [token, email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        {/* Affichage pendant la vérification */}
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-gray-700">Vérification en cours...</h1>
            <p className="text-gray-500 mt-2">Merci de patienter</p>
          </>
        )}

        {/* Affichage en cas de succès */}
        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600">Succès</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-gray-400 mt-4">Redirection vers la connexion...</p>
          </>
        )}

        {/* Affichage en cas d'erreur */}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">Erreur</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
