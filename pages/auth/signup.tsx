import {  Cloud, Sun, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas !");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage("❌ Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Inscription réussie ! Vérifiez votre email pour activer votre compte.");
        setTimeout(() => router.push("/auth/signin"), 4000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur serveur, réessayez plus tard.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">
            <Cloud className="auth-icon-small" />
            <span>Météo Burkina</span>
          </h2>
          <p className="auth-subtitle">Créez votre compte</p>
        </div>

        {message && (
          <div className={`auth-message ${
            message.includes('✅') ? 'success' : 'error'
          }`}>
            {message.includes('❌') ? message : message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-group password-group">
            <label>Mot de passe</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <div className="form-group password-group">
            <label>Confirmez le mot de passe</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              required
            />
            <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </span>
          </div>

          <button type="submit" disabled={isLoading} className="auth-button">
            {isLoading ? "Inscription en cours..." : "S&apos;inscrire"}
          </button>
        </form>

        <p className="auth-footer">
          Déjà un compte ?{" "}
          <button onClick={() => router.push("/auth/signin")} className="signup-link">
            Se connecter
          </button>
        </p>

        {/* Petits éléments météo flottants */}
        <Sun className="sun-animate" />
        <Cloud className="cloud-animate" />
      </div>
    </div>
  );
}
