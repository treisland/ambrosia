# Security Policy

## Reporting a Vulnerability

- Email: security@treisland.dev with subject "Security: ambrosia"
- Include steps to reproduce, impact, and any logs or PoCs
- We acknowledge within 72 hours and target triage within 7 days
- Please avoid public issues until a fix is available

## Responsible Disclosure

We follow coordinated disclosure. We will credit researchers who report vulnerabilities responsibly.

## Project Security Practices

- Do not commit secrets. Use `.env` locally and commit only `.env.example`
- Enable 2FA on GitHub accounts
- Keep dependencies up to date (Dependabot is enabled)
- CI runs secret scanning and dependency review on PRs

## Data Handling

This application may handle sensitive health-related data in deployments. Use TLS in transit, encrypt data at rest, enforce strong auth and role-based access, minimize data collection, and comply with applicable regulations (e.g., HIPAA) where required.

