import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Options de connexion sécurisées
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout après 5s au lieu des 30s par défaut
  socketTimeoutMS: 45000, // Fermer les sockets après 45s d'inactivité
  family: 4, // Utiliser IPv4, ignorer IPv6
  // Activer le monitoring de la connexion
  heartbeatFrequencyMS: 10000, // Envoyer un heartbeat toutes les 10s
  // Désactiver les fonctionnalités obsolètes
  useCreateIndex: true,
  useFindAndModify: false,
  // Configuration du pool de connexions
  maxPoolSize: 10, // Nombre maximum de sockets dans le pool de connexions
  minPoolSize: 1,  // Nombre minimum de sockets dans le pool de connexions
  maxIdleTimeMS: 30000, // Temps maximum d'inactivité d'une connexion dans le pool
  // Journalisation
  monitorCommands: process.env.NODE_ENV === 'development',
  // Réessayer les opérations
  retryWrites: true,
  retryReads: true,
  // Sécurité
  ssl: process.env.NODE_ENV === 'production',
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Authentification
  authSource: 'admin',
  // Compression
  compressors: ['zlib', 'snappy', 'zstd'],
  zlibCompressionLevel: 9, // Niveau de compression maximum
};

// Journalisation des requêtes en développement
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`MongoDB: ${collectionName}.${method}`, JSON.stringify(query), doc || '');
  });
}

// Gestion des erreurs de connexion
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Gestion de la déconnexion
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);
    console.log(`   - Database: ${conn.connection.db.databaseName}`.gray);
    console.log(`   - Port: ${conn.connection.port}`.gray);
    console.log(`   - Env: ${process.env.NODE_ENV}`.gray);
    
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
    console.error('   - Vérifiez que MongoDB est en cours d\'exécution'.gray);
    console.error('   - Vérifiez la connexion réseau'.gray);
    console.error('   - Vérifiez les identifiants de connexion'.gray);
    
    // Sortir avec un code d'erreur pour les conteneurs/Orchestration
    process.exit(1);
  }
};

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default connectDB;
