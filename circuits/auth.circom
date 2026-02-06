pragma circom 2.1.7;

include "circomlib/circuits/poseidon.circom";

// Proves knowledge of secret s such that commitment = Poseidon(s)
// and binds the proof to a server-provided nonce n by producing
// a public nullifier = Poseidon(s, n).
//
// Public inputs:
// - commitment
// - nonce
// - nullifier
// Private input:
// - secret

template ZkAuth() {
    signal input commitment;
    signal input nonce;
    signal input nullifier;

    signal input secret; // private

    component Hc = Poseidon(1);
    Hc.inputs[0] <== secret;
    commitment === Hc.out;

    component Hn = Poseidon(2);
    Hn.inputs[0] <== secret;
    Hn.inputs[1] <== nonce;
    nullifier === Hn.out;
}

component main = ZkAuth();
