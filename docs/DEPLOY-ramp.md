# Web deploy (production server)

Deploy from **Admin → استقرار** (`/admin/deploy`). Only users with the **admin** role can run it.

## Server path

```
/home/admin/domains/contract.atie-sazan.ir/public_html/ramp-vision
```

Branch: **main** (no `db:migrate` on deploy).

## One-time setup on Linux

1. Generate a long random secret:

   ```bash
   openssl rand -hex 32
   ```

2. Add to the app `.env` on the server (same file Next.js / PM2 `contract` uses):

   ```env
   DEPLOY_WORKER_URL=http://127.0.0.1:39217
   DEPLOY_WORKER_SECRET=<paste-secret-here>
   ```

3. Start the worker with PM2 (from the app directory):

   ```bash
   cd /home/admin/domains/contract.atie-sazan.ir/public_html/ramp-vision
   chmod +x scripts/run-deploy.sh
   export DEPLOY_WORKER_SECRET=<same-secret>
   pm2 start ecosystem.config.cjs --only deploy-worker
   pm2 save
   ```

   Or reload after pulling this feature:

   ```bash
   pm2 reload ecosystem.config.cjs --only deploy-worker
   ```

4. Rebuild/restart the **contract** app so it picks up `DEPLOY_WORKER_*`:

   ```bash
   npm run build
   pm2 reload contract
   ```

5. **GitHub deploy key** (so `git fetch` works without a token): [docs/github-deploy-key.md](../docs/github-deploy-key.md)

6. **Chrome + B Nazanin font** (for PDF generation with Puppeteer): [docs/server-pdf-chrome-font-setup.md](../docs/server-pdf-chrome-font-setup.md)

   Quick version:

   ```bash
   cd /home/admin/domains/contract.atie-sazan.ir/public_html/ramp-vision

   # Google Chrome (Ubuntu/Debian)
   wget -q -O - https://dl.google.com/linux/linux_signing_key.pub \
     | sudo gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg
   echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
     | sudo tee /etc/apt/sources.list.d/google-chrome.list
   sudo apt-get update && sudo apt-get install -y google-chro.env fme-stable

   # Persian font for PDFs
   chmod +x scripts/install-font-linux.sh
   sudo ./scripts/install-font-linux.sh
   ```

   Add to `.env`:

   ```env
   PDF_BACKEND=puppeteer
   PDF_FONT_PATH=/usr/share/fonts/truetype/BNazanin.ttf
   ```

   Then `pm2 reload contract --update-env`.

## What deploy runs

`scripts/run-deploy.sh`:

- `git fetch` + `git reset --hard origin/main`
- `npm install`
- `npm run build`
- `pm2 reload ecosystem.config.cjs --only contract`
- `pm2 save`

## Manual test

```bash
curl -s -H "Authorization: Bearer $DEPLOY_WORKER_SECRET" http://127.0.0.1:39217/preview | jq
```

## Troubleshooting: PM2 `deploy-worker` errored

Check logs:

```bash
pm2 logs deploy-worker --lines 30
```

Common causes:

1. **`DEPLOY_WORKER_SECRET is required`** — add to `.env` in the app folder, then `pm2 reload deploy-worker --update-env`.
2. **`prisma: not found` on postinstall** — deploy uses `npm install --include=dev` (PM2’s `NODE_ENV=production` otherwise skips devDependencies). Pull latest `run-deploy.sh` and redeploy.
3. **`Deploy script not found`** — pull latest code and `chmod +x scripts/run-deploy.sh`.
4. **Wrong `cwd`** — ecosystem `cwd` must match your real app path (`ramp-vision`).

## Troubleshooting: `could not read Username for 'https://github.com'`

Deploy runs `git fetch` **without a terminal**. If `origin` is an HTTPS GitHub URL, Git cannot prompt for username/password.

**Option A — GitHub token (quick):**

1. Create a [fine-grained PAT](https://github.com/settings/tokens) or classic token with **Contents: read** on the repo.
2. Add to server `.env`:

   ```env
   DEPLOY_GITHUB_TOKEN=ghp_xxxxxxxx
   ```

3. Reload worker so it reads `.env`:

   ```bash
   pm2 reload deploy-worker --update-env
   pm2 reload contract --update-env
   ```

4. Pull this script update on the server (one-time manual fix if fetch still fails):

   ```bash
   cd /home/admin/domains/contract.atie-sazan.ir/public_html/ramp-vision
   # paste token temporarily for one fetch, or use SSH once to pull:
   DEPLOY_GITHUB_TOKEN=ghp_xxx git -c "http.extraHeader=Authorization: Bearer ghp_xxx" fetch origin
   git reset --hard origin/main
   ```

**Option B — SSH deploy key (recommended long-term):**

Full step-by-step: [docs/github-deploy-key.md](../docs/github-deploy-key.md)

Quick version:

<!-- ```bash
ssh-keygen -t ed25519 -C "deploy@atie-sazan" -f ~/.ssh/github_deploy_ramp_vision -N ""
cat ~/.ssh/github_deploy_ramp_vision.pub   # add as Deploy key in GitHub repo settings

mkdir -p ~/.ssh
chmod 700 ~/.ssh
nano ~/.ssh/config

Host github.com-ramp-vision
HostName github.com
User git
IdentityFile ~/.ssh/github_deploy_ramp_vision
IdentitiesOnly yes

chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/github_deploy_ramp_vision

ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
chmod 644 ~/.ssh/known_hosts

``` -->

```bash
su - ubuntu
ssh-keygen -t ed25519 -C "deploy@contractsrv" -f ~/.ssh/github_deploy_ramp_vision -N ""

chmod 700 ~/.ssh
chmod 600 ~/.ssh/github_deploy_ramp_vision
chmod 644 ~/.ssh/github_deploy_ramp_vision.pub

cat ~/.ssh/github_deploy_ramp_vision.pub
nano ~/.ssh/config
Host github.com-ramp-vision
  HostName github.com
  User git
  IdentityFile ~/.ssh/github_deploy_ramp_vision
  IdentitiesOnly yes


chmod 600 ~/.ssh/config
ssh-keyscan -t ed25519 github.com >> ~/.ssh/known_hosts
chmod 644 ~/.ssh/known_hosts
ssh -T git@github.com-ramp-vision
git clone git@github.com-ramp-vision:Phonixoop/ramp-vision.git

```

Then redeploy from Admin → استقرار.

Test after fix:

```bash
curl -s -H "Authorization: Bearer $(grep DEPLOY_WORKER_SECRET .env | cut -d= -f2)" http://127.0.0.1:39217/health
```

## Security

- Worker binds to **127.0.0.1** only.
- Never expose `DEPLOY_WORKER_SECRET` to the browser.
- Do not open port 39217 on the firewall.
