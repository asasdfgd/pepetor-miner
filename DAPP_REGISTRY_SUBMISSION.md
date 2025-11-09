# dApp Registry Submission Guide

This document provides instructions for submitting ClearNetLabs to various dApp registries and security platforms to increase trust and prevent Phantom/wallet blocking.

---

## 1. Solana dApp Registry (Official)

**Repository**: https://github.com/solana-labs/dapp-list

### Submission Steps:

1. **Fork the repository**:
   ```bash
   git clone https://github.com/solana-labs/dapp-list.git
   cd dapp-list
   ```

2. **Create your dApp entry** in `src/dapps.json`:
   ```json
   {
     "name": "ClearNetLabs",
     "url": "https://clearnetlabs.fun",
     "logo": "https://brown-glamorous-crane-421.mypinata.cloud/ipfs/bafybeicqq3g3o57pdm7wesrlrjw5b77a5n2nzems32qcmodmspfbgbha44",
     "description": "Privacy-first Solana token creation platform. Create custom SPL tokens in minutes with no coding required.",
     "category": "DeFi",
     "tags": ["token-creation", "solana", "defi", "web3"],
     "chain": "solana",
     "twitter": "https://x.com/clearnetmoney",
     "github": "https://github.com/asasdfgd/pepetor-miner"
   }
   ```

3. **Submit Pull Request**:
   - Branch name: `add-clearnetlabs`
   - Title: "Add ClearNetLabs - Solana Token Creation Platform"
   - Description: Brief overview of the platform

4. **Wait for Review**: Solana Foundation typically reviews within 1-2 weeks.

---

## 2. CertiK Skynet (Security Monitoring)

**Website**: https://skynet.certik.com

### Submission Steps:

1. Visit https://skynet.certik.com/projects/submit
2. Fill out the form:
   - **Project Name**: ClearNetLabs
   - **URL**: https://clearnetlabs.fun
   - **Chain**: Solana
   - **Category**: DeFi / Token Launchpad
   - **Description**: Privacy-first token creation platform
   - **Contact Email**: qeradad2@gmail.com

3. **Optional**: Request security audit (paid service)
4. **Free Tier**: CertiK Skynet provides basic security monitoring for free

### Badge Integration (After Approval):
```html
<a href="https://skynet.certik.com/projects/clearnetlabs">
  <img src="https://skynet.certik.com/badge/clearnetlabs" alt="CertiK Security Score" />
</a>
```

---

## 3. Phantom Wallet Trust List

**Contact**: https://phantom.app/developer

### Submission Steps:

1. Email: developer@phantom.app
2. **Subject**: "Whitelist Request - ClearNetLabs (clearnetlabs.fun)"
3. **Email Body**:
   ```
   Hello Phantom Team,

   I'm requesting whitelisting for ClearNetLabs (https://clearnetlabs.fun), 
   a legitimate Solana token creation platform.

   Project Details:
   - Name: ClearNetLabs / PepeTor Miner
   - URL: https://clearnetlabs.fun
   - Purpose: Privacy-first SPL token creation
   - GitHub: https://github.com/asasdfgd/pepetor-miner (Open Source)
   - Security: Uses official @solana/wallet-adapter
   - Terms of Service: https://clearnetlabs.fun/terms
   - Privacy Policy: https://clearnetlabs.fun/privacy

   Our platform uses standard Solana wallet-adapter libraries and only requests 
   user signatures for legitimate token deployment transactions. We do NOT 
   auto-drain wallets or use misleading practices.

   Thank you for your consideration.

   Best regards,
   Joseph Pietravalle
   Email: qeradad2@gmail.com
   Twitter: @clearnetmoney
   ```

4. **Attach**:
   - Screenshot of homepage
   - Link to Terms & Privacy pages
   - Link to GitHub repository

---

## 4. Solflare Wallet Verification

**Contact**: https://solflare.com/contact

### Submission Steps:

