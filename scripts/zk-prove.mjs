import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifacts = path.join(root, 'artifacts');

function sh(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

// Input values are intentionally simple for a prototype.
// In a real system you would derive secret/commitment with proper encoding.

const input = {
  // public
  commitment: "0",
  nonce: "0",
  nullifier: "0",
  // private
  secret: "0"
};

const inputPath = path.join(artifacts, 'input.json');
fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

const wasm = path.join(artifacts, 'auth_js', 'auth.wasm');
const zkey = path.join(artifacts, 'auth_final.zkey');

sh(`snarkjs groth16 fullprove ${inputPath} ${wasm} ${zkey} ${artifacts}/proof.json ${artifacts}/public.json`);

console.log('\nProof generated: artifacts/proof.json');
console.log('Public signals: artifacts/public.json');
