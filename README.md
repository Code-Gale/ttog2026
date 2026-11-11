# TomTom of Gala — The Royal Affairs

A premium event registration and ticketing application for Sunrise Zonal Teens Church. The application includes a responsive gala landing page, Paystack-hosted checkout, verified digital tickets with signed QR codes, downloadable PNG/PDF invitations, email confirmation, and a protected event-organiser dashboard.

## Requirements

- Node.js 20 or newer and npm
- MongoDB 6 or newer, local or hosted
- Paystack test/live keys
- A Gmail account with 2-step verification and a Gmail app password

## Quick start

1. Copy `.env.example` to `.env.local` in the project root.
2. Copy `server/.env.example` to `server/.env`.
3. Fill in the MongoDB URI, Paystack credentials, two independent secrets, admin credentials, and Gmail SMTP settings described below.
4. Install dependencies with `npm install`.
5. Start the web application and API with `npm run dev`.
6. Open `http://localhost:3000`. The organiser desk is at `/admin`.

The browser uses `NEXT_PUBLIC_API_URL` to contact the Express API. It defaults to `http://localhost:4000/api`. For a deployed environment, set it to your HTTPS API URL and set `CLIENT_ORIGIN` and `PUBLIC_SITE_URL` in the server environment to the public site URL.

## Environment setup

The root `.env.local` needs:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public Express API base URL |

The server `.env` needs:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `PAYSTACK_SECRET_KEY` | Secret API key for server-side payment initialization and verification |
| `PAYSTACK_PUBLIC_KEY` | Public key from the same Paystack account as the secret key |
| `JWT_SECRET` | Random, private secret of at least 32 characters for admin sessions |
| `TICKET_SECRET` | A separate random, private secret of at least 32 characters for signed QR codes |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Initial organiser sign-in credentials |
| `SMTP_USER` / `SMTP_PASS` | Gmail address and Gmail app password (not the normal account password) |
| `EMAIL_FROM` | Friendly sender name and Gmail address |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Gmail SMTP server configuration |
| `CLIENT_ORIGIN` | Exact public website origin allowed by CORS |
| `PUBLIC_SITE_URL` | Public HTTPS site address used for Paystack return URLs and ticket links in email |

Use Paystack test keys until checkout has been tested in the intended deployment. Keep `.env.local` and `server/.env` private; they are ignored by Git. Generate independent random values for `JWT_SECRET` and `TICKET_SECRET`. The example values are placeholders and must be replaced.

## Payment and ticket flow

The server validates registration data, derives the amount from the fixed ₦3,000 ticket price, creates a pending MongoDB record, and initializes a Paystack-hosted checkout. The success page calls Paystack's server verification endpoint and checks the transaction status, reference, currency, and exact amount before issuing a ticket. Paystack webhooks are HMAC verified and use the same idempotent settlement path. The QR payload contains the unique ticket ID and an HMAC signature. Admin check-in validates that signature and confirms payment before marking attendance. A ticket cannot be checked in twice.

## Organiser dashboard

Sign in at `/admin` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the server environment. The dashboard includes payment and ticket metrics, attendee search, paid/pending/failed filters, UTF-8 CSV export, QR or code check-in, and event photo management. Uploaded JPG, PNG, and WebP photos are limited to 8 MB and are displayed in the public gallery. For a production deployment, persist `server/uploads` on durable storage or replace it with an object-storage adapter.

## Useful commands

```bash
npm run dev          # Next.js and Express in development
npm run build        # Build the Next.js application
npm --workspace server run build
npm test             # Focused payment-ticket input and QR-signature tests
```

## Deployment notes

- Serve both applications over HTTPS and use Paystack live credentials only after checkout has been verified in production configuration.
- Configure the Paystack webhook URL as `https://your-api.example/api/payments/webhook`.
- Restrict dashboard access to trusted organisers, use a strong admin password, and rotate credentials when staff change.
- Configure MongoDB backups and durable storage for uploads.
- Email delivery is attempted after successful payment. SMTP delivery failures are logged server-side; viewing the ticket again retries the email while payment and the on-screen ticket remain available.
