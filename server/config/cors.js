import cors from 'cors';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Récupérer les origines autorisées depuis les variables d'environnement
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

// Configuration CORS sécurisée
const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (comme les applications mobiles ou les requêtes serveur à serveur)
    if (!origin) return callback(null, true);
    
    // Vérifier si l'origine est dans la liste des origines autorisées
    if (allowedOrigins.includes(origin) || 
        // Autoriser les sous-domaines en développement
        (process.env.NODE_ENV === 'development' && origin.endsWith('localhost'))) {
      return callback(null, true);
    }
    
    // Bloquer les requêtes d'origines non autorisées
    const error = new Error('Not allowed by CORS');
    error.status = 403;
    return callback(error);
  },
  
  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  
  // En-têtes autorisés
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-Access-Token',
    'X-Refresh-Token'
  ],
  
  // Exposer les en-têtes personnalisés
  exposedHeaders: [
    'X-Access-Token',
    'X-Refresh-Token',
    'X-Total-Count',
    'Content-Range'
  ],
  
  // Activer les cookies d'authentification
  credentials: true,
  
  // Durée de mise en cache des pré-vérifications CORS (en secondes)
  maxAge: 600, // 10 minutes
  
  // Activer les requêtes préalables (pre-flight) pour les méthodes complexes
  preflightContinue: false,
  
  // Options de succès (pour la compatibilité avec certains navigateurs)
  optionsSuccessStatus: 204
};

// Middleware CORS personnalisé
const corsMiddleware = (req, res, next) => {
  // Appliquer la configuration CORS
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      // Journalisation des erreurs CORS en développement
      if (process.env.NODE_ENV === 'development') {
        console.warn('CORS Error:', {
          origin: req.headers.origin,
          method: req.method,
          path: req.path,
          error: err.message
        });
      }
      
      // Répondre avec une erreur CORS appropriée
      return res.status(err.status || 403).json({
        success: false,
        error: 'Not allowed by CORS',
        message: 'The request was blocked by the CORS policy',
        details: process.env.NODE_ENV === 'development' ? {
          origin: req.headers.origin,
          allowedOrigins,
          method: req.method,
          path: req.path
        } : undefined
      });
    }
    
    // Continuer vers le prochain middleware
    next();
  });
};

export default corsMiddleware;
