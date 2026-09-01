# Choral Ledger

A tracker for MIDI-realized SATB arrangements, built for organizing YouTube channel uploads.

Tracks: title, composer, arranger, voicing, status (Idea → Arranging → MIDI programming →
Recording & editing → Scheduled → Uploaded), YouTube link, scheduled date, tags, and notes.
Includes search and status filtering. Data is saved in your browser's `localStorage`, so it
persists between visits on the same browser/device (it does not sync across devices).

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually `http://localhost:5173`).

## Publish it on GitHub Pages

1. **Create a GitHub repo** (e.g. `choral-ledger`) and push this folder to it:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/choral-ledger.git
   git push -u origin main
   ```

2. **Set the base path.** Open `vite.config.js` and make sure `base` matches your repo name
   exactly, e.g. if your repo URL is `github.com/you/choral-ledger`, keep:

   ```js
   base: "/choral-ledger/",
   ```

   (If you rename the repo, update this to match, then rebuild/redeploy.)

3. **Install the deploy dependency and deploy:**

   ```bash
   npm install
   npm run deploy
   ```

   This builds the app and pushes the `dist` folder to a `gh-pages` branch using the
   `gh-pages` package (already listed in `package.json`).

4. **Turn on Pages in GitHub:** go to your repo → Settings → Pages → under "Build and
   deployment," set Source to "Deploy from a branch," pick the `gh-pages` branch and `/ (root)`
   folder, then save.

5. Your app will be live at:

   ```
   https://YOUR-USERNAME.github.io/choral-ledger/
   ```

   (GitHub Pages can take a minute or two to go live the first time.)

Whenever you make changes, just run `npm run deploy` again to publish the update.

## Notes

- Data lives in that browser's `localStorage` — clearing site data/cookies for this URL will
  erase your saved pieces, so it's worth exporting or backing up periodically if your list
  grows large. Let me know if you'd like an export/import (JSON) button added.
