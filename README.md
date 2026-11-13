# UrbanRent

UrbanRent is a React/Vite frontend backed by a Laravel API and SQLite database.

## Run locally

Prerequisites: Node.js, PHP 8.3+, and Composer.

1. Install frontend dependencies from the repository root:

   ```sh
   npm install
   ```

2. Prepare the backend once:

   ```sh
   cd back-end/back-end
   composer install
   cp .env.example .env
   touch database/database.sqlite
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

   If `.env` already exists, keep it and skip `cp`. The default backend config uses SQLite.

3. Start Laravel in one terminal:

   ```sh
   cd back-end/back-end
   php artisan serve --host=127.0.0.1 --port=8000
   ```

4. Start Vite from the repository root in another terminal:

   ```sh
   npm run dev
   ```

   Open the URL printed by Vite (by default, `http://localhost:3000`). Vite proxies `/api` requests and uploaded profile photos to Laravel. To use a different local backend URL, set `VITE_BACKEND_URL` in the root `.env.local`.

## Listings, rent, and Stripe

New homeowner listings stay in **Awaiting admin approval** until an administrator approves them. Renters can submit applications for approved listings; after an application is approved, they can pay that month's rent by card or in person. In-person payments remain pending until the owner or an administrator confirms receipt.

Automated UrbanRent newsletter emails are sent after key property and application milestones so owners and renters receive a digest of new app features alongside the relevant property or listing details.

Card payments use Stripe Checkout and are collected by the UrbanRent platform; owner payouts are handled separately. Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `FRONTEND_URL` in `back-end/back-end/.env` before enabling live charges. Use Stripe test-mode keys while developing and forward Stripe's `checkout.session.completed` and `checkout.session.expired` events to `http://localhost:8000/api/stripe/webhook` (for example, with the Stripe CLI). A successful browser redirect alone does not mark a payment as paid; the signed webhook does.

Administrators can approve/reject new listings, review applications, manage bookings, suspend/reinstate or delete accounts, and download a monthly CSV of listings and rent-payment records from the profile's **Monthly Reports** tab.

For deployments, the frontend expects the API at `/api` on the same origin. Set `VITE_API_BASE_URL` to an absolute API URL when the API is hosted separately; configure that API to allow requests from the frontend origin.

## Checks

```sh
npm run lint
npm run build
```

Run backend tests from `back-end/back-end` with `php artisan test`.
