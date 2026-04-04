# Yam Master

Jeu de société multijoueur en ligne basé sur le Yam, développé avec **Expo / React Native** (frontend) et **Node.js / Socket.IO** (backend), avec une base de données **PostgreSQL**.

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

### 2. Configurer les variables d'environnement

```bash
# Variables de la base de données et du backend
cp .env.example .env

# Variables Expo (frontend)
cp frontend/.env.example frontend/.env
```

> Ouvre les deux fichiers `.env` et remplace les valeurs `change_me` par tes propres secrets.

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
docker-compose up -d
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

Puis choisir la cible :
- **Web** : appuyer sur `w`
- **Android** : appuyer sur `a` (émulateur ou appareil via Expo Go)
- **iOS** : appuyer sur `i` (macOS uniquement)

---

## Structure du projet

```
.
├── backend/          # Serveur Node.js + Socket.IO + API REST
│   ├── index.js      # Point d'entrée
│   ├── routes/       # Routes Express (auth, games)
│   ├── services/     # Logique métier
│   └── db/           # Connexion PostgreSQL
├── db/
│   └── init/         # Scripts SQL (appliqués par Docker au démarrage)
├── frontend/         # Application Expo / React Native
│   ├── App.js        # Point d'entrée
│   ├── screens/      # Écrans de l'application
│   ├── components/   # Composants réutilisables (board, dés, grille…)
│   ├── controllers/  # Logique de jeu côté client
│   └── contexts/     # Contexte Socket.IO
├── .env.example      # Modèle de configuration racine
├── docker-compose.yml
└── README.md
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
