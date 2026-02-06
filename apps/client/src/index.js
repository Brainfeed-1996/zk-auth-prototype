import fetch from 'node-fetch';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const server = process.env.SERVER_URL || 'http://localhost:3000';
const artifacts = path.join(process.cwd(), 'artifacts');

function sh(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

async function main() {
  console.log('Requesting challenge...');
  const ch = await fetch(`${server}/challenge`, { method: 'POST' }).then(r => r.json());
  console.log(ch);

  // Prototype shortcut:
  // - We do not map UUID nonce into a field element here.
  // - Instead, run zk-prove with placeholder values.
  // TODO: encode nonce to field element and compute matching public signals.

  sh('npm run zk:prove');

  const proof = JSON.parse(fs.readFileSync(path.join(artifacts, 'proof.json'), 'utf8'));
  const publicSignals = JSON.parse(fs.readFileSync(path.join(artifacts, 'public.json'), 'utf8'));

  // In this toy circuit, public signals are [commitment, nonce, nullifier]
  const [commitment, nonce, nullifier] = publicSignals;

  console.log('Submitting login...');
  const resp = await fetch(`${server}/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      challengeId: ch.challengeId,
      commitment,
      nullifier,
      proof,
      publicSignals
    })
  }).then(r => r.json());

  console.log(resp);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
