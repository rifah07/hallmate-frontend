import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGatewayUrl } from './billing.ts';

test('accepts SSLCommerz checkout pages', () => {
  assert.ok(isGatewayUrl('https://sandbox.sslcommerz.com/EasyCheckOut/abc'));
  assert.ok(isGatewayUrl('https://securepay.sslcommerz.com/gwprocess/v4/x'));
});

test('refuses look-alikes and other schemes', () => {
  for (const bad of ['http://sandbox.sslcommerz.com/x', 'https://sslcommerz.com.evil.example', 'https://evilsslcommerz.com', 'javascript:alert(1)', 'nonsense']) {
    assert.equal(isGatewayUrl(bad), false, bad);
  }
});
