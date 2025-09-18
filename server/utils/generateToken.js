import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que les variables d'environnement nécessaires sont définies
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

// Options par défaut pour les tokens
const defaultOptions = {
  algorithm: 'HS256', // Algorithme de chiffrement
  issuer: 'ecommerce-api', // Émetteur du token
  audience: ['web', 'mobile'], // Public cible
};

/**
 * Génère un token d'accès JWT
 * @param {string} userId - ID de l'utilisateur
 * @param {string[]} [roles=[]] - Rôles de l'utilisateur
 * @param {Object} [additionalClaims={}] - Revendications supplémentaires
 * @returns {string} Token JWT
 */
const generateToken = (userId, roles = [], additionalClaims = {}) => {
  const payload = {
    sub: userId, // Sujet du token (l'utilisateur)
    roles,
    jti: crypto.randomBytes(16).toString('hex'), // Identifiant unique du token
    iat: Math.floor(Date.now() / 1000), // Date d'émission
    ...additionalClaims,
  };

  const options = {
    ...defaultOptions,
    expiresIn: process.env.JWT_EXPIRE || '15m', // 15 minutes par défaut
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Génère un token de rafraîchissement JWT
 * @param {string} userId - ID de l'utilisateur
 * @param {string} [fingerprint] - Empreinte numérique du dispositif
 * @returns {string} Token de rafraîchissement JWT
 */
const generateRefreshToken = (userId, fingerprint) => {
  const payload = {
    sub: userId,
    jti: crypto.randomBytes(16).toString('hex'),
    iat: Math.floor(Date.now() / 1000),
    type: 'refresh',
    ...(fingerprint && { fingerprint: crypto.createHash('sha256').update(fingerprint).digest('hex') }),
  };

  const options = {
    ...defaultOptions,
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d', // 7 jours par défaut
  };

  return jwt.sign(payload, process.env.JWT_SECRET, options);
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token JWT à vérifier
 * @param {boolean} [ignoreExpiration=false] - Ignorer l'expiration du token
 * @returns {Object} Payload décodé
 */
const verifyToken = (token, ignoreExpiration = false) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      ...defaultOptions,
      ignoreExpiration,
    });
  } catch (error) {
    // Améliorer les messages d'erreur
    if (error.name === 'TokenExpiredError') {
      const err = new Error('Token expiré');
      err.name = 'TokenExpiredError';
      err.expiredAt = error.expiredAt;
      throw err;
    }
    if (error.name === 'JsonWebTokenError') {
      const err = new Error('Token invalide');
      err.name = 'JsonWebTokenError';
      throw err;
    }
    throw error;
  }
};

/**
 * Vérifie et décode un token de rafraîchissement
 * @param {string} token - Token de rafraîchissement
 * @param {string} [fingerprint] - Empreinte numérique du dispositif
 * @returns {Object} Payload décodé
 */
const verifyRefreshToken = (token, fingerprint) => {
  const payload = verifyToken(token);
  
  // Vérifier que c'est bien un token de rafraîchissement
  if (payload.type !== 'refresh') {
    const error = new Error('Type de token invalide');
    error.name = 'TokenTypeError';
    throw error;
  }
  
  // Vérifier l'empreinte numérique si fournie
  if (fingerprint && payload.fingerprint) {
    const hashedFingerprint = crypto.createHash('sha256').update(fingerprint).digest('hex');
    if (hashedFingerprint !== payload.fingerprint) {
      const error = new Error('Empreinte numérique invalide');
      error.name = 'InvalidFingerprintError';
      throw error;
    }
  }
  
  return payload;
};

/**
 * Décode un token JWT sans vérification de signature
 * @param {string} token - Token JWT à décoder
 * @returns {Object} Payload décodé
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

/**
 * Récupère l'ID utilisateur à partir d'un token JWT
 * @param {string} token - Token JWT
 * @returns {string} ID de l'utilisateur
 */
const getUserIdFromToken = (token) => {
  const payload = verifyToken(token);
  return payload.sub; // sub contient l'ID de l'utilisateur
};

export {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getUserIdFromToken,
};
