import assert from 'node:assert/strict';
import { test } from 'node:test';
import { safeNext } from './safe-next.ts';

test('keeps same-site paths', () => {
  assert.equal(safeNext('/dashboard/password'), '/dashboard/password');
});

test('refuses anything that could leave the site', () => {
  for (const bad of ['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '', undefined, ['/x']]) {
    assert.equal(safeNext(bad), '/dashboard');
  }
});
