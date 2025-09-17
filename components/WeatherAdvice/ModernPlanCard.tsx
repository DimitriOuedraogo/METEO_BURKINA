import { Plan } from '../../types/plan';

interface ModernPlanCardProps {
  plan: Plan;
  onClick: () => void;
}

const ModernPlanCard = ({ plan, onClick }: ModernPlanCardProps) => {
  const getHeaderClass = () => {
    if (plan.isPopular) return 'plan-header popular';
    if (plan.isEnterprise) return 'plan-header enterprise';
    return 'plan-header default';
  };

  const getButtonClass = () => {
    if (plan.isPopular) return 'plan-button popular';
    return 'plan-button default';
  };

  return (
    <div className="plan-card">
      {/* Header avec prix */}
      <div className={getHeaderClass()}>
        {plan.isPopular && (
          <div className="plan-badge">
            Populaire
          </div>
        )}
        <h3 className="plan-title">{plan.title}</h3>
        <div className="plan-price-container">
          <span className="plan-price">{plan.price}</span>
          <span className="plan-period">{plan.periodLabel || '/ Par requete'}</span>
        </div>
      </div>

      {/* Features */}
      <div className="plan-features">
        <ul>
          {plan.features?.map((feature, idx) => (
            <li key={idx} className="feature-item">
              <div className="feature-icon">
                <svg className="feature-check" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Button */}
      <div className="plan-button-container">
        <button onClick={onClick} className={getButtonClass()}>
         Obtenir
        </button>
      </div>
    </div>
  );
};

export default ModernPlanCard;
