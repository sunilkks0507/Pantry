# Pantry

A simple home grocery tracker built with Expo (React Native + TypeScript).

## Features
- Add, edit, delete grocery items (name, category, quantity, unit, expiry date)
- List grouped/sorted by soonest expiry
- Visual flags for expired / expiring-soon / low-stock items
- Search/filter by name
- Local persistence via AsyncStorage (no backend needed)

## Setup
```
npm install
npx expo start
```
Scan the QR code with the **Expo Go** app on your phone, or press `a` / `i` in the terminal for an Android/iOS emulator.

If you see a dependency version warning, run:
```
npx expo install --fix
```

## Push to GitHub
```
git init
git add .
git commit -m "Initial commit: Pantry app scaffold"
gh repo create pantry-app --public --source=. --remote=origin --push
```
(Requires the GitHub CLI: `winget install --id GitHub.cli`, then `gh auth login` once. Use `--private` instead of `--public` if you want a private repo.)

## Project structure
```
App.tsx                  - app entry point
src/types.ts              - GroceryItem type + categories
src/storage.ts            - AsyncStorage load/save helpers
src/screens/HomeScreen.tsx - main list screen
src/components/           - ItemCard, AddEditModal, SearchBar
```

## Next steps / ideas
- Swap AsyncStorage for expo-sqlite if the list grows large
- Push notifications for items expiring soon
- Barcode scanning to add items faster
- Shared/household sync via a backend (Supabase, Firebase, etc.)
