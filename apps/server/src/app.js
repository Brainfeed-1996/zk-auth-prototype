import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ChallengeStore } from './lib/challenge-store.js';
import { verifyProof as defaultVerifyProof } from './lib/zk-verifier.js';

export function createApp(options = {}) {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const artifacts = options.artifacts ?? path.join(process.cwd(), 'artifacts');
  const verificationKeyPath = path.join(artifacts, 'verification_key.json');
  const usedNullifiers = new Set();
  const challenges = options.challengeStore ?? new ChallengeStore();
  const verifyProof = options.verifyProof ?? ((params) => defaultVerifyProof(params));

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  app.post('/challenge', (_req, res) => {
    res.json(challenges.issue());
  });

  app.post('/login', (req, res) => {
    const { challengeId, commitment, nullifier, proof, publicSignals } = req.body || {};
    if (!challengeId || !commitment || !nullifier || !proof || !publicSignals) {
      return res.status(400).json({ error: 'missing fields' });
    }
    if (usedNullifiers.has(nullifier)) {
      return res.status(409).json({ error: 'replay detected (nullifier already used)' });
    }

    const challenge = challenges.consume(challengeId);
    if (!challenge) {
      return res.status(400).json({ error: 'unknown or expired challenge' });
    }

    if (!Array.isArray(publicSignals) || publicSignals.length < 3 || publicSignals[1] !== challenge.nonce) {
      return res.status(401).json({ error: 'public signal nonce mismatch' });
    }

    if (!fs.existsSync(verificationKeyPath)) {
      return res.status(500).json({ error: 'missing verification key; run: npm run zk:setup' });
    }

    const ok = verifyProof({ verificationKeyPath, proof, publicSignals, workdir: artifacts });
    if (!ok) {
      return res.status(401).json({ error: 'invalid proof' });
    }

    usedNullifiers.add(nullifier);
    return res.json({ token: randomUUID(), tokenType: 'Bearer' });
  });

  return app;
}
