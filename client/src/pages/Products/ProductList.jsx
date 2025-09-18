import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Rating,
  TextField,
  InputAdornment,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sort: 'newest',
  });
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        search: searchTerm,
        ...filters,
      });
      
      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchTerm, filters]);

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      // Rediriger vers la page de connexion
      window.location.href = '/login';
      return;
    }
    
    try {
      await axios.post('/api/cart', { productId, quantity: 1 });
      // Afficher une notification de succès
      alert('Produit ajouté au panier');
    } catch (err) {
      console.error('Erreur lors de l\'ajout au panier', err);
      alert('Erreur lors de l\'ajout au panier');
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setPage(1);
  };

  if (loading && products.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Chargement des produits...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Nos Produits
        </Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/admin/products/new"
            startIcon={<AddIcon />}
          >
            Ajouter un produit
          </Button>
        )}
      </Box>

      {/* Search and Filter Bar */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      label="Catégorie"
                    >
                      <MenuItem value="">Toutes les catégories</MenuItem>
                      <MenuItem value="electronics">Électronique</MenuItem>
                      <MenuItem value="clothing">Vêtements</MenuItem>
                      <MenuItem value="books">Livres</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Trier par</InputLabel>
                    <Select
                      name="sort"
                      value={filters.sort}
                      onChange={handleFilterChange}
                      label="Trier par"
                    >
                      <MenuItem value="newest">Plus récent</MenuItem>
                      <MenuItem value="price_asc">Prix croissant</MenuItem>
                      <MenuItem value="price_desc">Prix décroissant</MenuItem>
                      <MenuItem value="top_rated">Mieux notés</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FilterIcon />}
                    onClick={() => {
                      // Logique pour afficher plus de filtres
                    }}
                  >
                    Filtres
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Box>

      {error && (
        <Box sx={{ mb: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Product Grid */}
      <Grid container spacing={3}>
        {products.map((product) => (
          <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ position: 'relative', pt: '100%' }}>
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
                  }}
                />
                {product.salePrice && (
                  <Chip
                    label="Promo"
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      fontWeight: 'bold',
                    }}
                  />
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2" noWrap>
                  {product.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={product.rating || 0} precision={0.5} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({product.numReviews || 0})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                </Typography>
              </Box>
              <CardActions sx={{ mt: 'auto', p: 2 }}>
                <Button
                  size="small"
                  color="primary"
                  variant="contained"
                  fullWidth
                  startIcon={<ShoppingCartIcon />}
                  onClick={() => handleAddToCart(product._id)}
                >
                  Ajouter au panier
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
};

export default ProductList;
