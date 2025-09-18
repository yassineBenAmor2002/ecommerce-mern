# Configuration du Service d'Emails

Ce document explique comment configurer le service d'emails pour l'envoi de notifications par e-mail dans l'application E-Commerce MERN.

## Variables d'Environnement Requises

Assurez-vous que les variables d'environnement suivantes sont définies dans votre fichier `.env` :

```env
# Configuration SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false  # true pour le port 465, false pour les autres
SMTP_USER=votre_email@example.com
SMTP_PASS=votre_mot_de_passe

# Configuration de l'expéditeur
EMAIL_FROM_NAME="Nom de Votre Boutique"
EMAIL_FROM_ADDRESS=noreply@votredomaine.com
SUPPORT_EMAIL=support@votredomaine.com

# Informations du site
SITE_NAME="Votre Boutique E-Commerce"
SITE_LOGO_URL=https://votredomaine.com/logo.png
FRONTEND_URL=http://localhost:3000
```

## Configuration du Serveur SMTP

Le service utilise Nodemailer avec les paramètres SMTP. Voici comment configurer quelques fournisseurs courants :

### Gmail (non recommandé pour la production)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre@gmail.com
SMTP_PASS=votre_mot_de_passe_app  # Utilisez un mot de passe d'application
```

> **Important** : Activez l'authentification à deux facteurs et créez un mot de passe d'application dans votre compte Google.

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=votre_cle_api_sendgrid
```

### Mailtrap (pour le développement)

```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=votre_username_mailtrap
SMTP_PASS=votre_mot_de_passe_mailtrap
```

## Modèles d'Emails

Les modèles d'emails sont stockés dans le dossier `server/templates/emails/` et utilisent le moteur de template EJS.

### Fichiers de Modèle

- `order-confirmation.ejs` : Confirmation de commande
- `payment-failed.ejs` : Échec de paiement

## Utilisation dans le Code

### Envoyer un E-mail de Confirmation de Commande

```javascript
import { sendOrderConfirmationEmail } from '../services/emailService';

// Dans votre gestionnaire de commande
await sendOrderConfirmationEmail(order, user);
```

### Envoyer un E-mail d'Échec de Paiement

```javascript
import { sendPaymentFailedEmail } from '../services/emailService';

// Lorsqu'un paiement échoue
await sendPaymentFailedEmail(order, user, errorMessage);
```
## Personnalisation des Modèles

Pour personnaliser les modèles d'e-mails :

1. Modifiez les fichiers EJS dans `server/templates/emails/`
2. Utilisez les variables passées au modèle (consultez les commentaires dans les fichiers de modèle)
3. Le style est inclus directement dans les balises `<style>` de chaque modèle

## Dépannage

### Les e-mails ne sont pas envoyés

1. Vérifiez les logs du serveur pour les erreurs
2. Vérifiez que les variables d'environnement sont correctement définies
3. Testez la connexion SMTP avec un client de messagerie

### Les e-mails arrivent en spam

1. Assurez-vous que votre domaine dispose d'enregistrements SPF, DKIM et DMARC correctement configurés
2. Évitez d'utiliser des mots déclencheurs de spam dans l'objet et le corps de l'e-mail
3. Utilisez une adresse d'expédition professionnelle avec un domaine vérifié

## Sécurité

- Ne commettez jamais de mots de passe ou de clés API dans le code source
- Utilisez des variables d'environnement pour les informations sensibles
- Limitez les permissions du compte SMTP au strict nécessaire
- Activez l'authentification à deux facteurs sur votre compte de messagerie
