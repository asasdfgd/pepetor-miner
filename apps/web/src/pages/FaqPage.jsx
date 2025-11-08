import { useState } from 'react';
import './FaqPage.css';

function FaqPage() {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is PEPETOR-MINER?',
      answer: 'PEPETOR-MINER is the first privacy-first Web3 platform where anyone can mine $PEPETOR tokens, create custom tokens on Solana, and trade them instantly. Powered by our lightweight browser extension, you can earn passive income 24/7.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I get started?',
      answer: 'Create a free account, download our browser extension, and start mining $PEPETOR immediately. You can also create custom tokens on Solana in just 3 clicks.'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'Is PEPETOR-MINER free?',
      answer: 'Yes! Creating an account and mining are completely free. No hidden costs, no subscription fees.'
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'What can I do right now?',
      answer: 'You can mine $PEPETOR tokens, create custom tokens on Solana, track your earnings in real-time, and trade tokens on integrated DEXs like Raydium and Jupiter.'
    },
    {
      id: 5,
      category: 'Mining',
      question: 'How does mining work?',
      answer: 'Install our Chrome extension and it will mine $PEPETOR tokens while you browse. The extension uses less than 5MB RAM and under 0.5% CPU, so you won\'t notice any performance impact.'
    },
    {
      id: 6,
      category: 'Mining',
      question: 'How much can I earn mining?',
      answer: 'Earnings vary based on network contribution, time spent mining, and current token value. Most miners earn between $0.10-$0.50 per hour. Run multiple instances on different devices to multiply earnings.'
    },
    {
      id: 7,
      category: 'Mining',
      question: 'Can I run multiple mining instances?',
      answer: 'Yes! Install the extension on multiple browsers or devices. Each device mines independently and contributes to your total earnings.'
    },
    {
      id: 8,
      category: 'Mining',
      question: 'Will mining slow down my browser?',
      answer: 'No. Our extension is optimized for minimal impact - less than 5MB RAM and under 0.5% CPU usage. You won\'t notice any slowdown during normal browsing.'
    },
    {
      id: 9,
      category: 'Token Creation',
      question: 'How do I create a token?',
      answer: 'Go to your Dashboard and use our Token Creation tool. Customize your token\'s name, symbol, supply, and metadata. Deploy to Solana in 3 clicks - no coding required.'
    },
    {
      id: 10,
      category: 'Token Creation',
      question: 'Can I create multiple tokens?',
      answer: 'Yes! Create unlimited tokens. Each token can be configured independently with your own parameters and branding.'
    },
    {
      id: 11,
      category: 'Token Creation',
      question: 'What blockchain do tokens deploy to?',
      answer: 'All tokens deploy to Solana, a fast and low-cost blockchain network. Instant transactions with minimal fees.'
    },
    {
      id: 12,
      category: 'Token Creation',
      question: 'What\'s included when I create a token?',
      answer: 'You get a fully functional SPL token on Solana with your specifications. Automatically tradeable on Raydium, Jupiter, and visible on DEX Screener with live price tracking.'
    },
    {
      id: 13,
      category: 'Privacy',
      question: 'Is my data private?',
      answer: 'Absolutely. Privacy is our core value. We use military-grade encryption, zero tracking, and your data never leaves your device without your permission.'
    },
    {
      id: 14,
      category: 'Privacy',
      question: 'What data do you collect?',
      answer: 'We only collect bandwidth metrics for earnings calculations. We don\'t track browsing history, sell user data, or share information with third parties.'
    },
    {
      id: 15,
      category: 'Privacy',
      question: 'Do you use encryption?',
      answer: 'Yes. All sensitive data is protected with military-grade encryption. Your wallet keys and personal information are encrypted end-to-end.'
    },
    {
      id: 16,
      category: 'Extension',
      question: 'Which browsers are supported?',
      answer: 'Currently Chrome, Edge, and Brave. Firefox support is coming soon. The extension works on all Chromium-based browsers.'
    },
    {
      id: 17,
      category: 'Extension',
      question: 'How do I update the extension?',
      answer: 'Updates happen automatically. You\'ll receive notifications when new versions are available with improvements and bug fixes.'
    },
    {
      id: 18,
      category: 'Extension',
      question: 'What happens if I uninstall the extension?',
      answer: 'Your earnings are safe in your account. You can reinstall anytime and continue from where you left off. No data is lost.'
    },
    {
      id: 19,
      category: 'Security',
      question: 'Is my account secure?',
      answer: 'Yes. We implement industry-standard security practices including encryption, secure authentication, and regular security audits. Always use a strong, unique password.'
    },
    {
      id: 20,
      category: 'Security',
      question: 'Is the extension safe to install?',
      answer: 'Yes! Our extension is open source and regularly audited by the community. We don\'t collect personal data, only bandwidth metrics for earnings calculations.'
    },
    {
      id: 21,
      category: 'Trading',
      question: 'How do I trade my tokens?',
      answer: 'Tokens created on our platform are automatically tradeable on Raydium and Jupiter DEX. Track live prices on DEX Screener and trade instantly.'
    },
    {
      id: 22,
      category: 'Trading',
      question: 'When can I withdraw my earnings?',
      answer: 'Withdraw your $PEPETOR earnings anytime to your Solana wallet. Minimum withdrawal amounts apply to cover network fees.'
    },
    {
      id: 23,
      category: 'Support',
      question: 'How do I contact support?',
      answer: 'Email support@clearnetlabs.fun with any questions or issues. We\'re here to help and respond within 24 hours.'
    },
    {
      id: 24,
      category: 'Support',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password" and follow the reset instructions sent to your email.'
    },
    {
      id: 25,
      category: 'Support',
      question: 'Can I have multiple accounts?',
      answer: 'One account per email address. This helps us maintain platform security and fair usage policies.'
    },
    {
      id: 26,
      category: 'Legal',
      question: 'Is this service legal?',
      answer: 'Yes. We operate in compliance with applicable laws. We recommend checking local regulations in your area regarding cryptocurrency mining and trading.'
    },
    {
      id: 27,
      category: 'Legal',
      question: 'Do I need to pay taxes on crypto earnings?',
      answer: 'Tax obligations depend on your local laws. Please consult with a tax professional about your specific situation and crypto earnings.'
    },
    {
      id: 28,
      category: 'Rewards',
      question: 'Are there leaderboards?',
      answer: 'Yes! Compete with miners worldwide on our leaderboards. Earn bonuses for mining volume, achievements, and referrals.'
    },
    {
      id: 29,
      category: 'Rewards',
      question: 'What are the referral rewards?',
      answer: 'Invite friends and earn bonus $PEPETOR tokens when they start mining. Check your Dashboard for your unique referral link.'
    }
  ];

  const categories = ['All', ...new Set(faqs.map(faq => faq.category))];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="container">
      <div className="faq-page">
        {/* Header */}
        <section className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about PEPETOR-MINER</p>
        </section>

        {/* Search / Filter */}
        <section className="faq-filter">
          <div className="categories">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="faq-list">
          {filteredFaqs.map(faq => (
            <div key={faq.id} className="faq-accordion-item">
              <button
                className="faq-question"
                onClick={() => toggleExpand(faq.id)}
              >
                <span className="question-text">{faq.question}</span>
                <span className={`expand-icon ${expandedId === faq.id ? 'expanded' : ''}`}>
                  ▼
                </span>
              </button>
              {expandedId === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Support CTA */}
        <section className="support-cta">
          <h2>Still have questions?</h2>
          <p>Didn't find what you're looking for? Reach out to our support team.</p>
          <a href="mailto:support@clearnetlabs.fun" className="btn btn-primary">
            Contact Support
          </a>
        </section>
      </div>
    </div>
  );
}

export default FaqPage;