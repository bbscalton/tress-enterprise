# Fleet Rentals

Professional fleet rental management — inspired by [Rentgine](https://www.rentgine.net/en/), built for ease of use.

## What's included

| App | Purpose | Port |
|-----|---------|------|
| **Business** (`apps/business`) | Fleet dashboard, calendar, rentals, live map, chat, tasks, aggressive alerts | 5173 |
| **Customer** (`apps/customer`) | Check-in, chat (text/photo/voice), documents, issue reporting, emergency location | 5174 |

## Features

### Business
- Google Sign-in
- Fleet management (add/edit vehicles, status tracking)
- Color-coded rental calendar
- Create & process rentals
- **Live OpenStreetMap** — see customer locations during active rentals
- Customer chat with image support
- Task planner for daily operations
- **Aggressive overdue alerts** — push notifications, vibration, alarm sound
- Dashboard with today's returns and fleet overview

### Customer
- Google Sign-in
- Vehicle check-in with photos + digital agreement
- Chat with business (text, photos, voice notes)
- Driver's license upload (camera or file)
- Issue reporting with photos
- Emergency location sharing
- Automatic location sharing during active rentals

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, PWA
- **Auth & Realtime:** Firebase Auth (Google), Realtime Database, Storage, FCM
- **Maps:** Leaflet + OpenStreetMap
- **Storage (optional):** Cloudflare R2 via Workers
- **Hosting:** Firebase Hosting or GitHub Pages

## Quick start

### 1. Create Firebase project

```bash
firebase login
firebase projects:create fleetrentals-app --display-name "Fleet Rentals"
```

Enable in Firebase Console:
- **Authentication** → Google sign-in
- **Realtime Database** → Create database
- **Storage** → Get started
- **Cloud Messaging** → for push notifications

### 2. Configure environment

```bash
cp .env.example apps/business/.env.local
cp .env.example apps/customer/.env.local
```

Fill in your Firebase web app config values.

### 3. Install & run

```bash
npm install
npm run dev:business   # http://localhost:5173
npm run dev:customer   # http://localhost:5174
```

### 4. Deploy Firebase rules

```bash
firebase use fleetrentals-app
firebase deploy --only database,storage
```

### 5. Deploy apps

```bash
npm run build
firebase deploy --only hosting
```

Or GitHub Pages:

```bash
npm run build
npx gh-pages -d apps/business/dist
```

## Cloudflare R2 (optional)

For large file storage (voice notes, high-res photos):

```bash
cd cloudflare
npm install
wrangler login
wrangler r2 bucket create fleetrentals-files
npm run deploy
```

## Push notifications setup

1. Generate a web push certificate in Firebase Console → Cloud Messaging
2. Add a service worker for FCM in each app (included via PWA plugin)
3. Grant notification permission when prompted on the business dashboard
4. Overdue rentals trigger: browser notification + vibration + alarm loop until acknowledged

## Project structure

```
fleetrentals/
├── apps/
│   ├── business/     # Business web/PWA app
│   └── customer/     # Customer web/PWA app
├── packages/
│   └── shared/       # Types, Firebase, database helpers
├── firebase/
│   ├── functions/    # Scheduled overdue checks + FCM
│   ├── database.rules.json
│   └── storage.rules
├── cloudflare/       # R2 storage worker
└── firebase.json
```

## First-time business setup

1. Sign in with Google on the business app (first user becomes business role)
2. Add vehicles in **Fleet**
3. Customers sign in on the customer app (auto-created in customer database)
4. Create rentals in **Rentals** linking vehicle + customer
5. Customer checks in, chats, and shares location automatically

## License

Private — all rights reserved.
