import { useState } from 'react';
import './FaqPage.css';

function FaqPage() {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is ClearNetLabs?',
      answer: 'ClearNetLabs is a privacy-focused platform for creating custom tokens and participating in decentralized mining. We\'re building the tools for Web3 creators and miners.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I get started?',
      answer: 'Create a free account and explore token creation on Solana. Mining features are coming soon.'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'Is ClearNetLabs free?',
      answer: 'Yes! Creating an account is completely free. No hidden costs.'
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'What can I do right now?',
      answer: 'Currently, you can create custom tokens on Solana. Our mining platform is under active development.'
    },
    {
      id: 5,
      category: 'Token Creation',
      question: 'How do I create a token?',
      answer: 'Log into your account and use our token creation tool. You can customize token name, symbol, supply, and metadata.'
    },
    {
      id: 6,
      category: 'Token Creation',
      question: 'Can I create multiple tokens?',
      answer: 'Yes! You can create multiple tokens. Each token can be configured independently.'
    },
    {
      id: 7,
      category: 'Token Creation',
      question: 'What blockchain do tokens deploy to?',
      answer: 'Tokens deploy to Solana, a fast and low-cost blockchain network.'
    },
    {
      id: 8,
      category: 'Token Creation',
      question: 'What\'s included when I create a token?',
      answer: 'You get a custom token on Solana with your specifications. Trading and liquidity are handled through DEX integrations.'
    },
    {
      id: 9,
      category: 'Mining',
      question: 'When will mining launch?',
      answer: 'We\'re actively developing our mining platform. Stay tuned for announcements about the launch date.'
    },
    {
      id: 10,
      category: 'Mining',
      question: 'How will mining work?',
      answer: 'Mining details are still being finalized. Sign up to receive updates when we announce more information.'
    },
    {
      id: 11,
      category: 'Mining',
      question: 'Will there be a mining extension?',
      answer: 'Yes, we\'re building a lightweight browser extension for mining. More details coming soon.'
    },
    {
      id: 12,
      category: 'Privacy',
      question: 'Is my data private?',
      answer: 'Privacy is central to our mission. We\'re committed to protecting user data and respecting user privacy.'
    },
    {
      id: 13,
      category: 'Privacy',
      question: 'What data do you collect?',
      answer: 'We only collect the information necessary to run the platform. We don\'t track browsing history or sell user data.'
    },
    {
      id: 14,
      category: 'Privacy',
      question: 'Do you use encryption?',
      answer: 'Yes, we protect sensitive data with encryption. Security is a priority for us.'
    },
    {
      id: 15,
      category: 'Security',
      question: 'Is my account secure?',
      answer: 'We implement standard security practices to protect your account. Always use a strong, unique password.'
    },
    {
      id: 16,
      category: 'Security',
      question: 'Can I enable two-factor authentication?',
      answer: 'Security features are being developed. Check your account settings for available security options.'
    },
    {
      id: 17,
      category: 'Support',
      question: 'How do I contact support?',
      answer: 'Email support@clearnetlabs.fun with any questions or issues. We\'re here to help!'
    },
    {
      id: 18,
      category: 'Support',
      question: 'How long does support take to respond?',
      answer: 'We aim to respond to support requests within 24 hours during business days.'
    },
    {
      id: 19,
      category: 'Support',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password" and follow the reset instructions sent to your email.'
    },
    {
      id: 20,
      category: 'Support',
      question: 'Can I have multiple accounts?',
      answer: 'One account per email address. This helps us maintain platform security and fair usage.'
    },
    {
      id: 21,
      category: 'Legal',
      question: 'Is this service legal?',
      answer: 'We\'re building our platform in compliance with applicable laws. We recommend checking local regulations in your area.'
    },
    {
      id: 22,
      category: 'Legal',
      question: 'Do I need to pay taxes on crypto earnings?',
      answer: 'Tax obligations depend on your local laws. Please consult with a tax professional about your specific situation.'
    },
    {
      id: 23,
      category: 'Legal',
      question: 'What are your terms of service?',
      answer: 'Check our full Terms of Service on the website. Key points: no bot automation, fair use only, one account per person.'
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