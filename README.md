# Project_2XFINT — Portail de Gestion des Congés

Reconstruction pédagogique du portail de gestion de congés SUP Herman : une application full-stack avec un backend Node/Express/Prisma/MySQL et un frontend React/TypeScript.

Fonctionnalités : authentification JWT avec 3 rôles (EMPLOYE, MANAGER, RH), CRUD des demandes de congés, calcul automatique des jours ouvrés, validation/rejet par le RH avec notifications, calendrier global des absences, gestion des comptes utilisateurs (création, désactivation logique), tests automatisés, documentation Swagger.

Voir aussi :
- [MANUEL_UTILISATEUR.md](./MANUEL_UTILISATEUR.md) — comment utiliser l'application (par rôle)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — documentation technique (stack, schéma de données, choix de conception)

## Structure

```
Project_2XFINT/
├── backend/     API REST (Node.js, Express, Prisma, MySQL)
└── frontend/    Interface utilisateur (React, TypeScript, Vite)
```

## Installation — Frontend

```bash
cd frontend
npm install
npm run dev
```

L'interface tourne sur `http://localhost:5173`. La page `/login` permet de se connecter avec le compte de test ci-dessous.

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

## Comptes de test

| Email | Mot de passe | Rôle |
|---|---|---|
| sylvie@supherman.com | password123 | EMPLOYE |
| rh@supherman.com | Suph3rm4n! | RH |

## Tester l'API

Health check :

```bash
curl http://localhost:5002/api/health
```

Connexion :

```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rh@supherman.com","password":"Suph3rm4n!"}'
```

La réponse contient un token JWT (valable 8h), à passer ensuite dans l'en-tête `Authorization: Bearer <token>` pour accéder aux routes protégées.

## Demandes de congés (CRUD)

Toutes les routes ci-dessous nécessitent l'en-tête `Authorization: Bearer <token>`.

```bash
# Créer une demande avec justificatif (multipart/form-data, pas de JSON)
curl -X POST http://localhost:5002/api/requests \
  -H "Authorization: Bearer TON_TOKEN" \
  -F "type=CP" -F "startDate=2026-08-10" -F "endDate=2026-08-14" -F "comment=vacances" \
  -F "document=@/chemin/vers/justificatif.pdf"

# Lister mes demandes
curl http://localhost:5002/api/requests -H "Authorization: Bearer TON_TOKEN"

# Modifier une demande en attente
curl -X PUT http://localhost:5002/api/requests/ID_DEMANDE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{"type":"RTT","startDate":"2026-08-17","endDate":"2026-08-18","comment":"modifie"}'

# Annuler une demande en attente (passe le statut a CANCELLED, ne supprime rien)
curl -X DELETE http://localhost:5002/api/requests/ID_DEMANDE -H "Authorization: Bearer TON_TOKEN"

# Detail d'une demande (avec l'historique de validation / commentaire du manager)
curl http://localhost:5002/api/requests/ID_DEMANDE -H "Authorization: Bearer TON_TOKEN"
```

Sur le frontend (`/dashboard`), cliquer sur une demande ouvre une fenetre de detail avec le commentaire du manager en cas de rejet.

## Validation des demandes (RH/Manager)

Routes reservees aux roles `MANAGER` et `RH` :

```bash
# Voir toutes les demandes (filtres optionnels : status, type, employeeId, from, to)
curl "http://localhost:5002/api/requests/pending?status=APPROVED&type=CP" -H "Authorization: Bearer TOKEN_RH"

# Approuver
curl -X POST http://localhost:5002/api/validation/ID_DEMANDE/approve -H "Authorization: Bearer TOKEN_RH"

# Rejeter (le motif "comment" est obligatoire)
curl -X POST http://localhost:5002/api/validation/ID_DEMANDE/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_RH" \
  -d '{"comment":"motif du refus"}'

# RH uniquement : corriger le statut de n'importe quelle demande, meme deja traitee
curl -X PATCH http://localhost:5002/api/validation/ID_DEMANDE/correct \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_RH" \
  -d '{"status":"REJECTED","comment":"correction erreur de saisie"}'
```

Chaque decision cree une notification pour le collaborateur concerne. Un `MANAGER` ne voit que les demandes des utilisateurs dont il est le manager (`managerId`) ; le `RH` voit tout.

## Notifications

```bash
# Mes notifications
curl http://localhost:5002/api/notifications -H "Authorization: Bearer TON_TOKEN"

# Marquer comme lue
curl -X PATCH http://localhost:5002/api/notifications/ID/read -H "Authorization: Bearer TON_TOKEN"
```

Sur le frontend, la cloche dans le header (visible une fois connecte) affiche le nombre de notifications non lues.

## Premiere connexion / reinitialisation de mot de passe

Tout nouveau compte cree par le RH a `mustChangePassword: true` : l'utilisateur est redirige de force vers `/profile` tant qu'il n'a pas change son mot de passe.

Une page dediee `/set-password` (sans infos personnelles) force ce changement avant tout acces au reste de l'appli.

Le RH peut reinitialiser le mot de passe d'un utilisateur (bouton sur `/admin`) :
```bash
curl -X POST http://localhost:5002/api/users/ID_USER/reset-password -H "Authorization: Bearer TOKEN_RH"
```
Renvoie un mot de passe temporaire, et remet `mustChangePassword` a `true`.

## Profil utilisateur

Accessible sur `/profile` (tous les roles) : infos personnelles (nom, email, role, departement), solde de conges, changement de mot de passe.

```bash
curl -X PATCH http://localhost:5002/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TON_TOKEN" \
  -d '{"currentPassword":"ancien","newPassword":"nouveau"}'
```

## Documentation Swagger

Une fois le backend démarré, la documentation interactive de l'API est disponible sur :
```
http://localhost:5002/api-docs
```

## Tests automatisés

```bash
cd backend
npm test
```

## Console admin (RH)

Accessible sur `/admin` (frontend) avec le compte RH : créer un utilisateur, lister les comptes, activer/désactiver (un compte désactivé ne peut plus se connecter), assigner un manager à un employé (menu déroulant par nom, sur chaque ligne de la liste).

```bash
# Assigner (ou retirer) un manager - accessible au RH uniquement
curl -X PUT http://localhost:5002/api/users/ID_USER \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_RH" \
  -d '{"managerId":"ID_DU_MANAGER"}'
```

## Calendrier

Accessible sur `/calendar` (tous les rôles) : affiche les absences approuvées du mois en cours.

## Notes

- `.env` n'est jamais commité (il est dans `.gitignore`).
- Le port 5000 est souvent occupé par l'AirPlay Receiver sur macOS — ce projet utilise le port 5002.
