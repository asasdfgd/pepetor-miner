# dApp Registry Submission Guide

This document provides instructions for submitting ClearNetLabs to various dApp registries and security platforms to increase trust and prevent Phantom/wallet blocking.

---

## 1. Blowfish Security (Phantom's Security Provider)

**Website**: https://blowfish.xyz

Phantom wallet uses Blowfish to scan transactions and flag malicious dApps. Getting verified by Blowfish will prevent security warnings in Phantom.

### Submission Steps:

1. **Contact Blowfish directly**:
   - Email: support@blowfish.xyz
   - Subject: "dApp Whitelist Request - ClearNetLabs"

2. **Email Template**:
   ```
   Hello Blowfish Team,

   I'm requesting whitelisting for ClearNetLabs (https://clearnetlabs.fun), 
   a legitimate Solana token creation platform.

   Project Details:
   - Name: ClearNetLabs
   - URL: https://clearnetlabs.fun
   - Purpose: Privacy-first SPL token creation
   - GitHub: https://github.com/asasdfgd/pepetor-miner (Open Source)
   - Security: Uses official @solana/wallet-adapter-react
   - Terms: https://clearnetlabs.fun/terms
   - Privacy: https://clearnetlabs.fun/privacy

   Our platform only requests user signatures for legitimate token deployment 
   transactions. We use standard Solana wallet-adapter libraries.

   Thank you for your consideration.

   Best regards,
   Joseph Pietravalle
   qeradad2@gmail.com
   ```

3. **Wait for Review**: Typically 1-2 weeks

---

## 2. Phantom Domain Review Team

**Documentation**: https://docs.phantom.com/developer-powertools/domain-and-transaction-warnings  
**Domain Review Form**: https://docs.google.com/forms/d/1JgIxdmolgh_80xMfQKBKx9-QPC7LRdN6LHpFFW8BlKM/viewform

### Submission Steps:

1. **Review your transactions first**:
   - Ensure transactions have only ONE signer (Phantom must sign first)
   - If multiple signers needed, use `signTransaction` (not `signAndSendTransaction`)
   - Simulate transactions with `sigVerify: false` before submission
   - Split large transactions or use Address Lookup Tables if needed

2. **Submit Domain Review Form**: https://docs.google.com/forms/d/1JgIxdmolgh_80xMfQKBKx9-QPC7LRdN6LHpFFW8BlKM/viewform

3. **Form Details**:
   - **Domain**: clearnetlabs.fun
   - **Description**: Privacy-first Solana token creation platform
   - **Why requesting review**: Legitimate dApp using official @solana/wallet-adapter-react
   - **GitHub**: https://github.com/asasdfgd/pepetor-miner
   - **Additional info**: Open source project with Terms/Privacy policy. Uses standard Solana transaction patterns.

**Note**: Phantom also uses Blowfish for security scanning (see Section 1).

---

## 3. CertiK Skynet (Security Monitoring)

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

- [ ] Submit to Blowfish Security for verification
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
| Blowfish Verification | 1-2 weeks |
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
