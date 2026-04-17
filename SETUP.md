# Setup instructions

## Overview

This app is deployed as a standalone GitHub repo with GitHub Pages serving the static Vite build. Firebase handles authentication (Google + GitHub) and stores ratings in Firestore.

---

## 1  Generate the data files

From this directory:

```bash
python3 scripts/prepare_data.py
```

This reads `../data/combined_space.csv` and `../data/research_ideas_v2.csv` and writes:
- `public/data/corpus.json`
- `public/data/ideas.json`

These files must be committed to the repo before deploying.

---

## 2  Create a Firebase project

1. Go to https://console.firebase.google.com and sign in with your Google account.
2. Click **Add project**. Name it `idea-explorer` (or similar). Disable Google Analytics.
3. In the project dashboard, click **Web** (the `</>` icon) to register a web app. Name it `idea-explorer`. Do not enable Firebase Hosting.
4. Firebase shows you a `firebaseConfig` object. Copy the values — you will need them shortly.

### Enable authentication

In the left sidebar: **Authentication → Get started → Sign-in method**.

- Enable **Google** (use your Gmail as the project support email).
- Enable **GitHub**:
  1. Copy the **OAuth redirect URI** shown in the Firebase console (it looks like `https://YOUR_PROJECT.firebaseapp.com/__/auth/handler`).
  2. Go to https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
  3. Fill in: Homepage URL = your GitHub Pages URL (e.g. `https://thies.github.io/idea-explorer`), Callback URL = the URI from step 1.
  4. Generate a **Client secret**. Copy both Client ID and Client secret back into the Firebase GitHub provider settings.

### Create Firestore database

In the left sidebar: **Firestore Database → Create database → Start in production mode → choose a region**.

Deploy the security rules from `firestore.rules`:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy --only firestore:rules
```

Or paste the contents of `firestore.rules` directly into the **Firestore → Rules** tab in the console.

### Add your GitHub Pages domain to authorised domains

**Authentication → Settings → Authorised domains → Add domain**.  
Add: `thies.github.io`

---

## 3  Create the GitHub repository

```bash
# From the idea-explorer/ directory
git init
git add .
git commit -m "Initial commit"
gh repo create idea-explorer --public --push --source=.
```

Or create the repo manually at https://github.com/new, then:

```bash
git remote add origin https://github.com/thies/idea-explorer.git
git push -u origin main
```

---

## 4  Add Firebase config as GitHub Secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**.

Add each of these, using the values from the `firebaseConfig` object copied in step 2:

| Secret name | firebaseConfig field |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

---

## 5  Enable GitHub Pages

In the repo: **Settings → Pages → Source → GitHub Actions**.

Push to `main`. The Actions workflow builds and deploys automatically. The live URL will be:

```
https://thies.github.io/idea-explorer/
```

---

## 6  Local development

Create `.env.local` in this directory (never commit it):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then:

```bash
npm install
npm run dev
```

---

## Exporting ratings from Firestore

In the Firebase console: **Firestore → feedback collection → Export** (to Cloud Storage, then download as JSON/CSV), or use the Admin SDK / Firebase CLI export.

For a quick ad-hoc CSV:

```python
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd

cred = credentials.Certificate('service-account.json')  # download from Project settings → Service accounts
firebase_admin.initialize_app(cred)
db = firestore.client()

docs = db.collection('feedback').stream()
rows = [d.to_dict() for d in docs]
pd.DataFrame(rows).to_csv('feedback_export.csv', index=False)
```
