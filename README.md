# Yam Master

Jeu de société multijoueur en ligne basé sur le Yam, développé avec **Expo / React Native** (frontend) et **Node.js / Socket.IO** (backend), avec une base de données **PostgreSQL**.

## But du jeu

Yam Master est une adaptation numérique et stratégique du jeu de dés Yam traditionnel. Les joueurs lancent des dés pour former des combinaisons et marquer des points, tout en plaçant des pions sur une grille pour contrôler des lignes, colonnes ou diagonales. Le but est d'atteindre des conditions de victoire en remplissant des figures ou en épuisant les pions de l'adversaire. Le jeu propose deux modes principaux :

- **Multijoueur en ligne** : Affrontez d'autres joueurs en temps réel via Socket.IO.
- **VS Bot** : Jouez contre une intelligence artificielle pour pratiquer ou jouer seul.

Le jeu inclut des mécaniques avancées comme le "Défi" (annoncer une figure au deuxième lancer) et "Yam Prédator" (retirer un pion à l'adversaire), pour une expérience plus compétitive.

## Fonctionnement de l'application

L'application Yam Master fonctionne selon une architecture client-serveur :

- **Frontend (Expo / React Native)** : Interface utilisateur mobile/web. Utilise Socket.IO pour la communication temps réel avec le serveur lors des parties multijoueurs. Gère l'affichage des dés, de la grille de jeu, des timers, et des écrans (login, menu, partie).
- **Backend (Node.js / Express / Socket.IO)** : Serveur API REST pour l'authentification (JWT) et la gestion des utilisateurs/parties. Socket.IO gère les événements temps réel (lancers de dés, mises à jour de la grille, fin de partie). Les middlewares assurent la sécurité (rate-limiting, validation).
- **Base de données (PostgreSQL)** : Stocke les utilisateurs, les parties en cours/terminées, et les scores. Les scripts SQL initiaux créent le schéma et les données de démo.
- **Communication** : L'authentification utilise des tokens JWT. Les parties multijoueurs passent par WebSockets (Socket.IO) pour une latence minimale, tandis que les opérations CRUD (historique, etc.) utilisent l'API REST.

L'application démarre avec l'écran de connexion, puis permet de créer/rejoindre une partie ou jouer contre un bot.

---

## Prérequis

| Outil | Version minimale |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Docker & Docker Compose | v2+ |

---

## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd yam_game
```

### 2. Configurer les variables d'environnement et modifier le nom en .env

```bash
# Variables de la base de données et du backend
cp .env.example .env

# Variables Expo (frontend)
cp frontend/.env.example frontend/.env
```

> Ouvre le `.env`(racine) et remplace les valeurs `change_me` par tes propres secrets.
> Pour generer un `JWT_SECRET` robuste:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Installer les dépendances

```bash
# Dépendances backend
cd backend && npm install && cd ..

# Dépendances frontend
cd frontend && npm install && cd ..
```

---

## Lancer l'environnement

### 1. Démarrer la base de données

```bash
docker compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port défini dans `.env` (`POSTGRES_PORT`, par défaut `5432`)
- **pgAdmin** sur `http://localhost:5050` (interface d'administration)

Le schéma SQL (`db/init/001_schema.sql`) est appliqué automatiquement au premier démarrage.

### 2. Démarrer le backend

Dans un terminal :

```bash
cd backend
npm run start
```

Le serveur démarre sur `http://localhost:3000`.

### 3. Démarrer le frontend

Dans un second terminal :

```bash
cd frontend
npx expo start
```

Le frontend est actuellement utilise en mode Web uniquement via Expo.

---

## Structure du projet

```
.
├── ARCHITECTURE.md
├── docker-compose.yml
├── env.example
├── README.md
├── user_demo_for_login.md
├── backend/          # Serveur Node.js + Socket.IO + API REST
│   ├── db/           # Connexion PostgreSQL
│   ├── middleware/   # Middlewares Express
│   ├── routes/       # Routes Express (auth, games)
│   ├── services/     # Logique métier
│   └── validators/   # Schémas de validation
├── db/
│   └── init/         # Scripts SQL
├── doc/              # Documentation détaillée
│   ├── agents/       # Rôles des agents de développement
│   └── evaluation/   # Évaluation et fonctionnalités
├── frontend/         # Application Expo / React Native
│   ├── components/   # Composants réutilisables
│   ├── contexts/     # Contexte Socket.IO
│   ├── controllers/  # Logique de jeu côté client
│   ├── screens/      # Écrans de l'application
│   └── utils/        # Utilitaires
└── .env.example      # Modèle de configuration racine
```

---

## Variables d'environnement

### `.env` (racine)

| Variable | Description |
|---|---|
| `POSTGRES_DB` | Nom de la base de données |
| `POSTGRES_USER` | Utilisateur PostgreSQL |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `POSTGRES_PORT` | Port exposé par Docker |
| `DATABASE_URL` | URL de connexion complète (utilisée par le backend) |
| `PORT` | Port du serveur backend |
| `JWT_SECRET` | Clé secrète pour la signature des tokens JWT |
| `ACCESS_TOKEN_TTL` | Durée de vie du token d'accès (ex: `15m`) |
| `REFRESH_TOKEN_TTL` | Durée de vie du refresh token (ex: `7d`) |
| `CORS_ALLOWED_ORIGINS` | Origines autorisées par le backend |
| `PGADMIN_DEFAULT_EMAIL` | Email de connexion pgAdmin |
| `PGADMIN_DEFAULT_PASSWORD` | Mot de passe pgAdmin |
| `PGADMIN_PORT` | Port exposé pour pgAdmin |

### `frontend/.env`

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_SOCKET_URL` | URL du serveur Socket.IO |
| `EXPO_PUBLIC_API_URL` | URL de l'API REST backend |
