# Manuel utilisateur

Ce document explique comment utiliser l'application.

Il y a trois types de comptes : Employé, Manager, RH. Chacun a accès à des choses différentes.

## Se connecter

On arrive sur une page de connexion avec un email et un mot de passe. Les comptes ne peuvent pas être créés soi-même : c'est le service RH qui crée les comptes.

Si c'est la première connexion (ou si le RH a réinitialisé le mot de passe), l'application redirige automatiquement vers une page pour définir un nouveau mot de passe. Impossible d'accéder au reste du site tant que ce n'est pas fait.

## Ce que tout le monde peut faire (Employé, Manager, RH)

### Le tableau de bord

Après connexion, on arrive sur le tableau de bord. On y voit son solde de jours de congés (CP et RTT), et la liste de ses propres demandes de congés avec leur statut (en attente, approuvée, rejetée, annulée).

### Déposer une demande de congé

Sur le tableau de bord, un formulaire permet de créer une demande :
- choisir le type (CP, RTT, sans solde, maladie, formation)
- choisir la date de début et la date de fin
- ajouter un commentaire si besoin
- joindre un fichier si besoin (par exemple un certificat médical)

Le nombre de jours ouvrés est calculé automatiquement (les week-ends ne comptent pas). Si les dates ne sont pas cohérentes (fin avant début) ou si la période chevauche une demande déjà existante, l'application refuse la création et explique pourquoi.

### Voir le détail d'une demande

En cliquant sur une demande dans la liste, une fenêtre s'ouvre avec tous les détails, et si la demande a été refusée, le motif donné par le manager ou le RH.

### Annuler une demande

Tant qu'une demande est encore "en attente", un bouton "Annuler" est disponible. La demande passe alors au statut "Annulée" (elle n'est jamais supprimée, pour garder une trace).

### Le calendrier

La page Calendrier montre le mois en cours, avec qui est absent quel jour (seulement les congés déjà approuvés). On peut filtrer par service. Les jours fériés sont indiqués.

### Les notifications

Une cloche en haut de la page indique le nombre de notifications non lues. En cliquant dessus, on voit la liste (par exemple : "ta demande a été approuvée"). On peut les marquer comme lues.

### Le profil

La page Profil montre ses informations (nom, email, rôle, solde de congés) et permet de changer son mot de passe à tout moment (il faut renseigner l'ancien mot de passe).

## Ce que les Managers peuvent faire en plus

### Valider les demandes de son équipe

La page "Validation" liste les demandes de congés des personnes dont on est le manager (pas celles des autres équipes). On peut :
- filtrer par statut, par type, chercher par nom
- approuver une demande en attente
- la rejeter, en indiquant obligatoirement un motif

Chaque décision envoie automatiquement une notification à la personne concernée.

## Ce que le RH peut faire en plus

### Voir toutes les demandes

Contrairement au Manager, le RH voit les demandes de **tout le monde** sur la page Validation, pas juste une équipe. Il peut aussi corriger le statut d'une demande déjà traitée, si une erreur a été faite.

### Gérer les comptes utilisateurs

Sur la page "Admin", le RH peut :
- créer un nouveau compte (nom, email, mot de passe temporaire, rôle, département)
- voir la liste de tous les comptes
- désactiver un compte (la personne ne peut plus se connecter, mais ses anciennes demandes restent visibles)
- réinitialiser le mot de passe de quelqu'un (un mot de passe temporaire est généré, la personne devra le changer à sa prochaine connexion)

### Gérer les départements

Toujours sur la page Admin, le RH peut créer de nouveaux départements, utilisés ensuite pour classer les utilisateurs.

## Résumé des accès par rôle

| Page | Employé | Manager | RH |
|---|---|---|---|
| Tableau de bord | oui | oui | oui |
| Calendrier | oui | oui | oui |
| Profil | oui | oui | oui |
| Validation | non | oui (son équipe) | oui (tout le monde) |
| Admin | non | non | oui |
