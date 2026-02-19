import { randomUUID } from 'node:crypto';

export class ChallengeStore {
  constructor({ ttlMs = 120000, now = () => Date.now() } = {}) {
    this.ttlMs = ttlMs;
    this.now = now;
    this.store = new Map();
  }

  issue() {
    const challengeId = randomUUID();
    const nonce = randomUUID();
    this.store.set(challengeId, { nonce, expiresAt: this.now() + this.ttlMs });
    return { challengeId, nonce };
  }

  consume(challengeId) {
    const record = this.store.get(challengeId);
    if (!record) return null;
    this.store.delete(challengeId);
    if (record.expiresAt < this.now()) return null;
    return record;
  }
}
