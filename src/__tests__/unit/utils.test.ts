import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice, calcDiscountedPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('formats zero', () => {
    assert.equal(formatPrice(0), '฿0');
  });

  it('formats whole number', () => {
    assert.ok(formatPrice(59).startsWith('฿'));
    assert.ok(formatPrice(59).includes('59'));
  });

  it('formats large number with Thai locale separator', () => {
    const result = formatPrice(1000);
    assert.ok(result.startsWith('฿'));
    assert.ok(result.includes('1') && result.includes('000'));
  });

  it('formats negative number', () => {
    const result = formatPrice(-100);
    assert.ok(result.startsWith('฿'));
  });
});

describe('calcDiscountedPrice', () => {
  it('returns full price when discount is 0', () => {
    assert.equal(calcDiscountedPrice(100, 0), 100);
  });

  it('applies 20% discount correctly', () => {
    assert.equal(calcDiscountedPrice(100, 20), 80);
  });

  it('applies 15% discount correctly', () => {
    assert.equal(calcDiscountedPrice(100, 15), 85);
  });

  it('rounds result with Math.round', () => {
    // 99 * (1 - 20/100) = 79.2 → rounds to 79
    assert.equal(calcDiscountedPrice(99, 20), 79);
    // 149 * (1 - 15/100) = 126.65 → rounds to 127
    assert.equal(calcDiscountedPrice(149, 15), 127);
  });

  it('returns 0 on 100% discount', () => {
    assert.equal(calcDiscountedPrice(500, 100), 0);
  });

  it('handles product id=7: 390 price 30% discount = 273', () => {
    assert.equal(calcDiscountedPrice(390, 30), 273);
  });

  it('does not change price when product has no discount (id=3 price=59 disc=0)', () => {
    assert.equal(calcDiscountedPrice(59, 0), 59);
  });
});
