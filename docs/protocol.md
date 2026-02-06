# Protocol sketch (prototype)

## Registration

1. Client chooses a secret `s`.
2. Client computes a public commitment `C = H(s)`.
3. Server stores `C` (user identity) and associates it with an account.

## Login (challenge-response)

1. Client requests a nonce `n` from the server.
2. Client creates a ZK proof for the statement:

- public inputs: `C`, `n`
- private input: `s`
- constraint: `H(s) == C` and nonce `n` is included in the circuit so it is bound to the proof

3. Client sends `{C, n, proof}`.
4. Server verifies the proof; if valid and nonce unused, issues a session token.

## Notes

- This is a prototype: in real systems you must implement:
  - nonce lifecycle & anti-replay
  - rate limiting / account lockout
  - secure storage of commitments and keys
  - circuit audits and soundness assumptions
