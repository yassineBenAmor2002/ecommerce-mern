import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Charger les variables d'environnement
dotenv.config();

// Vérifier les variables d'environnement requises
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
  'FACEBOOK_APP_ID', 'FACEBOOK_APP_SECRET',
  'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET',
  'API_URL', 'FRONTEND_URL'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Variable d'environnement manquante: ${envVar}`);
    process.exit(1);
  }
}

// Configuration des URLs de callback
const CALLBACK_BASE_URL = `${process.env.API_URL}/api/v1/auth`;
const FRONTEND_CALLBACK_URL = `${process.env.FRONTEND_URL}/auth/callback`;

// ===================================
// Configuration de la sérialisation utilisateur
// ===================================

/**
 * Sérialise l'utilisateur pour la session
 * Ne stocke que l'ID de l'utilisateur dans la session
 */
passport.serializeUser((user, done) => {
  done(null, user.id);
});

/**
 * Désérialise l'utilisateur à partir de la session
 * Récupère l'utilisateur complet à partir de la base de données
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    done(null, user);
  } catch (error) {
    console.error('Erreur de désérialisation utilisateur:', error);
    done(error, null);
  }
});

// ===================================
// Stratégie Google OAuth 2.0
// ===================================
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${CALLBACK_BASE_URL}/google/callback`,
  proxy: true, // Nécessaire pour les proxies inverses (Nginx, Heroku, etc.)
  scope: ['profile', 'email'],
  state: true, // Active la vérification de l'état pour la sécurité CSRF
  passReqToCallback: true, // Passe la requête au callback
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // Vérifier que l'email est disponible
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      return done(new Error('Aucune adresse email trouvée dans le profil Google'), null);
    }

    // Créer un identifiant unique pour cette connexion
    const providerId = `google_${profile.id}`;
    
    // Vérifier si un utilisateur existe déjà avec ce provider
    let user = await User.findOne({ 'social.providerId': providerId });
    
    // Si l'utilisateur n'existe pas, vérifier par email
    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        // L'utilisateur existe mais n'a pas ce provider, l'ajouter
        user.social = user.social || {};
        user.social.google = {
          id: profile.id,
          providerId,
          email,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          accessToken,
          refreshToken,
          lastLogin: new Date()
        };
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      } else {
        // Créer un nouvel utilisateur s'il n'existe pas
        user = await User.create({
          name: profile.displayName || email.split('@')[0],
          email,
          password: await bcrypt.genSalt(12),
          isEmailVerified: true,
          social: {
            google: {
              id: profile.id,
              providerId,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
              lastLogin: new Date()
            }
          },
          avatar: profile.photos?.[0]?.value
        });
      }
    } else if (!user.social.google) {
      // Mettre à jour les informations du provider si nécessaire
      user.social.google = {
        id: profile.id,
        providerId,
        email,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
        lastLogin: new Date()
      };
      await user.save({ validateBeforeSave: false });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return done(null, user);
  } catch (error) {
    console.error('Erreur lors de l\'authentification Google:', error);
    return done(error, null);
  }
}));

// ===================================
// Stratégie Facebook OAuth 2.0
// ===================================
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${CALLBACK_BASE_URL}/facebook/callback`,
  profileFields: ['id', 'emails', 'name', 'displayName', 'photos'],
  proxy: true,
  passReqToCallback: true,
  scope: ['email', 'public_profile'],
  enableProof: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      return done(new Error('Aucune adresse email trouvée dans le profil Facebook'), null);
    }

    const providerId = `facebook_${profile.id}`;
    let user = await User.findOne({ 'social.providerId': providerId });
    
    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        // Mettre à jour l'utilisateur existant avec les informations Facebook
        user.social = user.social || {};
        user.social.facebook = {
          id: profile.id,
          providerId,
          email,
          name: profile.displayName,
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          avatar: profile.photos?.[0]?.value,
          accessToken,
          refreshToken,
          lastLogin: new Date()
        };
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      } else {
        // Créer un nouvel utilisateur
        user = await User.create({
          name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || email.split('@')[0],
          email,
          password: await bcrypt.genSalt(12),
          isEmailVerified: true,
          social: {
            facebook: {
              id: profile.id,
              providerId,
              email,
              name: profile.displayName,
              firstName: profile.name?.givenName,
              lastName: profile.name?.familyName,
              avatar: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
              lastLogin: new Date()
            }
          },
          avatar: profile.photos?.[0]?.value
        });
      }
    } else if (!user.social.facebook) {
      // Mettre à jour les informations du provider si nécessaire
      user.social.facebook = {
        id: profile.id,
        providerId,
        email,
        name: profile.displayName,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
        lastLogin: new Date()
      };
      await user.save({ validateBeforeSave: false });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return done(null, user);
  } catch (error) {
    console.error('Erreur lors de l\'authentification Facebook:', error);
    return done(error, null);
  }
}));

// ===================================
// Stratégie GitHub OAuth 2.0
// ===================================
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: `${CALLBACK_BASE_URL}/github/callback`,
  scope: ['user:email'],
  proxy: true,
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    // GitHub peut ne pas retourner d'email dans le profil
    let email = profile.emails?.[0]?.value?.toLowerCase();
    
    // Si pas d'email dans le profil, essayer de le récupérer via l'API GitHub
    if (!email && accessToken) {
      try {
        const response = await fetch('https://api.github.com/user/emails', {
          headers: { 'Authorization': `token ${accessToken}` }
        });
        
        if (response.ok) {
          const emails = await response.json();
          const primaryEmail = emails.find(e => e.primary && e.verified);
          if (primaryEmail) {
            email = primaryEmail.email.toLowerCase();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des emails GitHub:', error);
      }
    }
    
    if (!email) {
      return done(new Error('Impossible de récupérer une adresse email vérifiée depuis GitHub'), null);
    }

    const providerId = `github_${profile.id}`;
    let user = await User.findOne({ 'social.providerId': providerId });
    
    if (!user) {
      user = await User.findOne({ email });
      
      if (user) {
        // Mettre à jour l'utilisateur existant avec les informations GitHub
        user.social = user.social || {};
        user.social.github = {
          id: profile.id,
          providerId,
          username: profile.username,
          email,
          name: profile.displayName || profile.username,
          avatar: profile.photos?.[0]?.value,
          accessToken,
          refreshToken,
          lastLogin: new Date()
        };
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      } else {
        // Créer un nouvel utilisateur
        user = await User.create({
          name: profile.displayName || profile.username || email.split('@')[0],
          email,
          password: await bcrypt.genSalt(12),
          isEmailVerified: true,
          social: {
            github: {
              id: profile.id,
              providerId,
              username: profile.username,
              email,
              name: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value,
              accessToken,
              refreshToken,
              lastLogin: new Date()
            }
          },
          avatar: profile.photos?.[0]?.value
        });
      }
    } else if (!user.social.github) {
      // Mettre à jour les informations du provider si nécessaire
      user.social.github = {
        id: profile.id,
        providerId,
        username: profile.username,
        email,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken,
        lastLogin: new Date()
      };
      await user.save({ validateBeforeSave: false });
    }

    // Mettre à jour la date de dernière connexion
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    return done(null, user);
  } catch (error) {
    console.error('Erreur lors de l\'authentification GitHub:', error);
    return done(error, null);
  }
}));

// Middleware de gestion des erreurs Passport
const handlePassportError = (err, req, res, next) => {
  if (err) {
    console.error('Erreur Passport:', err);
    
    // Rediriger vers la page de connexion avec un message d'erreur
    const errorMessage = encodeURIComponent(err.message || 'Une erreur est survenue lors de l\'authentification');
    return res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
  }
  next();
};

export { handlePassportError };

export default passport;
