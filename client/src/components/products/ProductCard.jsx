import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  useTheme,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  RemoveRedEye,
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product, loading = false }) {
  const theme = useTheme();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  if (loading) {
    return (
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <Skeleton variant="rectangular" height={200} animation="wave" />
        <CardContent sx={{ flexGrow: 1 }}>
          <Skeleton width="80%" height={24} animation="wave" />
          <Skeleton width="60%" height={20} animation="wave" sx={{ mt: 1 }} />
          <Skeleton width="40%" height={20} animation="wave" sx={{ mt: 1 }} />
        </CardContent>
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Skeleton width="100%" height={36} animation="wave" />
        </CardActions>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ position: 'relative', pt: '100%' }}>
        <CardMedia
          component="img"
          image={product.images?.[0] || '/images/placeholder.jpg'}
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
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Tooltip title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}>
            <IconButton
              aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              }}
              sx={{
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'background.paper',
                  transform: 'scale(1.1)',
                },
              }}
            >
              {isWishlisted ? (
                <Favorite color="error" />
              ) : (
                <FavoriteBorder />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Quick view">
            <IconButton
              aria-label="Quick view"
              component={Link}
              to={`/products/${product.id}`}
              sx={{
                backgroundColor: 'background.paper',
                '&:hover': {
                  backgroundColor: 'background.paper',
                  transform: 'scale(1.1)',
                },
              }}
            >
              <RemoveRedEye />
            </IconButton>
          </Tooltip>
        </Box>
        {product.discount > 0 && (
          <Chip
            label={`-${product.discount}%`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold',
            }}
          />
        )}
        {product.isNew && (
          <Chip
            label="New"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: product.discount > 0 ? 40 : 8,
              left: 8,
              fontWeight: 'bold',
            }}
          />
        )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          component={Link}
          to={`/products/${product.id}`}
          sx={{
            fontWeight: 500,
            textDecoration: 'none',
            color: 'inherit',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
            minHeight: '3em',
            '&:hover': {
              color: 'primary.main',
            },
          }}
        >
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 'bold', mr: 1 }}
          >
            ${product.discount > 0 
              ? (product.price * (1 - product.discount / 100)).toFixed(2)
              : product.price.toFixed(2)}
          </Typography>
          {product.discount > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              ${product.price.toFixed(2)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box
              component="span"
              sx={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: product.stock > 0 ? 'success.main' : 'error.main',
                mr: 1,
              }}
            />
            <Typography variant="caption">
              {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Typography>
          </Box>
          {product.rating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box
                component="span"
                sx={{
                  color: theme.palette.warning.main,
                  mr: 0.5,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                ★
              </Box>
              <Typography variant="caption" color="text.secondary">
                {product.rating.toFixed(1)} ({product.reviewCount || 0})
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddShoppingCart />}
          disabled={product.stock <= 0}
          onClick={(e) => {
            e.preventDefault();
            addToCart({ ...product, quantity: 1 });
          }}
          sx={{
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </CardActions>
    </Card>
  );
}
