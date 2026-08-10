# Project_2XFINT — Portail de Gestion des Congés

Reconstruction pédagogique du portail de gestion de congés SUP Herman : une application full-stack avec un backend Node/Express/Prisma/MySQL et un frontend React/TypeScript (à venir).

## Structure

```
Project_2XFINT/
├── backend/     API REST (Node.js, Express, Prisma, MySQL)
└── frontend/    Interface utilisateur (React, TypeScript, Vite) — à venir
```

## Prérequis

- Node.js v18 ou supérieur
- Un serveur MySQL démarré en local
- npm

## Installation — Backend

Se placer dans le dossier `backend` et installer les dépendances :

```bash
cd backend
npm install
```

Créer la base de données MySQL dédiée :

```sql
CREATE DATABASE sup_herman_bdd;
```

Créer un fichier `.env` dans `backend/` :

```env
PORT=5002
DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/sup_herman_bdd"
JWT_SECRET="une-longue-chaine-secrete-que-tu-inventes-toi-meme"
```

Appliquer les migrations Prisma, puis générer le client si besoin :

```bash
npx prisma migrate dev
npx prisma generate
```

Peupler la base avec un compte de test :

```bash
node prisma/seed.js
```

Démarrer le serveur :

```bash
npm run dev
```

L'API tourne sur `http://localhost:5002` (le port dépend de la valeur définie dans `.env`).

## Compte de test

| Email | Mot de passe | Rôle |
|---|---|---|
| sylvie@gmail.com | password123 | EMPLOYE |

## Tester l'API

Health check :

```bash
curl http://localhost:5002/api/health
```

Connexion :

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sylvie@gmail.com","password":"password123"}'
```

La réponse contient un token JWT (valable 8h), à passer ensuite dans l'en-tête `Authorization: Bearer <token>` pour accéder aux routes protégées.

## Notes

- `.env` n'est jamais commité (il est dans `.gitignore`).
- Le port 5000 est souvent occupé par l'AirPlay Receiver sur macOS — ce projet utilise le port 5002.