1. Email: support@solflare.com
2. **Subject**: "dApp Verification Request - ClearNetLabs"
3. Use similar email template as Phantom (above)

---

## 5. DappRadar Listing

**Website**: https://dappradar.com/submit-dapp

### Submission Steps:

1. Visit https://dappradar.com/submit-dapp
2. Fill out the form:
   - **dApp Name**: ClearNetLabs
   - **URL**: https://clearnetlabs.fun
   - **Chain**: Solana
   - **Category**: DeFi
   - **Description**: Privacy-first token creation and mining platform
   - **Social Links**: Twitter, GitHub

3. Submit and wait for review (1-2 weeks)

---

## 6. Alchemy Verified Contracts (Optional)

**Website**: https://www.alchemy.com/dapps/submit

### Submission Steps:

1. Visit Alchemy Dapp Store
2. Submit ClearNetLabs with:
   - Smart contract addresses (if applicable)
   - Program IDs for Solana programs
   - Project documentation

---

## 7. Web3 Security Scanners

### 7.1 GoPlus Security

**Website**: https://gopluslabs.io

- Submit your domain for automatic security scanning
- Get a security badge to display on your site

### 7.2 CertiK Skynet (Free Tier)

- Already covered above
- Provides real-time security monitoring

---

## 8. SSL/HTTPS Verification

### Vercel (Automatic)

Since you're using Vercel, HTTPS is **automatically enabled** for:
- `clearnetlabs.fun`
- `*.clearnetlabs.fun`

**Verification**:
1. Visit https://clearnetlabs.fun
2. Check for padlock icon in browser
3. Certificate should be issued by Let's Encrypt (via Vercel)

**If SSL is not working**:
1. Go to Vercel Dashboard → Project Settings → Domains
2. Ensure DNS is configured correctly
3. Force HTTPS redirect in Vercel settings

---

## 9. Add Trust Badges to Website

After approval from security platforms, add badges to your footer:

### Example Implementation (`apps/web/src/App.jsx`):

```jsx
<div className="footer-badges">
  <a href="https://skynet.certik.com/projects/clearnetlabs" target="_blank" rel="noopener noreferrer">
    <img src="path/to/certik-badge.png" alt="CertiK Verified" />
  </a>
  <a href="https://github.com/asasdfgd/pepetor-miner" target="_blank" rel="noopener noreferrer">
    <img src="path/to/opensource-badge.png" alt="Open Source" />
  </a>
</div>
```

---

## 10. Monitoring & Compliance Checklist

- [ ] Submit to Solana dApp Registry
- [ ] Request Phantom wallet whitelist
- [ ] Request Solflare wallet whitelist
- [ ] Submit to CertiK Skynet
- [ ] List on DappRadar
- [ ] Enable HTTPS (auto via Vercel)
- [ ] Add Terms of Service ✅
- [ ] Add Privacy Policy ✅
- [ ] Add disclaimer footer ✅
- [ ] Monitor for security alerts
- [ ] Respond to user reports promptly

---

## 11. Expected Timeline

| Action | Timeline |
|--------|----------|
| Solana dApp Registry | 1-2 weeks |
| Phantom Whitelist | 1-3 weeks |
| CertiK Submission | Immediate (monitoring starts) |
| DappRadar Listing | 1-2 weeks |
| SSL/HTTPS | Immediate (Vercel auto) |

---

## 12. Contact Information

For submission assistance or questions:

- **Email**: qeradad2@gmail.com
- **Twitter**: @clearnetmoney
- **GitHub**: https://github.com/asasdfgd/pepetor-miner

---

## 13. Additional Resources

- **Solana Security Best Practices**: https://docs.solana.com/developing/programming-model/security
- **Web3 dApp Security Guide**: https://consensys.github.io/smart-contract-best-practices/
- **Phantom Developer Docs**: https://docs.phantom.app/
- **CertiK Security Hub**: https://www.certik.com/

---

**Last Updated**: November 9, 2024
