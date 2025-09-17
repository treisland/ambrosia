# Contributing

## Development Setup

1. Install pre-commit hooks:
   - pipx install pre-commit (or pip install pre-commit)
   - pre-commit install
2. Create your local environment file from the example:
   - cp .env.example .env
3. Create a feature branch from `main`.

## Commit and PR Guidelines

- Write descriptive commits; reference issues where relevant
- Do not commit secrets or credentials
- Ensure CI checks pass (secret scan, dependency review, CodeQL)
- Add tests for new functionality when applicable
- Link security-sensitive changes to a tracking issue and note the threat model

## Security

Please read `SECURITY.md` for vulnerability reporting and handling.

