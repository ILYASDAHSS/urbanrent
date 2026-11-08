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

   Open the URL printed by Vite (by default, `http://localhost:3000`). Vite proxies `/api` requests to Laravel. To use a different local backend URL, set `VITE_BACKEND_URL` in the root `.env.local`.

For deployments, the frontend expects the API at `/api` on the same origin. Set `VITE_API_BASE_URL` to an absolute API URL when the API is hosted separately; configure that API to allow requests from the frontend origin.

## Checks

```sh
npm run lint
npm run build
```

Run backend tests from `back-end/back-end` with `php artisan test`.
