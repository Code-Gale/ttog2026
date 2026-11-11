import test from 'node:test';
import assert from 'node:assert/strict';

process.env.PORT = '4000';
process.env.NODE_ENV = 'test';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/tomtom-gala-test';
process.env.PAYSTACK_SECRET_KEY = 'sk_test_not_a_real_secret';
process.env.PAYSTACK_PUBLIC_KEY = 'pk_test_not_a_real_secret';
process.env.JWT_SECRET = 'a-test-only-jwt-secret-that-is-long-enough-123';
process.env.TICKET_SECRET = 'a-different-test-only-ticket-secret-long-enough';
process.env.ADMIN_EMAIL = 'admin@example.com';
process.env.ADMIN_PASSWORD = 'a-test-only-password-long-enough';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'not-a-real-password';
process.env.EMAIL_FROM = 'TomTom Gala <test@example.com>';
process.env.PUBLIC_SITE_URL = 'http://localhost:3000';

const [{ ticketPayload, verifyTicketPayload }, { registrationInput }] = await Promise.all([
  import('./ticket.js'),
  import('../routes/public.js'),
]);

test('signed ticket QR payload round-trips and has an event ticket ID', () => {
  const ticketId = 'TTG-2026-A1B2C3D4E5F60718';
  const payload = ticketPayload(ticketId);
  assert.equal(verifyTicketPayload(payload), ticketId);
  assert.match(ticketId, /^TTG-2026-[A-F0-9]{16}$/);
});

test('tampered, malformed, and extra-part QR payloads are rejected', () => {
  const payload = ticketPayload('TTG-2026-A1B2C3D4E5F60718');
  assert.equal(verifyTicketPayload(payload.replace('A1B2', 'B1B2')), null);
  assert.equal(verifyTicketPayload(`${payload}.extra`), null);
  assert.equal(verifyTicketPayload('not-a-ticket'), null);
});

test('valid registration accepts the event price basis and matching dress code', () => {
  const parsed = registrationInput.parse({ fullName: 'Ada Example', email: 'ada@example.com', phone: '+234 800 123 4567', gender: 'female', tickets: 2, dressCode: 'baby-pink' });
  assert.equal(parsed.tickets, 2);
});

test('registration rejects an invalid amount of tickets and gender-to-dress mismatch', () => {
  const base = { fullName: 'Ada Example', email: 'ada@example.com', phone: '+234 800 123 4567', gender: 'female', tickets: 2, dressCode: 'baby-pink' };
  assert.equal(registrationInput.safeParse({ ...base, tickets: 11 }).success, false);
  assert.equal(registrationInput.safeParse({ ...base, dressCode: 'burgundy' }).success, false);
});
