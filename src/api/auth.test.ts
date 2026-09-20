import { describe, it, expect } from 'vitest';
import { pinToPassword, toSupabaseEmail } from './auth';

describe('pinToPassword', () => {
  it('encodes a short PIN deterministically to satisfy the 6-char minimum', () => {
    expect(pinToPassword('1234')).toBe('fn-bcde');
  });

  it('keeps 6-digit PINs fully encoded after the prefix', () => {
    expect(pinToPassword('654321')).toBe('fn-gfedcb');
  });

  it('strips non-digit input before mapping', () => {
    expect(pinToPassword('12 34-56')).toBe('fn-bcdefg');
  });

  it('is deterministic — the same PIN always maps to the same password', () => {
    expect(pinToPassword('999')).toBe(pinToPassword('999'));
  });

  it('is injective — different PINs never collide (padding would)', () => {
    expect(pinToPassword('1234')).not.toBe(pinToPassword('123400'));
    expect(pinToPassword('12345')).not.toBe(pinToPassword('123450'));
  });

  it('never returns the raw PIN alone', () => {
    expect(pinToPassword('123456')).not.toBe('123456');
    expect(pinToPassword('123456').length).toBeGreaterThanOrEqual(6);
  });
});

describe('toSupabaseEmail', () => {
  it('maps a mobile number to a synthetic email on the app domain', () => {
    expect(toSupabaseEmail('9876543210')).toBe('9876543210@users.folynote.app');
  });

  it('strips formatting characters from the mobile number', () => {
    expect(toSupabaseEmail('+91 98765 43210')).toBe('919876543210@users.folynote.app');
  });
});
