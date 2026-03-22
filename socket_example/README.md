# Socket Example

Projet d'exemple Socket.IO avec:
- un backend Node.js dans le dossier backend
- un frontend Expo/React Native dans le dossier frontend

## Prerequis

- Node.js 18+
- npm

## Initialisation du projet

Depuis la racine du workspace:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

## Lancer le backend

```bash
cd backend
npm start
```

Le serveur backend demarre sur le port defini dans backend/index.js.

## Lancer le frontend

Dans un second terminal:

```bash
cd frontend
npx expo start
```

Tu peux ensuite lancer l'app sur:
- Android (emulateur ou appareil)
- iOS (si environnement compatible)
- Web

## Ordre recommande

1. Lancer le backend
2. Lancer le frontend
3. Verifier l'URL du socket dans le code frontend si necessaire
