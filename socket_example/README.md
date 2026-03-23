# Socket IO Example

<p>
  <!-- iOS -->
  <a href="https://itunes.apple.com/app/apple-store/id982107779">
    <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
  </a>
  <!-- Android -->
  <a href="https://play.google.com/store/apps/details?id=host.exp.exponent&referrer=blankexample">
    <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
  </a>
  <!-- Web -->
  <a href="https://docs.expo.dev/workflow/web/">
    <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
</p>

This example shows how to connect and interact with socket-io backends.

## Launch your own

[![Launch with Expo](https://github.com/expo/examples/blob/master/.gh-assets/launch.svg?raw=true)](https://launch.expo.dev/?github=https://github.com/expo/examples/tree/master/with-socket-io)

## 🚀 How to use

### Running the app

- Run `yarn` or `npm install`
- Open `App.js` and change the `socketEndpoint` at the top of the file to point to your endpoint.
- Open `app` with `yarn start` or `npm run start` to try it out.

### Running the server

- `cd` into the `backend` directory and run `yarn` or `npm install`, then run `yarn start` or `npm run start`
- Install [ngrok](https://ngrok.com/download) and run `ngrok http 3000` and copy the https url that looks something like this `https://f7333e87.ngrok.io`.

## 📝 Notes

React Native provides a socket-io compatible WebSocket implementation, some people get tripped up on the https requirement so this example helps to clarify how you can get it running.


----
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
