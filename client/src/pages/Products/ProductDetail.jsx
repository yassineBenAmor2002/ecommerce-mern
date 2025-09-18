import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Rating,
  Divider,
  Tabs,
  Tab,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `product-tab-${index}`,
    'aria-controls': `product-tabpanel-${index}`,
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState('');
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [productRes, relatedRes, reviewsRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get(`/api/products?category=${product?.category?._id}&limit=4`),
          axios.get(`/api/products/${id}/reviews`),
        ]);
        
        setProduct(productRes.data);
        setRelatedProducts(relatedRes.data.products);
        setReviews(reviewsRes.data);
        
        // Check if product is in user's favorites
        if (isAuthenticated && user) {
          const userRes = await axios.get(`/api/users/me`);
          setIsFavorite(userRes.data.favorites?.includes(productRes.data._id) || false);
        }
        
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement du produit');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isAuthenticated, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleQuantityChange = (operation) => {
    if (operation === 'increment' && quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    } else if (operation === 'decrement' && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setAddToCartLoading(true);
      await axios.post('/api/cart', { productId: id, quantity });
      // Show success message or notification
      alert('Produit ajouté au panier avec succès!');
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier', err);
      alert('Erreur lors de l\'ajout au panier');
    } finally {
      setAddToCartLoading(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      if (isFavorite) {
        await axios.delete(`/api/users/favorites/${id}`);
      } else {
        await axios.post(`/api/users/favorites/${id}`);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des favoris', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Découvrez ${product.name} sur notre boutique`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier!');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }

    try {
      const res = await axios.post(`/api/products/${id}/reviews`, review);
      setReviews([res.data, ...reviews]);
      setReview({ rating: 5, comment: '' });
      setReviewError('');
      
      // Update product rating
      const productRes = await axios.get(`/api/products/${id}`);
      setProduct(productRes.data);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Chargement du produit...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Retour aux produits
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography>Produit non trouvé</Typography>
        <Button variant="contained" onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Voir tous les produits
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', pt: '100%' }}>
              <CardMedia
                component="img"
                image={product.images?.[selectedImage] || '/placeholder-product.jpg'}
                alt={product.name}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  p: 2,
                }}
              />
              {product.salePrice && (
                <Chip
                  label="Promo"
                  color="error"
                  size="medium"
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    px: 1,
                  }}
                />
              )}
            </Box>
          </Card>
          
          {/* Thumbnail Navigation */}
          {product.images?.length > 1 && (
            <Grid container spacing={1} sx={{ px: 1 }}>
              {product.images.map((img, index) => (
                <Grid item key={index} xs={3} sm={2} md={3} lg={2}>
                  <Box
                    onClick={() => setSelectedImage(index)}
                    sx={{
                      cursor: 'pointer',
                      border: selectedImage === index ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
                      borderRadius: 1,
                      overflow: 'hidden',
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={img}
                      alt={`${product.name} - Vue ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating || 0} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.numReviews || 0} avis) | {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              {product.salePrice ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h4" color="error" sx={{ fontWeight: 'bold', mr: 2 }}>
                    {product.salePrice.toFixed(2)} €
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {product.price.toFixed(2)} €
                  </Typography>
                  <Chip
                    label={`-${Math.round((1 - product.salePrice / product.price) * 100)}%`}
                    color="error"
                    size="small"
                    sx={{ ml: 2, fontWeight: 'bold' }}
                  />
                </Box>
              ) : (
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {product.price.toFixed(2)} €
                </Typography>
              )}
            </Box>
            
            <Typography variant="body1" paragraph>
              {product.shortDescription || 'Aucune description disponible.'}
            </Typography>
            
            {product.sku && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Référence: {product.sku}
              </Typography>
            )}
            
            {product.brand && (
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Marque: {product.brand.name}
              </Typography>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            {/* Quantity Selector */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mr: 2, minWidth: 100 }}>
                Quantité:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  onClick={() => handleQuantityChange('decrement')}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <TextField
                  value={quantity}
                  size="small"
                  type="number"
                  inputProps={{ 
                    min: 1, 
                    max: product.stock || 10,
                    style: { 
                      textAlign: 'center',
                      width: '50px',
                      '-moz-appearance': 'textfield'
                    }
                  }}
                  sx={{ 
                    '& .MuiOutlinedInput-root': { 
                      '& fieldset': { border: 'none' },
                      '&:hover fieldset': { border: 'none' },
                      '&.Mui-focused fieldset': { border: 'none' },
                    },
                    '& input[type=number]': {
                      '-moz-appearance': 'textfield',
                    },
                    '& input[type=number]::-webkit-outer-spin-button,
                    & input[type=number]::-webkit-inner-spin-button': {
                      '-webkit-appearance': 'none',
                      margin: 0,
                    },
                  }}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value >= 1 && value <= (product.stock || 10)) {
                      setQuantity(value);
                    }
                  }}
                />
                <IconButton 
                  onClick={() => handleQuantityChange('increment')}
                  disabled={quantity >= (product.stock || 10)}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                {product.stock} disponible{product.stock > 1 ? 's' : ''}
              </Typography>
            </Box>
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCartIcon />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addToCartLoading}
                sx={{ flex: isMobile ? '1 1 100%' : '0 1 auto', minWidth: 200 }}
              >
                {addToCartLoading ? 'Ajout en cours...' : 'Ajouter au panier'}
              </Button>
              
              <Button
                variant="outlined"
                size="large"
                startIcon={isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                onClick={handleAddToFavorites}
                sx={{ flex: isMobile ? '1 1 100%' : '0 1 auto' }}
              >
                {isFavorite ? 'Favori' : 'Favoris'}
              </Button>
              
              <IconButton 
                onClick={handleShare}
                color="primary"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  ml: 'auto',
                  display: isMobile ? 'none' : 'flex'
                }}
              >
                <ShareIcon />
              </IconButton>
            </Box>
            
            {/* Product Meta */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Catégorie: {product.category?.name || 'Non catégorisé'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Livraison: Livraison standard gratuite
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Tabs */}
      <Box sx={{ width: '100%', mt: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Description" {...a11yProps(0)} />
            <Tab label="Spécifications" {...a11yProps(1)} />
            <Tab label={`Avis (${reviews.length})`} {...a11yProps(2)} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1" paragraph>
            {product.description || 'Aucune description détaillée disponible pour ce produit.'}
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {product.specifications && product.specifications.length > 0 ? (
            <Grid container spacing={2}>
              {product.specifications.map((spec, index) => (
                <React.Fragment key={index}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {spec.name}:
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={9}>
                    <Typography variant="body1">
                      {Array.isArray(spec.value) ? spec.value.join(', ') : spec.value}
                    </Typography>
                  </Grid>
                </React.Fragment>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1">
              Aucune spécification technique disponible pour ce produit.
            </Typography>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            {/* Review Form */}
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>
                Donnez votre avis
              </Typography>
              
              {reviewError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {reviewError}
                </Alert>
              )}
              
              <form onSubmit={handleReviewSubmit}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="legend">Note</Typography>
                  <Rating
                    name="rating"
                    value={review.rating}
                    onChange={(e, newValue) => {
                      setReview({ ...review, rating: newValue });
                    }}
                  />
                </Box>
                
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Votre avis"
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  required
                  sx={{ mb: 2 }}
                />
                
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={!isAuthenticated}
                >
                  {isAuthenticated ? 'Publier mon avis' : 'Connectez-vous pour laisser un avis'}
                </Button>
              </form>
            </Grid>
            
            {/* Reviews List */}
            <Grid item xs={12} md={7}>
              {reviews.length > 0 ? (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Avis clients ({reviews.length})
                  </Typography>
                  <Box sx={{ maxHeight: 400, overflowY: 'auto', pr: 2 }}>
                    {reviews.map((review) => (
                      <Box key={review._id} sx={{ mb: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {review.user?.name || 'Anonyme'}
                          </Typography>
                          <Rating value={review.rating} size="small" readOnly />
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                        <Typography variant="body2">
                          {review.comment}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography variant="body1">
                  Aucun avis pour le moment. Soyez le premier à donner votre avis !
                </Typography>
              )}
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" gutterBottom>
            Produits similaires
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts
              .filter(p => p._id !== product._id)
              .slice(0, 4)
              .map((product) => (
                <Grid item key={product._id} xs={6} sm={4} md={3}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box 
                      sx={{ 
                        position: 'relative', 
                        pt: '100%',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/products/${product._id}`)}
                    >
                      <CardMedia
                        component="img"
                        image={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          p: 1,
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        gutterBottom 
                        variant="subtitle1" 
                        component="h3"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          height: '3em',
                          lineHeight: '1.5em',
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={product.rating || 0} size="small" readOnly />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.numReviews || 0})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.salePrice ? (
                          <>
                            <Typography variant="h6" color="error" sx={{ fontWeight: 'bold', mr: 1 }}>
                              {product.salePrice.toFixed(2)} €
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ textDecoration: 'line-through' }}
                            >
                              {product.price.toFixed(2)} €
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {product.price.toFixed(2)} €
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default ProductDetail;
