# Solair development

Use Node 22 or newer. Install dependencies with `npm ci`.

For local development, start the API with `npm run dev:api` in one terminal and Vite with `npm run dev` in another. Open the address printed by Vite (normally `http://localhost:5173`). Vite forwards `/api/generate` to the local API on port 8787. Run `npm test`, `npx tsc --noEmit`, and `npm run build` before a PR. To serve a production build locally, run `npm run build` followed by `npm run dev:api` and open `http://127.0.0.1:8787`.

Generation requires the visitor's own Gemini API key with access and quota for `gemini-3.1-flash-image`. Solair sends their key and four reference photos from the browser to its same-origin server, which forwards them to Google. The key, photos, and result are held in memory for the request; the server does not write them to disk or log them. The call specifies `store: false` to opt out of Gemini Interactions API storage. Google's other data handling terms and the user's billing still apply. The copyable prompt works without a key.

For public deployment, run the Node server behind an HTTPS reverse proxy and route both the built site and `/api/generate` to it. Deploying only the Vite `dist` directory will not enable generation. Configure your reverse proxy to limit upload size to at least 56 MiB and set an appropriate request timeout (the upstream request can take up to two minutes). The Node process listens on loopback by default.
