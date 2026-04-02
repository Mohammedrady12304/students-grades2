# Student grades portal

Students sign in with a username and password (from your roster) and see **only their grade**. Instructors use a separate **admin password** to upload an Excel file with usernames, passwords, and grades, or to delete all records and upload a new sheet.

## Excel format

Use one sheet with a **header row** and these columns (names can vary slightly; the app looks for matching headers):

| Username | Password | Grade |
|----------|----------|-------|
| alice    | secret1  | 92    |
| bob      | secret2  | 88    |

Supported header aliases include: **Username** / User / Login, **Password** / Pass, **Grade** / Mark / Score.

Uploading a new file **replaces** all existing student rows. Passwords are stored **hashed** (bcrypt); the admin password is separate and set only in environment variables.

## Why a database instead of “the Excel file on disk”?

On **Vercel**, serverless instances do not keep uploaded files on disk between requests. This app **parses** the Excel file when you upload it and stores rows in **PostgreSQL** (e.g. Neon), which is the usual approach for free/cheap hosting.

## Local setup

1. **Node.js 20+** and **npm**.

2. Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — PostgreSQL connection string (see below).
   - `AUTH_SECRET` — long random string (32+ characters).
   - `ADMIN_PASSWORD` — password for `/admin`.

3. Create the database and apply migrations:

   ```bash
   npm install
   npx prisma migrate deploy
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) (students) and [http://localhost:3000/admin](http://localhost:3000/admin) (admin).

### Getting a free PostgreSQL URL (Neon)

1. Sign up at [https://neon.tech](https://neon.tech).
2. Create a project and database.
3. Copy the connection string (include `?sslmode=require` if Neon shows it).
4. Paste it as `DATABASE_URL` in `.env`.

(Supabase or other Postgres providers work too, as long as `DATABASE_URL` is valid.)

## Deploy on Vercel (free tier)

1. Push this project to **GitHub** (or GitLab / Bitbucket).

2. Go to [https://vercel.com](https://vercel.com) and sign in. **Add New → Project** and import the repository.

3. **Environment variables** (Project → Settings → Environment Variables), add for **Production** (and Preview if you want):

   | Name | Value |
   |------|--------|
   | `DATABASE_URL` | Same Postgres URL as Neon (or your provider). |
   | `AUTH_SECRET` | Long random string (32+ characters). |
   | `ADMIN_PASSWORD` | Strong password only you know. |

4. **Build**: This repo includes `vercel.json` so the build runs:

   `prisma generate && prisma migrate deploy && next build`

   Ensure `DATABASE_URL` is set in Vercel **before** the first deploy so migrations can run.

5. Click **Deploy**. After deployment, open the production URL, go to `/admin`, sign in, and upload your Excel file.

### If the build fails on migrations

- Confirm `DATABASE_URL` is correct and the database accepts SSL (`sslmode=require` for Neon).
- From your machine (with `DATABASE_URL` pointing at production), you can run:

  ```bash
  npx prisma migrate deploy
  ```

  Then redeploy on Vercel.

### Custom domain (optional)

In Vercel: Project → **Settings** → **Domains** → add your domain and follow DNS instructions.

## Security notes

- Keep `ADMIN_PASSWORD` and `AUTH_SECRET` private; never commit `.env`.
- Use HTTPS in production (Vercel provides it).
- Student passwords in Excel are hashed at import; only matching plaintext works at login.
