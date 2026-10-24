import assert from 'node:assert/strict';
import { test } from 'node:test';
import { toRequestBody } from './request-body.ts';

test('leave nests the emergency contact and drops empty optionals', () => {
  const body = toRequestBody('LEAVE', {
    leaveType: 'OVERNIGHT',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    destination: 'Home, Cumilla',
    reason: 'Family wedding',
    contactName: 'Rokeya',
    contactRelation: 'Mother',
    contactPhone: '01712345678',
  });
  assert.deepEqual(body.data.emergencyContact, { name: 'Rokeya', relation: 'Mother', phone: '01712345678' });
  assert.equal('contactName' in body.data, false);
});

test('leave must end after it starts, as the API requires', () => {
  assert.throws(() => toRequestBody('LEAVE', { startDate: '2026-11-05', endDate: '2026-11-01' }), /end after/);
  assert.throws(() => toRequestBody('LEAVE', { startDate: '2026-11-05', endDate: '2026-11-05' }), /end after/);
});

test('optional empty fields are not sent', () => {
  assert.deepEqual(toRequestBody('COMPLAINT', { title: 'Broken fan', location: '' }).data, { title: 'Broken fan' });
});
