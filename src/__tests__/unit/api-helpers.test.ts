import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmail, hashPassword, verifyPassword } from '@/lib/api-helpers';

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    assert.equal(isValidEmail('user@example.com'), true);
  });

  it('accepts email with subdomain', () => {
    assert.equal(isValidEmail('user@mail.example.co.th'), true);
  });

  it('rejects missing @', () => {
    assert.equal(isValidEmail('userexample.com'), false);
  });

  it('rejects missing domain', () => {
    assert.equal(isValidEmail('user@'), false);
  });

  it('rejects missing local part', () => {
    assert.equal(isValidEmail('@example.com'), false);
  });

  it('rejects plain string', () => {
    assert.equal(isValidEmail('notanemail'), false);
  });

  it('rejects empty string', () => {
    assert.equal(isValidEmail(''), false);
  });

  it('rejects email with spaces', () => {
    assert.equal(isValidEmail('user name@example.com'), false);
  });
});

describe('hashPassword / verifyPassword', () => {
  it('hashPassword returns salt:hash format', () => {
    const hash = hashPassword('secret123');
    assert.ok(hash.includes(':'), 'Should contain colon separator');
    const parts = hash.split(':');
    assert.equal(parts.length, 2);
    assert.ok(parts[0].length > 0, 'Salt should be non-empty');
    assert.ok(parts[1].length > 0, 'Hash should be non-empty');
  });

  it('hashPassword produces different hashes for same password (random salt)', () => {
    const h1 = hashPassword('password');
    const h2 = hashPassword('password');
    assert.notEqual(h1, h2);
  });

  it('verifyPassword returns true for correct password', () => {
    const stored = hashPassword('correcthorse');
    assert.equal(verifyPassword('correcthorse', stored), true);
  });

  it('verifyPassword returns false for wrong password', () => {
    const stored = hashPassword('correcthorse');
    assert.equal(verifyPassword('wrongpassword', stored), false);
  });

  it('verifyPassword returns false for malformed stored hash', () => {
    assert.equal(verifyPassword('password', 'invalidstoredformat'), false);
  });

  it('verifyPassword returns false for empty stored hash', () => {
    assert.equal(verifyPassword('password', ''), false);
  });
});
