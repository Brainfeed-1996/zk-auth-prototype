import express from 'express';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(express.json({ limit: '1mb' }));

const artifacts = path.join(process.cwd(), 'artifacts');
const vkPath = path.join(artifacts, 'verification_key.json');

const usedNullifiers = new Set();
const challenges = new Map(); // challengeId -> nonce

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.post('/challenge', (_req, res) => {
  // Prototype: nonce is a UUID string. In production you must encode to field element.
  const challengeId = uuidv4();
  const nonce = uuidv4();
  challenges.set(challengeId, nonce);
  res.json({ challengeId, nonce });
});

app.post('/login', (req, res) => {
  const { challengeId, commitment, nullifier, proof, publicSignals } = req.body || {};

  if (!challengeId || !commitment || !nullifier || !proof || !publicSignals) {
    return res.status(400).json({ error: 'missing fields' });
  }
  if (!challenges.has(challengeId)) {
    return res.status(400).json({ error: 'unknown challenge' });
  }
  if (usedNullifiers.has(nullifier)) {
    return res.status(409).json({ error: 'replay detected (nullifier already used)' });
  }
  if (!fs.existsSync(vkPath)) {
    return res.status(500).json({ error: 'missing verification key; run: npm run zk:setup' });
  }

  // Verify by invoking snarkjs (keeps the prototype dependency-light).
  const tmpDir = fs.mkdtempSync(path.join(artifacts, 'tmp-'));
  const vkTmp = path.join(tmpDir, 'vk.json');
  const proofTmp = path.join(tmpDir, 'proof.json');
  const pubTmp = path.join(tmpDir, 'public.json');

  fs.copyFileSync(vkPath, vkTmp);
  fs.writeFileSync(proofTmp, JSON.stringify(proof));
  fs.writeFileSync(pubTmp, JSON.stringify(publicSignals));

  let ok = false;
  try {
    const out = execFileSync('snarkjs', ['groth16', 'verify', vkTmp, pubTmp, proofTmp], { encoding: 'utf8' });
    ok = out.toLowerCase().includes('ok');
  } catch (e) {
    ok = false;
  }

  if (!ok) return res.status(401).json({ error: 'invalid proof' });

  usedNullifiers.add(nullifier);
  challenges.delete(challengeId);

  // Prototype token. Replace with real session/JWT handling.
  res.json({ token: uuidv4() });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`zk-auth server listening on http://localhost:${port}`));
