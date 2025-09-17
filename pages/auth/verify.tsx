// src/pages/auth/verify.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function VerifyPage() {
  const router = useRouter();
  const { token, email } = router.query;
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && email) {
      const verifyEmail = async () => {
        try {
          const res = await fetch(
            `/api/auth/verify?token=${token}&email=${email}`
          );
          const data = await res.json();

          if (data.success) {
            setStatus("success");
            setMessage("✅ Email vérifié avec succès !");
            // Redirection après 3 secondes
            setTimeout(() => router.push("/auth/signin"), 3000);
          } else {
            setStatus("error");
            setMessage(data.error || "❌ Lien invalide ou expiré.");
          }
        } catch (error) {
          setStatus("error");
          setMessage("❌ Une erreur est survenue.");
        }
      };

      verifyEmail();
    }
  }, [token, email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <h1 className="text-xl font-bold text-gray-700">Vérification en cours...</h1>
            <p className="text-gray-500 mt-2">Merci de patienter ⏳</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-xl font-bold text-green-600">Succès 🎉</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <p className="text-gray-400 mt-4">Redirection vers la connexion...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-600">Erreur ⚠️</h1>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}