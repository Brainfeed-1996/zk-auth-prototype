# zk-auth-prototype

A pragmatic **zero-knowledge authentication** prototype: prove you know a secret (or membership credential) **without revealing it**, using a small Circom circuit + SnarkJS verification.

> Author: Olivier Robert

## What this demonstrates

- A ZK proof used as a **login credential**
- A server that verifies proofs and issues a session token
- A client that generates proofs locally

This is meant as a learning prototype — not production crypto.

## Threat model (prototype)

- The server learns only the public statement (e.g., commitment / identity hash).
- The secret stays on the client.
- Replay protection is handled with a **nonce/challenge** included in the statement.

## Tech

- Circom (circuit)
- SnarkJS (Groth16)
- Node.js (Express) demo server/client

## Quick start (high level)

### Prerequisites

- Node.js 20+
- `circom` installed
- `snarkjs` installed (`npm i -g snarkjs`)

### Install

```bash
npm install
```

### 1) Build circuit + keys (dev)

```bash
npm run zk:setup
```

### 2) Run server

```bash
npm run server
```

### 3) Run client (generates proof + calls login)

```bash
npm run client
```

## Repository layout

```text
.
├─ circuits/
│  └─ auth.circom
├─ apps/
│  ├─ server/
│  └─ client/
├─ scripts/
│  ├─ zk-setup.mjs
│  └─ zk-prove.mjs
└─ docs/
   └─ protocol.md
```

## Notes

- The setup here is **developer-focused**. For production, you would need a well-reviewed protocol, audited circuits, careful key management, and robust anti-replay.

## License

MIT — see [`LICENSE`](LICENSE).
