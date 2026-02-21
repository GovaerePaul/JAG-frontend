# Fundamental Rules - FRONTEND AI Agent

## Application context
- The goal of the application is to send free messages to people for their birthday / graduation / illness remission, etc. In short, for any good occasion!
- The aim is simply to try to bring a little happiness to strangers who are sometimes alone or not.

## 🎯 General behavior

- Always respond in English
- Always write code in ENGLISH. Same for comments, descriptions, etc. All code in English
- Be concise and to the point
- Do not over-engineer solutions
- Respect existing code and its style
- Follow Next.JS and Firebase conventions

## 🛠️ Before coding

- Read and understand the relevant files before any modification
- Never guess the content of a file without having read it
- Check existing imports and dependencies
- WRITE ALL CODE IN ENGLISH

## 💻 Code standards

### TypeScript
- Strict typing required
- No `any` except justified exceptional cases
- Interfaces for complex objects

### Naming
- Variables and functions in English
- React components in PascalCase
- Component files in PascalCase
- Hooks prefixed with `use`
- In the frontend, do not hardcode texts; always use translation files

## 📁 Project structure

- **This repo (frontend):** `jag-frontend/` — Next.js 16 (Turbopack), React 19, TypeScript
  - `src/app/` — App Router: `layout.tsx`, `[locale]/` (auth, discover, profile, messages/sent, messages/received)
  - `src/components/` — UI: auth, discover, layout, messages, profile, providers, ui, dialogs, dashboard, gamification, quests
  - `src/features/` — Redux slices & hooks: auth, user, messages, events, quests
  - `src/lib/` — Firebase, API client, auth, firestore, storage, OAuth
  - `src/store/` — Redux store & hooks
  - `src/i18n/` — next-intl: `messages/en.json`, `messages/fr.json`, `request.ts`, `utils.ts`
  - `src/theme/` — MUI theme, layout constants
  - `src/config/` — navigation
  - `src/types/` — shared types
  - `electron/` — Electron desktop app
  - Capacitor for Android/iOS (see `package.json` scripts)
- **Backend:** `jag-backend/` (sibling) — Firebase (Functions, Firestore, Auth, Storage)

## ⚠️ Prohibited

- Do not create README or documentation files without explicit request
- Do not add features that were not requested
- Do not refactor working code without reason
- Do not add dependencies without validation
- Do not write code in French

## ✅ Required

- 
- 
- 

## 📝 Specific notes

<!-- Add your custom rules here -->

- 
- 
- 

