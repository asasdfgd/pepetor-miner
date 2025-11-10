import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './TutorialModal.css';

const TutorialModal = ({ onClose }) => {
  const { updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      icon: '👋',
      title: 'Welcome to ClearNet Labs',
      description: 'The cheapest way to launch Solana tokens with built-in liquidity features',
      highlights: [
        'Deploy tokens for just $12 (95% cheaper than competitors)',
        'No upfront liquidity required with bonding curves',
        'Earn passive income from trading fees',
        'Auto-migration to DEX at threshold',
      ],
    },
    {
      icon: '🎯',
      title: 'Choose Your Launch Type',
      description: 'Pick the best launch strategy for your token',
      highlights: [
        '📈 Bonding Curve (Recommended): Start with 0 liquidity, auto-graduate to DEX at 85 SOL market cap',
        '⚡ Instant DEX: Traditional launch with immediate trading on Raydium',
        'Both options lock liquidity permanently to prevent rug pulls',
      ],
    },
    {
      icon: '💰',
      title: 'Early Liquidity Commitments',
      description: 'Investors can commit SOL before migration and earn LP tokens',
      highlights: [
        'Commit SOL to bonding curve tokens before they graduate',
        'Automatically receive LP tokens when pool migrates to DEX',
        'Earn trading fees proportional to your commitment',
        'Cancel and get refunded anytime before migration',
        'Higher APY for early commitments (up to 150%)',
      ],
    },
    {
      icon: '🚀',
      title: 'Deploy Your Token',
      description: 'Simple 5-step process to launch your token',
      highlights: [
        '1. Connect your Phantom wallet',
        '2. Fill in token details (name, symbol, supply)',
        '3. Upload logo and description (optional)',
        '4. Select launch type and confirm pricing',
        '5. Sign transaction and your token is live!',
      ],
    },
    {
      icon: '📊',
      title: 'Track & Manage',
      description: 'Monitor your tokens and commitments in real-time',
      highlights: [
        'View all deployed tokens in the dashboard',
        'Track bonding curve progress to migration',
        'See total SOL committed by investors',
        'Monitor your LP token earnings',
        'Get trading links for Meteora and DexScreener',
      ],
    },
    {
      icon: '🎓',
      title: 'Pro Tips',
      description: 'Get the most out of ClearNet Labs',
      highlights: [
        '💡 Use bonding curves to save $235 vs traditional DEX launch',
        '🔥 Add a compelling description and logo to attract investors',
        '📱 Share your token page to gather early commitments',
        '⚡ Tokens auto-list on DexScreener after migration',
        '🛡️ All liquidity is locked forever - no rug pulls possible',
      ],
    },
  ];

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/tutorial-seen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      updateUser({ hasSeenTutorial: true });
    } catch (error) {
      console.error('Error marking tutorial as seen:', error);
    }
    onClose();
  };

  const handleSkip = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/tutorial-seen`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      updateUser({ hasSeenTutorial: true });
    } catch (error) {
      console.error('Error marking tutorial as seen:', error);
    }
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-backdrop" onClick={handleSkip}></div>
      
      <div className="tutorial-modal">
        <button className="tutorial-close" onClick={handleSkip}>✕</button>
        
        <div className="tutorial-progress">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>

        <div className="tutorial-content">
          <div className="tutorial-icon">{currentStepData.icon}</div>
          <h2 className="tutorial-title">{currentStepData.title}</h2>
          <p className="tutorial-description">{currentStepData.description}</p>
          
          <div className="tutorial-highlights">
            {currentStepData.highlights.map((highlight, index) => (
              <div key={index} className="highlight-item">
                <span className="highlight-bullet">•</span>
                <span className="highlight-text">{highlight}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tutorial-footer">
          <div className="tutorial-navigation">
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={isFirstStep}
            >
              ← Previous
            </button>
            
            <div className="step-indicator">
              Step {currentStep + 1} of {tutorialSteps.length}
            </div>
            
            <button
              className="btn btn-primary"
              onClick={handleNext}
            >
              {isLastStep ? 'Get Started 🚀' : 'Next →'}
            </button>
          </div>
          
          {!isLastStep && (
            <button className="btn-skip" onClick={handleSkip}>
              Skip Tutorial
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
