import { describe, expect, it } from 'vitest';
import request from 'supertest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

describe('zk auth flow', () => {
  it('rejects nonce mismatch', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zk-auth-'));
    fs.writeFileSync(path.join(dir, 'verification_key.json'), '{}');
    const app = createApp({ artifacts: dir, verifyProof: () => true });

    const challenge = await request(app).post('/challenge').expect(200);
    const response = await request(app)
      .post('/login')
      .send({
        challengeId: challenge.body.challengeId,
        commitment: 'c',
        nullifier: 'n1',
        proof: { pi_a: [] },
        publicSignals: ['c', 'wrong-nonce', 'n1']
      });

    expect(response.status).toBe(401);
  });

  it('accepts valid proof once and blocks replay', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zk-auth-'));
    fs.writeFileSync(path.join(dir, 'verification_key.json'), '{}');
    const app = createApp({ artifacts: dir, verifyProof: () => true });

    const challenge = await request(app).post('/challenge').expect(200);

    const payload = {
      challengeId: challenge.body.challengeId,
      commitment: 'c',
      nullifier: 'n1',
      proof: { pi_a: [] },
      publicSignals: ['c', challenge.body.nonce, 'n1']
    };

    await request(app).post('/login').send(payload).expect(200);

    const challenge2 = await request(app).post('/challenge').expect(200);
    const replay = await request(app)
      .post('/login')
      .send({ ...payload, challengeId: challenge2.body.challengeId, publicSignals: ['c', challenge2.body.nonce, 'n1'] });

    expect(replay.status).toBe(409);
  });
});
