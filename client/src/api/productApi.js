import axios from 'axios';

// Créer une instance axios avec une URL de base
const API_URL = '/api/products';

// Configuration par défaut pour les requêtes axios
const axiosConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};

// Fonction pour gérer les erreurs de l'API
const handleApiError = (error) => {
  if (error.response) {
    // La requête a été faite et le serveur a répondu avec un statut d'erreur
    throw new Error(
      error.response.data?.message || 'Une erreur est survenue lors de la requête au serveur.'
    );
  } else if (error.request) {
    // La requête a été faite mais aucune réponse n'a été reçue
    throw new Error('Aucune réponse du serveur. Veuillez vérifier votre connexion Internet.');
  } else {
    // Une erreur s'est produite lors de la configuration de la requête
    throw new Error('Erreur lors de la configuration de la requête.');
  }
};

// Fonction pour récupérer tous les produits avec pagination, tri et filtres
export const getProducts = async (params = {}) => {
  try {
    const response = await axios.get(API_URL, { params }, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour récupérer un produit par son ID
export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour créer un nouveau produit (admin)
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();
    
    // Ajouter les champs du produit au FormData
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Ajouter chaque fichier d'image
        productData[key].forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            // Si c'est une URL d'image existante, l'ajouter comme chaîne
            formData.append(`existingImages[${index}]`, image);
          }
        });
      } else if (key === 'specifications' && productData[key]) {
        // Sérialiser les spécifications en JSON
        formData.append(key, JSON.stringify(productData[key]));
      } else if (productData[key] !== null && productData[key] !== undefined) {
        // Ajouter les autres champs
        formData.append(key, productData[key]);
      }
    });
    
    const response = await axios.post(API_URL, formData, {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour mettre à jour un produit (admin)
export const updateProduct = async (id, productData) => {
  try {
    const formData = new FormData();
    
    // Ajouter les champs du produit au FormData
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData[key]) {
        // Ajouter chaque fichier d'image
        productData[key].forEach((image, index) => {
          if (image instanceof File) {
            formData.append('images', image);
          } else if (typeof image === 'string') {
            // Si c'est une URL d'image existante, l'ajouter comme chaîne
            formData.append(`existingImages[${index}]`, image);
          }
        });
      } else if (key === 'specifications' && productData[key]) {
        // Sérialiser les spécifications en JSON
        formData.append(key, JSON.stringify(productData[key]));
      } else if (productData[key] !== null && productData[key] !== undefined) {
        // Ajouter les autres champs
        formData.append(key, productData[key]);
      }
    });
    
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour supprimer un produit (admin)
export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour récupérer les produits par catégorie
export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/category/${categoryId}`, { 
      params,
      ...axiosConfig 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour rechercher des produits
export const searchProducts = async (query, params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/search`, { 
      params: { q: query, ...params },
      ...axiosConfig 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour obtenir les produits les plus vendus
export const getTopProducts = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_URL}/top`, { 
      params: { limit },
      ...axiosConfig 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour obtenir les produits similaires
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}/related`, { 
      params: { limit },
      ...axiosConfig 
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour téléverser des images de produits
export const uploadProductImages = async (productId, files) => {
  try {
    const formData = new FormData();
    
    // Ajouter chaque fichier au FormData
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await axios.post(
      `${API_URL}/${productId}/images`,
      formData,
      {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour supprimer une image de produit
export const deleteProductImage = async (productId, imageId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/${productId}/images/${imageId}`,
      axiosConfig
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour mettre à jour le statut d'un produit (actif/inactif)
export const updateProductStatus = async (productId, isActive) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${productId}/status`,
      { isActive },
      axiosConfig
    );
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour obtenir les statistiques des produits (admin)
export const getProductStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour obtenir les options de filtrage disponibles
export const getFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/filters/options`, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Fonction pour obtenir les produits en vedette
export const getFeaturedProducts = async (limit = 8) => {
  try {
    const response = await axios.get(`${API_URL}/featured?limit=${limit}`, axiosConfig);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default {
  getProducts,
  getProductById,
  createProduct,
  getFeaturedProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  getTopProducts,
  getRelatedProducts,
  uploadProductImages,
  deleteProductImage,
  updateProductStatus,
  getProductStats,
  getFilterOptions,
};
