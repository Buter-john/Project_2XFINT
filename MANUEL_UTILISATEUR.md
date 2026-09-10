# Manuel utilisateur

Ce document explique comment utiliser l'application.

Il y a trois types de comptes : Employé, Manager, RH. Chacun a accès à des choses différentes.

## Se connecter

On arrive sur une page de connexion avec un email et un mot de passe. Les comptes ne peuvent pas être créés soi-même : c'est le service RH qui crée les comptes.

Si c'est la première connexion (ou si le RH a réinitialisé le mot de passe), l'application redirige automatiquement vers une page pour définir un nouveau mot de passe. Impossible d'accéder au reste du site tant que ce n'est pas fait.

## Ce que tout le monde peut faire (Employé, Manager, RH)

### Le tableau de bord

Après connexion, on arrive sur le tableau de bord. On y voit son solde de jours de congés (CP et RTT), le nombre de demandes actuellement en attente, la prochaine période de congé déjà approuvée (si il y en a une à venir), et la liste de ses propres demandes de congés avec leur statut (en attente, approuvée, rejetée, annulée).

### Déposer une demande de congé

Sur le tableau de bord, un formulaire permet de créer une demande :
- choisir le type (CP, RTT, sans solde, maladie, formation)
- choisir la date de début et la date de fin
- ajouter un commentaire si besoin
- joindre un fichier si besoin (par exemple un certificat médical)

Le nombre de jours ouvrés est calculé automatiquement (les week-ends ne comptent pas). Si les dates ne sont pas cohérentes (fin avant début), si la période chevauche une demande déjà existante, ou si le nombre de jours demandé dépasse le solde CP ou RTT restant, l'application refuse la création et explique pourquoi (par exemple : "Solde RTT dépassé, vous avez droit à 10 jour(s), pas 14"). La demande n'est alors jamais créée, donc n'apparaît jamais chez le manager ou le RH.

### Voir le détail d'une demande

En cliquant sur une demande dans la liste, une fenêtre s'ouvre avec tous les détails, et si la demande a été refusée, le motif donné par le manager ou le RH.

### Annuler une demande

Tant qu'une demande est encore "en attente", un bouton "Annuler" est disponible. La demande passe alors au statut "Annulée" (elle n'est jamais supprimée, pour garder une trace).

### Le calendrier

La page Calendrier montre le mois en cours, avec qui est absent quel jour (seulement les congés déjà approuvés). On peut filtrer par service. Les jours fériés sont indiqués.

### Les notifications

Une cloche en haut de la page indique le nombre de notifications non lues. En cliquant dessus, on voit la liste (par exemple : "ta demande a été approuvée"). On peut les marquer comme lues.

### Le profil

La page Profil montre ses informations (nom, email, rôle, département, solde de congés) et permet de changer son mot de passe à tout moment (il faut renseigner l'ancien mot de passe).

## Ce que les Managers peuvent faire en plus

### Valider les demandes de son équipe

La page "Validation" liste les demandes de congés des personnes dont on est le manager (pas celles des autres équipes). On peut :
- filtrer par statut, par type, par période (date de début / date de fin), chercher par nom
- approuver une demande en attente
- la rejeter, en indiquant obligatoirement un motif

Chaque décision envoie automatiquement une notification à la personne concernée.

Si l'employé n'a plus assez de jours (CP ou RTT) sur son solde pour couvrir la demande, l'approbation est refusée avec un message d'erreur indiquant le solde restant - ça évite de faire passer un solde en négatif.

## Ce que le RH peut faire en plus

### Voir toutes les demandes

Contrairement au Manager, le RH voit les demandes de **tout le monde** sur la page Validation, pas juste une équipe. Il peut aussi corriger le statut d'une demande déjà traitée, si une erreur a été faite.

### Gérer les comptes utilisateurs

Sur la page "Admin", le RH peut :
- créer un nouveau compte (nom, email, mot de passe temporaire, rôle, département) - l'email doit obligatoirement se terminer par `@supherman.com`, sinon la création est refusée
- voir la liste de tous les comptes
- désactiver un compte (la personne ne peut plus se connecter, mais ses anciennes demandes restent visibles)
- réinitialiser le mot de passe de quelqu'un (un mot de passe temporaire est généré, la personne devra le changer à sa prochaine connexion)
- assigner un manager à un employé, via un menu déroulant qui liste les comptes ayant le rôle Manager (par nom). C'est ce lien qui détermine quelles demandes un manager verra sur la page Validation, et qui apparaît dans le calendrier filtré par équipe
- modifier directement les informations d'un utilisateur existant (nom, département, rôle) depuis la liste, sans passer par un formulaire séparé

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
