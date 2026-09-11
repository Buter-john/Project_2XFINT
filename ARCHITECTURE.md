# Documentation technique

Ce document explique comment le projet est construit techniquement : la stack, la structure des dossiers, le schéma de la base de données, et les choix importants.

## Stack technique

**Backend** : Node.js avec Express pour l'API REST, Prisma comme ORM pour parler à la base de données MySQL, JWT pour l'authentification, bcrypt pour hasher les mots de passe, multer pour l'upload de fichiers, Jest et Supertest pour les tests, Swagger pour la documentation de l'API.

**Frontend** : React avec TypeScript, Vite comme outil de build, React Router pour la navigation entre les pages.

Les deux parties sont complètement séparées et communiquent uniquement via des requêtes HTTP (JSON, sauf pour l'upload de fichier qui utilise du multipart/form-data).

## Structure des dossiers

```
backend/
  prisma/          schema de la base de données et migrations
  src/
    app.js         configuration de l'application Express (routes, middlewares)
    server.js       démarre le serveur (importe app.js)
    controllers/    la logique de chaque route
    routes/         définition des URLs et méthodes HTTP
    middlewares/    authMiddleware (vérifie le token), requireRole (vérifie le rôle)
    config/         connexion Prisma, fichier Swagger
    utils/          fonctions utilitaires (calcul des jours ouvrés)
  tests/            tests automatisés
  uploads/          fichiers justificatifs uploadés

frontend/
  src/
    features/       une page = un dossier (auth, dashboard, validation, calendar, admin, profile)
    context/         AuthContext, qui garde en mémoire qui est connecté
    routes/          ProtectedRoute, qui bloque l'accès si pas connecté ou mauvais rôle
    components/      Header (navigation + notifications)
    utils/           apiFetch (appel API centralisé), calcul des jours du mois
```

## Le schéma de la base de données

Il y a 5 tables principales :

**Department** : les services de l'entreprise (nom).

**User** : les comptes. Chaque utilisateur appartient à un département, a un rôle (EMPLOYE, MANAGER, RH), un solde de CP et de RTT, un statut actif/inactif, et peut avoir un manager (lien vers un autre User, via `managerId`).

**LeaveRequest** : les demandes de congés. Liée à un User (l'auteur), avec un type, des dates, un statut (PENDING, APPROVED, REJECTED, CANCELLED), et éventuellement un fichier joint.

**ValidationHistory** : garde une trace de chaque décision (qui a validé ou refusé, quand, avec quel commentaire). Liée à une LeaveRequest et à un User (le validateur).

**Notification** : des messages envoyés à un utilisateur (par exemple après une décision), avec un statut lu/non lu.

Le lien manager-employé se fait directement dans la table User (un User pointe vers un autre User comme manager), pas par une table séparée.

## Authentification

Au login, le mot de passe envoyé est comparé au mot de passe hashé en base avec bcrypt. Si ça correspond, le serveur génère un token JWT signé avec une clé secrète, valable 8 heures. Ce token contient l'id de l'utilisateur et son rôle.

Le frontend stocke ce token dans le localStorage du navigateur, et le renvoie dans l'en-tête `Authorization: Bearer <token>` à chaque requête vers une route protégée. Le middleware `authMiddleware` vérifie ce token sur chaque route qui en a besoin, et remplit `req.user` avec les infos qu'il contient.

Au démarrage de l'application (ou après un rechargement de page), le frontend rappelle systématiquement une route `/api/auth/me` pour récupérer le profil à jour à partir du token stocké, plutôt que de faire confiance à une copie locale des données qui pourrait être périmée.

## Gestion des rôles et des permissions

Il y a trois rôles : EMPLOYE, MANAGER, RH. Un middleware `requireRole` permet de restreindre une route à certains rôles seulement (par exemple, seul RH peut créer un utilisateur).

Pour les Managers, il y a une restriction supplémentaire : ils ne voient que les demandes des utilisateurs dont ils sont le manager direct (`managerId`), pas celles de toute l'entreprise. Cette vérification se fait au niveau de la requête à la base de données, pas juste dans l'interface.

Ce lien `managerId` est assignable depuis la page `/admin` (RH) : un menu déroulant par utilisateur liste les comptes ayant le rôle MANAGER par nom, et envoie leur id via `PUT /api/users/:id`. Sans cette assignation, un manager n'a aucun employé rattaché, donc ne voit rien sur la page Validation ni sur le calendrier filtré par équipe - ce n'est pas un bug, juste une donnée manquante à configurer côté RH.

## Quelques choix de conception

**Domaine d'email imposé** : la création d'un compte (`createUser`) exige un email se terminant par `@supherman.com`. Cette règle est vérifiée à deux endroits : côté frontend (`Admin.tsx`, pour un retour immédiat sans aller-retour serveur) et côté backend (`userController.js`, la vraie protection - un appel direct à l'API avec un autre domaine est rejeté avec un 400). Toujours dupliquer une validation métier côté serveur, même si elle existe déjà côté client : le frontend peut être contourné, jamais le backend.

**Email en double** : avant de créer un compte, `createUser` vérifie avec `prisma.user.findUnique({ where: { email } })` qu'aucun utilisateur n'a déjà cet email, et renvoie une 409 si c'est le cas. Sans cette vérification explicite, la contrainte `@unique` du schéma Prisma finit quand même par bloquer la création, mais en levant une exception technique brute (non attrapée), renvoyée au frontend comme une page d'erreur HTML au lieu d'un message JSON propre.

**Suppression logique plutôt que réelle** : un compte utilisateur désactivé (`isActive: false`) n'est jamais supprimé de la base, pour garder tout l'historique de ses demandes passées. Pareil pour une demande annulée : elle passe au statut CANCELLED, elle n'est jamais supprimée.

**Changement de mot de passe obligatoire** : chaque compte créé par le RH a `mustChangePassword: true`. Tant que ce champ est vrai, l'utilisateur est redirigé de force vers une page de changement de mot de passe, peu importe l'URL qu'il essaie d'atteindre.

**Solde de congés** : le solde (CP et RTT) est déduit automatiquement uniquement au moment où une demande est approuvée, pas à la création. Une demande encore en attente ou refusée n'a aucun impact sur le solde. Avant de décrémenter, `approveRequest` **et** `correctStatus` (`validationController.js`) vérifient que le solde actuel de l'employé couvre bien le nombre de jours demandés - sinon l'action est refusée (400), ce qui empêche un solde de passer négatif. `correctStatus` (utilisé par le RH pour corriger le statut d'une demande déjà traitée) gère aussi le sens inverse : si une demande était approuvée et qu'on la corrige vers un autre statut, les jours déjà déduits sont restitués au solde.

**Double vérification du solde** : en plus du contrôle à l'approbation, `createRequest` (`requestController.js`) vérifie aussi le solde **dès la création** d'une demande CP ou RTT. Si le nombre de jours dépasse le solde disponible, la demande est refusée avant même d'être insérée en base - elle n'apparaît donc jamais dans la liste des demandes à traiter, ni chez le manager ni chez le RH. Le contrôle à l'approbation reste nécessaire en complément (le solde a pu changer entre la création et l'approbation, si d'autres demandes ont été validées entre-temps).

## Documentation de l'API

Le détail de chaque route (méthode, paramètres, réponses) est disponible via Swagger, une fois le backend démarré, sur `http://localhost:5002/api-docs`.
