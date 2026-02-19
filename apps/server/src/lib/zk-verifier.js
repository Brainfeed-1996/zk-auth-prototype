import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function verifyProof({ verificationKeyPath, proof, publicSignals, workdir }) {
  const tmpDir = fs.mkdtempSync(path.join(workdir, 'tmp-'));
  const vkTmp = path.join(tmpDir, 'vk.json');
  const proofTmp = path.join(tmpDir, 'proof.json');
  const pubTmp = path.join(tmpDir, 'public.json');

  fs.copyFileSync(verificationKeyPath, vkTmp);
  fs.writeFileSync(proofTmp, JSON.stringify(proof));
  fs.writeFileSync(pubTmp, JSON.stringify(publicSignals));

  try {
    const out = execFileSync('snarkjs', ['groth16', 'verify', vkTmp, pubTmp, proofTmp], { encoding: 'utf8' });
    return out.toLowerCase().includes('ok');
  } catch {
    return false;
  }
}
