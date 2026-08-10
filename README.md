# Project_2XFINT — Portail de Gestion des Congés (projet d'apprentissage)

Ce projet est une reconstruction pédagogique, pas à pas, du portail de gestion de congés **SUP Herman**. L'objectif est d'apprendre à construire une application full-stack complète (backend Node/Express/Prisma/MySQL + frontend React/TypeScript) en comprenant chaque brique.

---

## 📂 Structure du projet

```
Project_2XFINT/
├── backend/     → API REST (Node.js, Express, Prisma, MySQL)
└── frontend/    → Interface utilisateur (React, TypeScript, Vite) — à venir
```

---

## 🛠️ Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- Un serveur MySQL démarré en local
- npm

---

## 🚀 Installation — Backend

1. Se placer dans le dossier `backend` :
   ```bash
   cd backend
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Créer la base de données MySQL dédiée (via `mysql -u root -p` ou MySQL Workbench) :
   ```sql
   CREATE DATABASE sup_herman_bdd;
   ```
4. Créer un fichier `.env` dans `backend/` avec :
   ```env
   PORT=5002
   DATABASE_URL="mysql://root:TON_MOT_DE_PASSE@localhost:3306/sup_herman_bdd"
   ```
5. Initialiser Prisma (déjà fait dans ce repo, gardé ici pour référence) :
   ```bash
   npx prisma init --datasource-provider mysql
   ```
   ⚠️ Ce projet utilise **Prisma 7** : la config de connexion passe par `prisma.config.ts` (généré automatiquement), qui lit `DATABASE_URL` depuis `.env` via `dotenv`.
6. Appliquer les migrations Prisma (crée les tables dans la base) :
   ```bash
   npx prisma migrate dev --name init
   ```
   Si le client Prisma n'est pas généré automatiquement, lance en plus :
   ```bash
   npx prisma generate
   ```
7. Démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
   L'API est disponible sur `http://localhost:5002` (le port dépend de la valeur définie dans `.env`).

---

## 👤 Compte de test

Créé via `node prisma/seed.js` :

| Email | Mot de passe | Rôle |
|---|---|---|
| `sylvie@gmail.com` | `password123` | EMPLOYE |

## 🔑 Tester la connexion (login)

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sylvie@gmail.com","password":"password123"}'
```
Renvoie un `token` JWT (valable 8h) à utiliser ensuite dans l'en-tête `Authorization: Bearer <token>` pour accéder aux routes protégées.

## ✅ Vérifier que ça fonctionne

Route de test (health check) :
```
GET http://localhost:5002/api/health
```
Doit renvoyer :
```json
{ "status": "ok" }
```

---

## 📖 Journal d'apprentissage (chapitres)

| Chapitre | Contenu | Statut |
|---|---|---|
| 1 | Structure du projet, Git, `.gitignore` | ✅ Fait |
| 2 | Serveur Express minimal + connexion MySQL via Prisma | ✅ Fait |
| 3 | Modèle de données (`schema.prisma`) | ✅ Fait |
| 4 | Authentification JWT (login, hash bcrypt, middleware de protection) | ✅ Fait |
| 5 | CRUD des demandes de congés | ⏳ À venir |
| 6 | Frontend React/TS/Vite + page de login | ⏳ À venir |
| 7 | Dashboard & affichage des demandes | ⏳ À venir |
| 8 | Validation (Manager/Admin) & Notifications | ⏳ À venir |
| 9 | Calendrier global des absences | ⏳ À venir |
| 10 | Console admin, tests, Swagger | ⏳ À venir |

---

## ⚠️ Notes importantes

- Le fichier `.env` (mots de passe, clé JWT) **n'est jamais commité** — il est listé dans `.gitignore`.
- Le port `5000` est souvent occupé sur macOS par l'AirPlay Receiver du système : ce projet utilise le port `5002` pour l'éviter.
