# Deploying the backend to Vercel

This guide explains how to deploy the existing Express backend to Vercel and configure the MongoDB Atlas connection string.

## Key notes

- This backend has a Socket.IO implementation that requires a long-running server and is not fully supported in Vercel Serverless Functions; expect real-time features to not work on Vercel.
- For Socket.IO and WebSocket support, use a platform that supports persistent Node servers (Render, Railway, Fly, or a separate hosted socket service).

## How the server is built for Vercel

- A serverless handler is added in `api/index.js` that exports an Express app as a Vercel function and ensures the MongoDB connection is initialized.
- `vercel.json` routes all requests to `/api/index.js` so your API paths (e.g. `/api/users`) map correctly.

## Environment variables

Set the following variables in your Vercel project settings (Project → Settings → Environment Variables):

- `MONGODB_URI` — your MongoDB Atlas connection string (example: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/wellnexus?retryWrites=true&w=majority`).
- `JWT_SECRET` — application JWT secret.
- `CLIENT_URL` — allowed CORS origin (e.g. https://your-frontend.vercel.app)
- Other variables (optional): `PROVIDER_API_KEY`, `MODEL`, `STRIPE_*`, etc.

Important tips:

- If you're using MongoDB Atlas with IP access list enabled, add `0.0.0.0/0` (during development) or add Vercel's static IPs (if available) to the IP Access List for the cluster — See Atlas docs for recommended approach.
- Make sure you never commit credentials to the repo; keep them only inside Vercel environment variables.

## Deploy steps

1. Ensure your repo is connected to Vercel (create a new Project and import the repo; if monorepo, choose `backendSE` as the project root).
2. Add the environment variables in Vercel Dashboard.
3. Vercel will use `vercel.json` build config and route traffic to `/api/index.js`.
4. Trigger a deployment from Vercel or push a commit to your Git branch.

---

## Deploying to Railway (recommended for backend with sockets)

If you deploy the backend to Railway (or another host that supports long-running Node servers), you should:

1. Create a new Railway project and link to your GitHub repo. Choose the `backendSE` directory as the project root if using a monorepo.
2. Configure Environment Variables within Railway:

- `MONGODB_URI` (Atlas connection string)
- `JWT_SECRET`
- `CLIENT_URL`
- Other optional keys (Stripe keys, API keys)

3. Railway will set `PORT` automatically. Make sure your project uses the `start` script or the command `node src/app.js`.

- Railway builds with `npm install` by default. Ensure `npm start` runs `node src/app.js` (check `package.json`).

4. Deploy and open the application URL Railway returns.

### Why you saw `Cannot GET /`

- `Cannot GET /` is the Express default response when the server is running but there is no route for `/`.
- The server is an API that exposes routes under `/api/*` (e.g., `/api/health`). If you want the root to return info, we've added a root route that returns JSON with a short message.
- If you expected an HTML site (frontend), ensure the frontend is deployed separately (e.g., to Vercel) because the backend only serves API endpoints by default.

### Confirm port & start command

- If you still see `Cannot GET /` with a 404 from the server, check the Railway logs to confirm the server started and the `PORT` is bound. Look for the log: `Server listening on port <port>` and `MongoDB connected -> atlas`.

### Railway logs & common failure reasons

- Example logs to look for:
  - `Server listening on port 5000` — indicates server started
  - `MongoDB connected -> atlas` — DB connected
  - `MONGODB_URI not set in environment` — DB not configured
  - `MongoServerError` — incorrect URI/credentials
- Use the Railway Dashboard logs to look at your app: open the project → Deployments → open the latest entry → view logs.

### Test the Railway deployment

From your local machine, test the API root and health endpoints (replace the URL with your Railway URL):

```powershell
curl -i https://<your-railway-project>.up.railway.app/
curl -i https://<your-railway-project>.up.railway.app/api/health
```

If `curl` returns the `Cannot GET /`, make sure your `src/app.js` includes the root route we added. If not, update the project and redeploy.

### Quick fix checklist if you see `Cannot GET /` on Railway:

- Confirm Railway `start` command uses `node src/app.js` or `npm start`.
- Ensure `MONGODB_URI` is set in Railway env vars.
- Confirm the backend is not behind a firewall or blocked by Atlas IP restrictions.
- Confirm you're hitting the Railway project URL directly (not the frontend URL) and using the right route (`/api/health` or `/`).
## Local dev with Vercel-style handler

For local testing, you can still run the dev server:

```powershell
cd backendSE
npm install
npm run dev
```

Or run `node api/index.js` — this file will start a local HTTP server to mimic the serverless handler.

### Local testing of the full server (including sockets)

If you want to run the full backend locally (Socket.IO enabled), run:

```powershell
cd backendSE
npm install
npm run dev
```

Or start the server directly and pass `MONGODB_URI` as an environment variable in PowerShell:

```powershell
$env:MONGODB_URI = 'mongodb+srv://<user>:<password>@cluster0.mongodb.net/wellnexus?retryWrites=true&w=majority'
npm start
```

Then test:

```powershell
curl -i http://localhost:5000/
curl -i http://localhost:5000/api/health
```

### Railway CLI (optional)

Railway CLI can be used to deploy and inspect logs from your local machine:

```powershell
railway login
railway link # link to existing project
railway up   # deploy
railway logs  # show deployment logs
```
## Troubleshooting

- If you get `MONGODB_URI not set in environment`, make sure the `MONGODB_URI` is set in Vercel env vars. Do not rely on `.env` on Vercel.
- Socket.IO will not work on Vercel serverless functions: consider a different host for the real-time server.

### Check runtime logs & failed connection details

- If your deployment succeeded but endpoints respond with 500 or `Internal Server Error`, open the deployment on the Vercel dashboard and check the **Function logs** (or use the CLI `vercel logs <deployment-url>`).
- Look for log lines produced by `api/index.js` (we added logging for handler start and DB status). Typical lines:
  - `[api] handler start: GET /api/health NODE_ENV=production`
  - `[api] dbConnected= true|false`
- Common failures:
  - **Missing `MONGODB_URI`**: `Error: MONGODB_URI not set in environment` — add the env var and redeploy
  - **MongoDB connection refused**: Atlas IP access list blocked access — add appropriate network access or use private endpoint
  - **Auth failure**: `MongoServerError: authentication failed` — verify username/password and connection string

### Check your project root in Vercel

- If the project fails to route to your backend but the build succeeds, confirm your Vercel project uses `backendSE` as the Root Directory (unless you created a root-level backend project).
- If you accidentally created a project pointing to repo root and the frontend is at repo root, the backend vercel.json won't be used and deployments will build the other project.

### Using the Vercel CLI to see logs

Use these commands from your local machine after installing `vercel` CLI:

```powershell
# show recent logs for a deployment (substitute the project url)
vercel logs <your-project-name>.vercel.app --since 1h

# show function logs (if you have multiple builds) — replace `<deployment-id>` from the UI
vercel logs <deployment-id> --since 1h
```

### If DB never connects on serverless

- Vercel serverless cold starts sometimes collide with DB open/close behavior; our handler caches connections. If you keep seeing connection timeouts, consider using a longer connection pool or host backend on a persistent server.

## Using the Vercel CLI (optional)

You can also set environment variables and deploy using the Vercel CLI:

```powershell
# login
vercel login

# set env value for production
vercel env add MONGODB_URI production

# set env value for preview
vercel env add MONGODB_URI preview

# deploy
vercel --prod --confirm
```

## Validation

- Open `https://<your-backend-project>.vercel.app/api/health` and expect a JSON response `{ ok: true }`.
- If you see `MONGODB_URI not set in environment` or `MongoDB connection error`, confirm your Atlas URI and environment variable names.
<<<<<<< HEAD

### Frontend <-> Backend connection (Vercel frontend + Railway backend)

- If your frontend is hosted on Vercel and backend is on Railway, update the frontend to use the Railway backend URL by setting a Vite env var: `VITE_API_BASE`.
  - In the Vercel project for the frontend, set `VITE_API_BASE` to your Railway app URL value, e.g., `https://<your-railway>.up.railway.app` (without trailing slash).
  - In local development, you can keep `BASE=/api` and use vite proxy to proxy to the local backend.

- In the Railway backend project, set `CLIENT_URL` to your frontend URL (e.g., `https://<frontend>.vercel.app`) so the CORS policy allows the frontend to make requests.

- If you use the Vite environment var approach, the frontend will use the `VITE_API_BASE` value to make requests directly to Railway. For example:
  - `POST https://<railway>/api/auth/register` — to create a user
  - `POST https://<railway>/api/auth/login` — to sign in

### Quick API sign-up test (curl)

Replace `<railway-url>` with your Railway public URL and run the following as a quick test:

```powershell
curl -i -X POST 'https://<railway-url>/api/auth/register' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123"}'
```

Expect a `201` response and JSON that includes a `token` and the `user` object. If you get `Cannot GET /` it means the root route is used and the API route not found (e.g., missing `/api/auth/register`). If you get `MongoDB connection error`, inspect Railway logs.
=======
>>>>>>> a72f9a018b71ad6409d086fc936d0ae3389be01e
