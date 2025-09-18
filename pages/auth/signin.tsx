import { AlertCircle, Cloud, Eye, EyeOff, Sun } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();

  // États du formulaire
  const [email, setEmail] = useState(""); // email saisi par l'utilisateur
  const [password, setPassword] = useState(""); // mot de passe saisi
  const [showPassword, setShowPassword] = useState(false); // toggle visibilité mot de passe
  const [loading, setLoading] = useState(false); // état de chargement lors de la soumission
  const [error, setError] = useState(""); // message d'erreur éventuel

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // reset des erreurs

    // Appel à NextAuth pour l'authentification
    const res = await signIn("credentials", {
      redirect: false, // ne pas rediriger automatiquement
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(res.error); // afficher l'erreur si login échoue
    } else {
      router.push("/"); // redirection vers la page principale si succès
    }
  };

  // Connexion via Google OAuth
  const handleGoogleSignIn = () => {
    // callbackUrl = page après connexion réussie
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        {/* Header du formulaire */}
        <div className="signin-header">
          <h2 className="signin-title">
            <Cloud className="signin-icon-small" />
            <span>Météo Burkina</span>
          </h2>
          <p className="signin-subtitle">
            Connectez-vous pour accéder à votre tableau météo
          </p>
        </div>

        {/* Affichage d'une erreur si elle existe */}
        {error && (
          <div className="signin-error">
            <AlertCircle className="signin-icon-error" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire email / mot de passe */}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group password-group">
            <label>Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"} // toggle visibilité
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          {/* Bouton de soumission */}
          <button type="submit" disabled={loading} className="signin-button">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {/* Séparateur */}
        <div className="separator">
          <span>ou</span>
        </div>

        {/* Bouton Google Sign-In */}
        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignIn}
        >
          {/* Icone Google */}
          <span className="google-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" focusable="false">
              <path fill="#EA4335" d="M24 9.5c3.9 0 7 1.4 9.2 3.1l6.8-6.8C36.7 2 30.7 0 24 0 14.7 0 6.9 4.8 2.6 11.7l7.9 6.1C12.5 12.3 17.7 9.5 24 9.5z" />
              <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.8c-.6 3.3-2.7 6.1-5.8 7.9l8.9 6.9C44.2 38.5 46.5 31.9 46.5 24.5z" />
              <path fill="#4A90E2" d="M10.5 29.8A14.7 14.7 0 0 1 9.3 24.5c0-1.6.3-3.1.8-4.5L2.6 13.9C-.7 18.5-.7 24.5 2.6 29.1l7.9.7z" />
              <path fill="#FBBC05" d="M24 48c6.7 0 12.7-2.2 17-6l-8.9-6.9c-2.6 1.7-5.9 2.7-8.1 2.7-6.3 0-11.5-4-13.4-9.5L2.6 36.3C6.9 43.2 14.7 48 24 48z" />
            </svg>
          </span>
          <span>Se connecter avec Google</span>
        </button>

        {/* Lien vers la page d'inscription */}
        <p className="signin-footer">
          Pas encore de compte ?{" "}
          <Link href="/auth/signup" className="signup-link">
            Inscrivez-vous
          </Link>
        </p>

        {/* Animations de fond */}
        <Sun className="sun-animate" />
        <Cloud className="cloud-animate" />
      </div>
    </div>
  );
}
