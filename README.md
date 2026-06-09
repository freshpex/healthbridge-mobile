# HealthBridge Mobile

Expo React Native + TypeScript mobile app for HealthBridge.

## Setup

```bash
npm install
cp .env.example .env
npm run start
```

Start with Expo Go for development. The app stores auth tokens with `expo-secure-store` and calls the backend with `EXPO_PUBLIC_API_URL`.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npx expo-doctor --verbose
npx expo prebuild --clean
```

## Demo

Use seeded credentials with password `Password123!`.

Emergency code: `HB-DEMO01`.
