import { useState } from 'react';
import './FaqPage.css';

function FaqPage() {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      question: 'What is PEPETOR-MINER?',
      answer: 'PEPETOR-MINER is a distributed computing platform that pays you cryptocurrency for sharing your unused browser bandwidth. It\'s completely legal and safe.'
    },
    {
      id: 2,
      category: 'Getting Started',
      question: 'How do I get started?',
      answer: 'Simply create a free account, download our Chrome extension, and start earning immediately. No credit card required.'
    },
    {
      id: 3,
      category: 'Getting Started',
      question: 'Is PEPETOR-MINER free?',
      answer: 'Yes! There are no fees, no hidden costs. Everything is completely free. You only pay when withdrawing to certain payment methods (if at all).'
    },
    {
      id: 4,
      category: 'Getting Started',
      question: 'Can I use this on mobile?',
      answer: 'Currently, PEPETOR-MINER works on desktop browsers (Chrome, Edge, Brave). Mobile apps are coming soon.'
    },
    {
      id: 5,
      category: 'Earnings',
      question: 'How much can I earn?',
      answer: 'Most users earn $50-300 per month depending on bandwidth and computer uptime. Some users earn $1000+ with multiple devices running 24/7.'
    },
    {
      id: 6,
      category: 'Earnings',
      question: 'How are earnings calculated?',
      answer: 'Earnings are based on bandwidth provided and computational resources used. The more you mine and the longer you stay online, the more you earn.'
    },
    {
      id: 7,
      category: 'Earnings',
      question: 'When do I get paid?',
      answer: 'You get paid daily. Earnings are added to your account automatically. You can withdraw anytime when your balance reaches the minimum ($10).'
    },
    {
      id: 8,
      category: 'Earnings',
      question: 'What currency do I get paid in?',
      answer: 'You earn in $PEPETOR cryptocurrency tokens. These can be sold on exchanges for any currency you prefer.'
    },
    {
      id: 9,
      category: 'Payouts',
      question: 'How do I withdraw my earnings?',
      answer: 'Go to your Dashboard, click "Withdraw", select your wallet type (MetaMask, Trust Wallet, etc.), and confirm. Payouts process within 24 hours.'
    },
    {
      id: 10,
      category: 'Payouts',
      question: 'What\'s the minimum withdrawal?',
      answer: 'The minimum withdrawal is $10. No maximum withdrawal limits.'
    },
    {
      id: 11,
      category: 'Payouts',
      question: 'Are there withdrawal fees?',
      answer: 'No withdrawal fees from our end. You only pay network fees when withdrawing (typically $1-3 depending on blockchain congestion).'
    },
    {
      id: 12,
      category: 'Payouts',
      question: 'How long does a withdrawal take?',
      answer: 'Withdrawals typically process within 24 hours. Blockchain confirmation takes an additional 5-15 minutes depending on network.'
    },
    {
      id: 13,
      category: 'Security',
      question: 'Is my data safe?',
      answer: 'Yes. We use military-grade encryption (AES-256) to protect your data. We never store passwords and use JWT tokens for authentication.'
    },
    {
      id: 14,
      category: 'Security',
      question: 'Does the extension have access to my browsing history?',
      answer: 'No. The extension only accesses bandwidth metrics. We have zero interest in your browsing history or personal data.'
    },
    {
      id: 15,
      category: 'Security',
      question: 'Can the extension be hacked?',
      answer: 'Our code is open source and regularly audited. The extension is regularly updated with security patches.'
    },
    {
      id: 16,
      category: 'Security',
      question: 'What permissions does the extension need?',
      answer: 'The extension needs: network access (to send/receive data) and storage (to save your account info). That\'s it.'
    },
    {
      id: 17,
      category: 'Technical',
      question: 'Will the extension slow down my computer?',
      answer: 'No. It uses less than 5MB of RAM and under 0.5% CPU. Most users don\'t notice any performance impact.'
    },
    {
      id: 18,
      category: 'Technical',
      question: 'Can I run multiple instances?',
      answer: 'Yes! Install on multiple devices and browsers to increase earnings. Each device mines independently.'
    },
    {
      id: 19,
      category: 'Technical',
      question: 'What if I close my browser?',
      answer: 'Mining stops when you close the browser. Start mining again next time you open it. No earnings are lost.'
    },
    {
      id: 20,
      category: 'Technical',
      question: 'Do I need to be actively browsing?',
      answer: 'No. The extension mines in the background even if you\'re not actively browsing, as long as the browser is open.'
    },
    {
      id: 21,
      category: 'Troubleshooting',
      question: 'Why aren\'t my earnings showing?',
      answer: 'New accounts take 1-2 hours to fully sync. If after 2 hours earnings aren\'t showing, contact support.'
    },
    {
      id: 22,
      category: 'Troubleshooting',
      question: 'The extension stopped working. What do I do?',
      answer: 'Try: 1) Disable/re-enable the extension, 2) Clear cache, 3) Reinstall the extension. Contact support if issues persist.'
    },
    {
      id: 23,
      category: 'Troubleshooting',
      question: 'I forgot my password. How do I reset it?',
      answer: 'On the login page, click "Forgot Password". Enter your email and follow the reset link sent to your inbox.'
    },
    {
      id: 24,
      category: 'Troubleshooting',
      question: 'Can I have multiple accounts?',
      answer: 'No. One account per email address. Creating multiple accounts violates terms of service and results in permanent ban.'
    },
    {
      id: 25,
      category: 'Legal',
      question: 'Is PEPETOR-MINER legal?',
      answer: 'Yes, completely legal. We operate in full compliance with local regulations in 150+ countries.'
    },
    {
      id: 26,
      category: 'Legal',
      question: 'Do I need to pay taxes on mining earnings?',
      answer: 'That depends on your local tax laws. We recommend consulting with a tax professional about crypto earnings in your country.'
    },
    {
      id: 27,
      category: 'Legal',
      question: 'What\'s your terms of service?',
      answer: 'Check out our full Terms of Service on the website. Key points: no automation tools, no botting, one account per person.'
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