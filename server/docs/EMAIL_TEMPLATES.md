# Modèles d'emails

Ce document décrit les différents modèles d'emails disponibles dans l'application et leur utilisation.

## Modèles disponibles

### 1. Confirmation de commande (`ORDER_CONFIRMATION`)

**Objectif** : Envoyé lorsqu'une commande est passée avec succès.

**Données requises** :
- `order` : Objet de la commande
- `user` : Utilisateur ayant passé la commande

**Variables de template** :
- `order` : Détails de la commande
- `user` : Informations sur l'utilisateur
- `siteName` : Nom du site
- `siteUrl` : URL du site
- `supportEmail` : Email du support
- `socialLinks` : Liens vers les réseaux sociaux

---

### 2. Confirmation de paiement (`PAYMENT_CONFIRMATION`)

**Objectif** : Envoyé lorsqu'un paiement est confirmé avec succès.

**Données requises** :
- `order` : Objet de la commande
- `user` : Utilisateur ayant effectué le paiement
- `paymentDetails` : Détails du paiement

**Variables de template** :
- `order` : Détails de la commande
- `user` : Informations sur l'utilisateur
- `paymentDetails` : Détails du paiement (ID, statut, etc.)
- `siteName` : Nom du site
- `siteUrl` : URL du site
- `supportEmail` : Email du support

---

### 3. Échec de paiement (`PAYMENT_FAILED`)

**Objectif** : Envoyé lorsqu'un paiement échoue.

**Données requises** :
- `order` : Objet de la commande
- `user` : Utilisateur concerné
- `error` : Détails de l'erreur
- `retryUrl` : URL pour réessayer le paiement

**Variables de template** :
- `order` : Détails de la commande
- `user` : Informations sur l'utilisateur
- `error` : Détails de l'erreur
- `retryUrl` : Lien pour réessayer le paiement
- `siteName` : Nom du site
- `siteUrl` : URL du site
- `supportEmail` : Email du support

---

### 4. Commande expédiée (`ORDER_SHIPPED`)

**Objectif** : Envoyé lorsqu'une commande est expédiée.

**Données requises** :
- `order` : Objet de la commande
- `user` : Utilisateur concerné
- `trackingInfo` : Informations de suivi

**Variables de template** :
- `order` : Détails de la commande
- `user` : Informations sur l'utilisateur
- `trackingInfo` : Informations de suivi (numéro, transporteur, etc.)
- `siteName` : Nom du site
- `siteUrl` : URL du site
- `supportEmail` : Email du support

---

### 5. Réinitialisation de mot de passe (`PASSWORD_RESET`)

**Objectif** : Envoyé lorsqu'un utilisateur demande une réinitialisation de mot de passe.

**Données requises** :
- `user` : Utilisateur concerné
- `resetUrl` : URL de réinitialisation

**Variables de template** :
- `user` : Informations sur l'utilisateur
- `resetUrl` : Lien de réinitialisation
- `siteName` : Nom du site
- `siteUrl` : URL du site

---

### 6. Vérification de compte (`ACCOUNT_VERIFICATION`)

**Objectif** : Envoyé pour vérifier l'adresse email d'un nouvel utilisateur.

**Données requises** :
- `user` : Nouvel utilisateur
- `verificationUrl` : URL de vérification

**Variables de template** :
- `user` : Informations sur l'utilisateur
- `verificationUrl` : Lien de vérification
- `siteName` : Nom du site
- `siteUrl` : URL du site

---

## Utilisation dans le code

### Envoyer un email avec un template

```javascript
import { emailService } from '../services';

// Exemple d'envoi d'email de confirmation de commande
await emailService.sendTemplateEmail('ORDER_CONFIRMATION', {
  order: orderDetails,
  user: userDetails
});
```

### Tester les templates d'emails

Pour tester tous les modèles d'emails, exécutez :

```bash
npm run test:email-templates
```

Ceci enverra un exemple de chaque type d'email à l'adresse configurée dans `TEST_EMAIL` ou `DEFAULT_FROM_EMAIL`.

## Personnalisation

### Ajouter un nouveau template

1. Créez un nouveau fichier EJS dans le dossier `templates/emails/`
2. Ajoutez la configuration du template dans `services/emailTemplates.js`
3. Testez le template avec `test:email-templates`

### Variables globales disponibles

Tous les templates ont accès aux variables suivantes :

- `siteName` : Nom du site (depuis les variables d'environnement)
- `siteUrl` : URL de base du site
- `siteLogo` : URL du logo du site
- `supportEmail` : Email du support
- `currentYear` : Année en cours
- `socialLinks` : Liens vers les réseaux sociaux

## Bonnes pratiques

- Utilisez des styles en ligne pour une meilleure compatibilité entre clients email
- Testez toujours les emails sur différents clients avant le déploiement
- Gardez les templates responsifs pour les appareils mobiles
- Incluez toujours un lien de désabonnement dans le pied de page
- Vérifiez que tous les liens sont absolus (commençant par http:// ou https://)
