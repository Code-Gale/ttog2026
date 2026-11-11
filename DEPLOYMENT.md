# TomTom of Gala — VPS deployment

Assumes Node.js 20+, npm, MongoDB, Nginx, and a process manager (PM2 recommended) are already installed on the VPS.

| Service | Bind address | Port |
| --- | --- | --- |
| Next.js frontend | `127.0.0.1` | **4075** |
| Express API | `127.0.0.1` | **4076** |

Nginx terminates HTTPS on `443` and proxies to those ports. Apps should not be exposed publicly except through Nginx.

Replace `your-domain.com` everywhere with your real domain.

---

## 1. App directory

```bash
sudo mkdir -p /var/www/ttog2026
sudo chown -R $USER:$USER /var/www/ttog2026
cd /var/www/ttog2026
# clone or upload the project here
```

---

## 2. Environment files

### Frontend — `.env.local` (project root)

```env
NEXT_PUBLIC_API_URL=https://ttog26.bcthq.com/api
```

`NEXT_PUBLIC_*` values are baked in at **build** time. Change this before `npm run build`, then rebuild if you change it later.

Use the **exact** live hostname (this project’s domain is `ttog26.bcthq.com`, not `ttog2026`).

### Backend — `server/.env`

```env
PORT=4076
NODE_ENV=production
CLIENT_ORIGIN=https://ttog26.bcthq.com
MONGODB_URI=mongodb://127.0.0.1:27017/tomtom-gala
PAYSTACK_SECRET_KEY=sk_live_or_test_...
PAYSTACK_PUBLIC_KEY=pk_live_or_test_...
JWT_SECRET=long_random_secret_at_least_32_chars
TICKET_SECRET=different_long_random_secret_at_least_32_chars
ADMIN_EMAIL=organiser@your-domain.com
ADMIN_PASSWORD=long_unique_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=youraddress@gmail.com
SMTP_PASS=your_google_app_password
EMAIL_FROM="TomTom of Gala <youraddress@gmail.com>"
PUBLIC_SITE_URL=https://ttog26.bcthq.com
```

Notes:

- `CLIENT_ORIGIN` and `PUBLIC_SITE_URL` must be the exact public site origin (scheme + host, no trailing slash).
- Use Paystack **test** keys until checkout works; switch to **live** only after that.
- Keep `server/uploads` writable by the API process (event gallery photos).

```bash
mkdir -p server/uploads
chmod 755 server/uploads
```

---

## 3. Install and build

From the project root:

```bash
cd /var/www/ttog2026
npm install
npm run build
npm --workspace server run build
# confirms API entry exists:
ls server/dist/index.js
```

That produces:

- Next.js production build in `.next`
- API JS in `server/dist`

---

## 4. Run with PM2

Create `ecosystem.config.cjs` in the project root (or use the commands below):

```js
module.exports = {
  apps: [
    {
      name: 'tomtom-web',
      cwd: '/var/www/ttog2026',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 4075',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'tomtom-api',
      cwd: '/var/www/ttog2026/server',
      script: 'dist/index.js',
      env: { NODE_ENV: 'production' },
    },
  ],
};
```

Build the API **before** starting PM2 (`server/dist/index.js` must exist).

Start and persist:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Useful commands:

```bash
pm2 status
pm2 logs tomtom-api
pm2 logs tomtom-web
pm2 restart tomtom-api tomtom-web
```

Quick local checks on the VPS:

```bash
curl -s http://127.0.0.1:4075/ | head
curl -s http://127.0.0.1:4076/api/health
```

---

## 5. Nginx

1. Copy the sample config:

```bash
sudo cp deploy/nginx.tomtom-of-gala.conf /etc/nginx/sites-available/tomtom-of-gala
sudo nano /etc/nginx/sites-available/tomtom-of-gala   # set your domain
sudo ln -sf /etc/nginx/sites-available/tomtom-of-gala /etc/nginx/sites-enabled/
sudo nginx -t
```

2. Issue TLS (example with Certbot):

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Or enable HTTPS blocks yourself if certificates already exist.

3. Reload:

```bash
sudo systemctl reload nginx
```

The sample config:

- Proxies `/` → Next.js on **4075**
- Proxies `/api/` → Express on **4076**
- Proxies `/uploads/` → Express on **4076** (gallery images)

---

## 6. Paystack

In the Paystack dashboard:

| Setting | Value |
| --- | --- |
| Webhook URL | `https://your-domain.com/api/payments/webhook` |
| Callback / return | Handled by the app via `PUBLIC_SITE_URL` (`/ticket/...`) |

Use HTTPS for both site and webhook.

---

## 7. Firewall

Allow public HTTP/HTTPS only. Keep **4075** and **4076** closed from the internet (Nginx talks to them on localhost).

```bash
# example if using ufw
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 8. Deploy updates

```bash
cd /var/www/ttog2026
git pull   # or upload new files
npm install
npm run build
npm --workspace server run build
pm2 restart tomtom-api tomtom-web
```

If you change `.env.local` / `NEXT_PUBLIC_API_URL`, rebuild the frontend before restarting `tomtom-web`.

If you change `server/.env`, restart `tomtom-api` only.

---

## 9. Smoke checklist

- [ ] `https://your-domain.com` loads the landing page  
- [ ] `https://your-domain.com/api/health` returns `{"status":"ok",...}`  
- [ ] `https://your-domain.com/admin` signs in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`  
- [ ] Registration reaches Paystack checkout  
- [ ] Payment return opens `/ticket/...` and issues a ticket  
- [ ] Paystack webhook delivers (check API logs)  
- [ ] Ticket email sends (fix SMTP app password if Gmail rejects login)  
- [ ] Admin photo upload appears on the public gallery  

---

## 10. Paths reference

| Path | Service |
| --- | --- |
| `/` | Next.js (`4075`) |
| `/admin` | Next.js organiser desk |
| `/ticket/:id` | Next.js ticket page |
| `/api/*` | Express API (`4076`) |
| `/uploads/*` | Express static uploads (`4076`) |
