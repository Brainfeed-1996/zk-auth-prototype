# zk-auth-prototype

Zero-knowledge authentication prototype showing challenge-based login with replay protection.

## Complexity tier
- **Before:** Tier 1 (single-file prototype, weak nonce binding, no automated tests)
- **After:** Tier 2 (modular server architecture, nonce-bound verification path, integration tests, CI)

## Key improvements
- Refactored server into composable modules (`createApp`, `ChallengeStore`, `zk-verifier`)
- Added challenge TTL + consume semantics
- Enforced nonce binding between issued challenge and proof public signals
- Added anti-replay nullifier checks with explicit tests
- Added test suite using `vitest` + `supertest`

## Run
```bash
npm install
npm run test
npm run server
```

> This project remains a learning prototype, not production-grade cryptography.
