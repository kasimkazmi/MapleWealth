# 10. Security and Privacy


Project: MapleWealth, Personal Finance Dashboard
Owner: Master
Version: 1.0
Primary reference: Personal Financial Master Plan (Canada)
Core rule: Emergency Fund -> TFSA -> FHSA -> RRSP. Do not recommend trading, market timing, options, forex, meme stocks, or speculation.


## Data Sensitivity
This app stores financial information. Treat it as high sensitivity.

## Requirements
- HTTPS only
- Strong auth
- MFA support
- Passwordless/passkey support later
- Row-level tenant isolation for SaaS mode
- Audit logs
- Encrypted secrets
- Backups with restore testing
- No raw bank credentials stored
- No Plaid/open banking credentials in database unless tokenized securely

## Logging Rules
Never log:
- Full account numbers
- SIN
- Raw bank statement files
- Full transaction import payloads in production logs

## Compliance Direction
For personal use, keep simple. For SaaS, get legal review for privacy policy, terms, financial disclaimers, and Canadian data handling.
