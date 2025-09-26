# 🚀 Next.js Full-Stack Boilerplate

Boilerplate ultra-générique pour applications Next.js avec authentification Firebase, i18n, tests, et déploiement multi-plateforme.

## ✨ Fonctionnalités

- **Next.js 15** avec App Router
- **React 19** + TypeScript
- **Firebase** (Auth + Firestore)
- **i18n** (next-intl) - FR/EN
- **Styling** (Tailwind CSS + Emotion)
- **Tests** (Jest + RTL)
- **Multi-plateforme** (Web + Mobile + Desktop)
- **CI/CD** prêt
- **Configuration** centralisée

## 🛠️ Technologies

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Emotion
- next-intl

### Backend
- Firebase Cloud Functions
- Firebase Authentication
- Firestore Database

### Mobile
- Capacitor
- Android/iOS support

### Desktop
- Electron
- Windows/macOS/Linux

### Testing
- Jest
- React Testing Library
- Coverage reports

### Tools
- ESLint
- Prettier
- Husky (git hooks)

## 📁 Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── ui/                # UI components
│   │   └── __tests__/         # Component tests
│   ├── hooks/                 # Custom hooks
│   │   └── __tests__/         # Hook tests
│   ├── lib/                   # Utilities & config
│   │   ├── firebase.ts        # Firebase config
│   │   ├── auth.ts            # Auth functions
│   │   ├── api-client.ts      # API client
│   │   └── __tests__/         # Utility tests
│   ├── i18n/                  # Internationalization
│   │   ├── messages/          # Translation files
│   │   ├── request.ts         # i18n config
│   │   ├── navigation.ts      # i18n navigation
│   │   └── metadata.ts        # i18n metadata
│   └── types/                 # TypeScript types
├── electron/                  # Electron desktop app
├── android/                   # Android app (generated)
├── ios/                       # iOS app (generated)
├── out/                       # Build output
├── dist/                      # Desktop build output
├── coverage/                  # Test coverage
├── .github/                   # GitHub Actions
├── .vscode/                   # VS Code settings
├── jest.config.js             # Jest configuration
├── eslint.config.js           # ESLint configuration
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind configuration
├── next.config.ts             # Next.js configuration
├── middleware.ts              # Next.js middleware
├── capacitor.config.ts        # Capacitor configuration
└── package.json               # Dependencies & scripts
```

## 🚀 Démarrage rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration Firebase
1. Créez un projet Firebase
2. Activez Authentication (Email/Password)
3. Activez Firestore Database
4. Copiez `env.example` vers `.env`
5. Configurez vos variables Firebase

### 3. Développement
```bash
# Web
npm run dev

# Mobile (après configuration)
npm run cap:android
npm run cap:ios

# Desktop
npm run electron:dev
```

### 4. Tests
```bash
# Tests unitaires
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### 5. Build & Deploy
```bash
# Build web
npm run build

# Build mobile
npm run build:mobile

# Build desktop
npm run build:desktop
```

## ⚙️ Configuration

### Variables d'environnement
```bash
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# App
NEXT_PUBLIC_APP_NAME=Your App Name
NEXT_PUBLIC_APP_DESCRIPTION=Your app description
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

### Personnalisation
- **Traductions** : Modifiez `src/i18n/messages/`
- **Styling** : Modifiez `tailwind.config.js`
- **Composants** : Ajoutez dans `src/components/`
- **Pages** : Ajoutez dans `src/app/`

## 🧪 Tests

### Structure des tests
```
src/
├── components/
│   └── __tests__/           # Tests des composants
├── hooks/
│   └── __tests__/           # Tests des hooks
├── lib/
│   └── __tests__/           # Tests des utilitaires
└── __tests__/               # Tests d'intégration
```

### Configuration Jest
- **Environment** : jsdom
- **Coverage** : 80% minimum
- **Mocks** : Firebase, next-intl, next/navigation
- **Setup** : `jest.setup.js`

### Exécution
```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- LoginForm

# Couverture
npm run test:coverage

# Mode watch
npm run test:watch
```

## 🌍 Internationalisation

### Configuration
- **Langues** : Français (défaut), Anglais
- **Routing** : `/[locale]/page`
- **Middleware** : Détection automatique de langue

### Ajout de langues
1. Ajoutez la langue dans `src/i18n/request.ts`
2. Créez le fichier de traduction dans `src/i18n/messages/`
3. Mettez à jour `middleware.ts`

### Utilisation
```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('common');
  return <h1>{t('title')}</h1>;
}
```

## 📱 Multi-plateforme

### Web
- Next.js avec App Router
- Static export support
- PWA ready

### Mobile (Capacitor)
```bash
# Android
npm run cap:android

# iOS
npm run cap:ios

# Sync
npm run cap:sync
```

### Desktop (Electron)
```bash
# Développement
npm run electron:dev

# Build
npm run electron:build

# Distribution
npm run electron:dist
```

## 🔧 Scripts disponibles

### Développement
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run start` - Serveur de production

### Tests
- `npm test` - Tests unitaires
- `npm run test:watch` - Tests en mode watch
- `npm run test:coverage` - Tests avec couverture

### Mobile
- `npm run cap:android` - Ouvrir Android Studio
- `npm run cap:ios` - Ouvrir Xcode
- `npm run cap:sync` - Synchroniser avec Capacitor

### Desktop
- `npm run electron:dev` - Electron en développement
- `npm run electron:build` - Build Electron
- `npm run electron:dist` - Distribution Electron

### Linting
- `npm run lint` - Linter ESLint
- `npm run lint:fix` - Corriger automatiquement

## 🚀 Déploiement

### Web (Vercel/Netlify)
1. Connectez votre repo
2. Configurez les variables d'environnement
3. Déployez automatiquement

### Mobile (Google Play/App Store)
1. Build : `npm run build:mobile`
2. Ouvrez Android Studio/Xcode
3. Suivez le processus de publication

### Desktop
1. Build : `npm run electron:dist`
2. Distribuez les fichiers générés

## 📚 Documentation

### Composants
- Utilisez JSDoc pour documenter vos composants
- Exemples d'utilisation dans les tests
- Props et types TypeScript

### Hooks
- Documentez les hooks personnalisés
- Exemples d'utilisation
- Types de retour

### API
- Documentez les fonctions d'API
- Exemples de requêtes
- Gestion d'erreurs

## 🤝 Contribution

### Structure des commits
```
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage
refactor: refactoring
test: tests
chore: maintenance
```

### Pull Requests
1. Créez une branche feature
2. Commitez vos changements
3. Ouvrez une PR
4. Attendez la review

## 📄 Licence

MIT License - Voir LICENSE pour plus de détails.

## 🆘 Support

- **Issues** : GitHub Issues
- **Documentation** : README.md
- **Exemples** : Dossier `examples/`

---

**🎉 Votre boilerplate est prêt ! Commencez à développer votre application.**
