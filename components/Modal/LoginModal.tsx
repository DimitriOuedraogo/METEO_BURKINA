// components/LoginModal.tsx
import { Cloud } from "lucide-react";

interface LoginModalProps {
  onClose: () => void;
  onLogin: () => void;
  message?: string;
}

const LoginModal = ({ onClose, onLogin, message }: LoginModalProps) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* --- Header --- */}
        <div className="modal-header">
          <h2 className="modal-title">
            <Cloud className="modal-icon" />
            <span>Météo Burkina</span>
          </h2>
          <p className="modal-subtitle">
            {message || "Connectez-vous pour accéder à cette fonctionnalité"}
          </p>
        </div>

        {/* --- Actions --- */}
        <div className="modal-actions">
          <button className="modal-login-btn" onClick={onLogin}>
            Se connecter
          </button>
          <button className="modal-close-btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
