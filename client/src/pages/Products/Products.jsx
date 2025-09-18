import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Pagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Drawer,
  IconButton,
  Divider,
  Slider,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';

// Sample product data
const products = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 200) + 20,
  image: `https://via.placeholder.com/300x400?text=Product+${i + 1}`,
  category: ['Clothing', 'Electronics', 'Accessories', 'Shoes'][Math.floor(Math.random() * 4)],
  rating: (Math.random() * 2 + 3).toFixed(1),
  reviews: Math.floor(Math.random() * 100),
  isNew: Math.random() > 0.7,
  isSale: Math.random() > 0.8,
}));

const categories = [...new Set(products.map((p) => p.category))];

const Products = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for filters
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return b.id - a.id;
        default:
          return 0;
      }
    });

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
    setCurrentPage(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 200]);
    setSearchQuery('');
    setSortBy('featured');
  };

  // Filter sidebar content
  const filterDrawer = (
    <Box sx={{ width: 280, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <Button onClick={clearAllFilters}>Clear all</Button>
      </Box>

      {/* Price Range Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Price Range
        </Typography>
        <Slider
          value={priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={200}
          valueLabelFormat={(value) => `$${value}`}
          sx={{ mt: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2">${priceRange[0]}</Typography>
          <Typography variant="body2">${priceRange[1]}</Typography>
        </Box>
      </Box>

      {/* Categories Filter */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Categories
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {categories.map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  size="small"
                />
              }
              label={category}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Our Products
        </Typography>
        <Typography color="text.secondary">
          Discover our amazing collection of products
        </Typography>
      </Box>

      {/* Toolbar */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: 2,
          mb: 4,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: isMobile ? '100%' : '400px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
          />
          {isMobile && (
            <IconButton
              variant="outlined"
              onClick={() => setMobileFilterOpen(true)}
              sx={{ border: `1px solid ${theme.palette.divider}` }}
            >
              <TuneIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Sort by:
          </Typography>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
            <Select
              value={sortBy}
              onChange={handleSortChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Sort products' }}
            >
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="rating">Highest Rated</MenuItem>
            </Select>
          </FormControl>
          {!isMobile && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setMobileFilterOpen(true)}
            >
              Filters
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex' }}>
        {/* Desktop Filters */}
        {!isMobile && filterDrawer}

        {/* Mobile Filters Drawer */}
        <Drawer
          anchor="right"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: 300,
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={() => setMobileFilterOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          {filterDrawer}
        </Drawer>

        {/* Product Grid */}
        <Box sx={{ flexGrow: 1, pl: isMobile ? 0 : 4 }}>
          {filteredProducts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search or filter criteria
              </Typography>
              <Button variant="contained" onClick={clearAllFilters}>
                Clear all filters
              </Button>
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {currentProducts.map((product) => (
                  <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        '&:hover': {
                          boxShadow: 3,
                          '& .product-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                    >
                      {product.isNew && (
                        <Chip
                          label="New"
                          color="primary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 1,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                      {product.isSale && (
                        <Chip
                          label="Sale"
                          color="secondary"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 1,
                            fontWeight: 'bold',
                          }}
                        />
                      )}
                      <CardMedia
                        component="img"
                        height="250"
                        image={product.image}
                        alt={product.name}
                        sx={{
                          objectFit: 'cover',
                          backgroundColor: theme.palette.grey[100],
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" component="h3" gutterBottom>
                          {product.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                            {[...Array(5)].map((_, i) => (
                              <Box
                                key={i}
                                component="span"
                                sx={{
                                  color: i < Math.floor(product.rating) ? '#ffc107' : '#e0e0e0',
                                  fontSize: '1.2rem',
                                  lineHeight: 1,
                                }}
                              >
                                ★
                              </Box>
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            ({product.reviews} reviews)
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                          ${product.price.toFixed(2)}
                        </Typography>
                      </CardContent>
                      <CardActions 
                        className="product-actions"
                        sx={{
                          p: 2,
                          pt: 0,
                          opacity: 0,
                          transform: 'translateY(10px)',
                          transition: 'all 0.3s ease-in-out',
                          '&.MuiCardActions-spacing > :not(:first-of-type)': {
                            ml: 1,
                          },
                        }}
                      >
                        <Button 
                          size="small" 
                          variant="outlined" 
                          fullWidth
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained" 
                          fullWidth
                          color="primary"
                        >
                          Add to Cart
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Products;
