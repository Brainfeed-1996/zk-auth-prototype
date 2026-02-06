import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const artifacts = path.join(root, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });

// This is a *development* setup script.
// For real deployments, you must use a proper ceremony and audited parameters.

function sh(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

const circuit = 'circuits/auth.circom';

// 1) Compile circuit
sh(`circom ${circuit} --r1cs --wasm --sym -o ${artifacts}`);

// 2) Generate a small dev Powers of Tau
const ptau = path.join(artifacts, 'pot12_final.ptau');
if (!fs.existsSync(ptau)) {
  sh(`snarkjs powersoftau new bn128 12 ${artifacts}/pot12_0000.ptau -v`);
  sh(`snarkjs powersoftau contribute ${artifacts}/pot12_0000.ptau ${artifacts}/pot12_0001.ptau --name="dev" -v -e="random"`);
  sh(`snarkjs powersoftau prepare phase2 ${artifacts}/pot12_0001.ptau ${ptau} -v`);
}

// 3) Groth16 setup
sh(`snarkjs groth16 setup ${artifacts}/auth.r1cs ${ptau} ${artifacts}/auth_0000.zkey`);
sh(`snarkjs zkey contribute ${artifacts}/auth_0000.zkey ${artifacts}/auth_final.zkey --name="dev" -v -e="random"`);

// 4) Export verification key
sh(`snarkjs zkey export verificationkey ${artifacts}/auth_final.zkey ${artifacts}/verification_key.json`);

console.log('\nDone. Artifacts written to ./artifacts');
