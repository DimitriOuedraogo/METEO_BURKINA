import { Cloud, Sun, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();

  // États du formulaire
  const [username, setUsername] = useState(""); // nom d'utilisateur saisi
  const [email, setEmail] = useState(""); // email saisi
  const [password, setPassword] = useState(""); // mot de passe
  const [confirmPassword, setConfirmPassword] = useState(""); // confirmation du mot de passe
  const [showPassword, setShowPassword] = useState(false); // toggle visibilité mot de passe
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // toggle visibilité confirmation
  const [message, setMessage] = useState(""); // message d'erreur ou succès
  const [isLoading, setIsLoading] = useState(false); // état de chargement du formulaire

  // Gestion de la soumission du formulaire
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // reset du message

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    // Vérification de la longueur minimale du mot de passe
    if (password.length < 6) {
      setMessage("❌ Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      // Appel API pour créer un nouvel utilisateur
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        // Inscription réussie : message et redirection vers la page de connexion
        setMessage("✅ Inscription réussie ! Vérifiez votre email pour activer votre compte.");
        setTimeout(() => router.push("/auth/signin"), 4000);
      } else {
        setMessage(`❌ ${data.error}`); // afficher l'erreur renvoyée par l'API
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur serveur, réessayez plus tard."); // message erreur générale
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Header du formulaire */}
        <div className="auth-header">
          <h2 className="auth-title">
            <Cloud className="auth-icon-small" />
            <span>Météo Burkina</span>
          </h2>
          <p className="auth-subtitle">Créez votre compte</p>
        </div>

        {/* Affichage du message de succès ou d'erreur */}
        {message && (
          <div className={`auth-message ${
            message.includes('✅') ? 'success' : 'error'
          }`}>
            {message.includes('❌') ? message : message}
          </div>
        )}

        {/* Formulaire d'inscription */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Nom d'utilisateur */}
          <div className="form-group">
            <label>Nom d&apos;utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Mot de passe */}
          <div className="form-group password-group">
            <label>Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"} // toggle visibilité
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          {/* Confirmation mot de passe */}
          <div className="form-group password-group">
            <label>Confirmez le mot de passe</label>
            <input
              type={showConfirmPassword ? "text" : "password"} // toggle visibilité
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          {/* Bouton de soumission */}
          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? "Inscription en cours..." : "Cree un Compte"}
          </button>
        </form>

        {/* Lien vers la page de connexion */}
        <p className="auth-footer">
          Déjà un compte ?{" "}
          <button onClick={() => router.push("/auth/signin")} className="signup-link">
            Se connecter
          </button>
        </p>

        {/* Animations de fond */}
        <Sun className="sun-animate" />
        <Cloud className="cloud-animate" />
      </div>
    </div>
  );
}
