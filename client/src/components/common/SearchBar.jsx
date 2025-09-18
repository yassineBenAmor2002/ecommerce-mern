import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  ClickAwayListener,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash';

// Mock search results - in a real app, this would come from an API
const mockSearchResults = (query) => {
  if (!query) return [];
  
  const allProducts = [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      price: 99.99,
      image: '/images/headphones.jpg',
      category: 'Electronics',
    },
    {
      id: '2',
      name: 'Smartphone Stand',
      price: 24.99,
      image: '/images/stand.jpg',
      category: 'Accessories',
    },
    {
      id: '3',
      name: 'Wireless Charging Pad',
      price: 29.99,
      image: '/images/charger.jpg',
      category: 'Electronics',
    },
    {
      id: '4',
      name: 'Mechanical Keyboard',
      price: 89.99,
      image: '/images/keyboard.jpg',
      category: 'Electronics',
    },
    {
      id: '5',
      name: 'Gaming Mouse',
      price: 59.99,
      image: '/images/mouse.jpg',
      category: 'Electronics',
    },
  ];

  const queryLower = query.toLowerCase();
  return allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(queryLower) ||
      product.category.toLowerCase().includes(queryLower)
  );
};

export default function SearchBar({ 
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  placeholder = 'Search products...',
  autoFocus = false,
  onSearch, // Optional callback when search is submitted
  sx = {},
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const debouncedSearch = useRef(
    debounce((query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsLoading(false);
        return;
      }
      
      // In a real app, you would make an API call here
      // For now, we're using mock data
      setTimeout(() => {
        const results = mockSearchResults(query);
        setSearchResults(results);
        setIsLoading(false);
      }, 300);
    }, 300)
  ).current;

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Update search query when URL changes (for back/forward navigation)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
  }, [location.search]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      setIsLoading(true);
      debouncedSearch(query);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchInputRef.current?.blur();
    
    if (searchQuery.trim()) {
      // Update URL with search query
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      
      // Call the onSearch callback if provided
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
    }
    
    setShowResults(false);
  };

  const handleResultClick = (product) => {
    navigate(`/products/${product.id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (searchQuery) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Use setTimeout to allow click events on search results to fire before hiding them
    setTimeout(() => {
      setIsFocused(false);
      setShowResults(false);
    }, 200);
  };

  // Close results when clicking outside
  const handleClickAway = () => {
    setShowResults(false);
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box 
        sx={{
          position: 'relative',
          width: fullWidth ? '100%' : 'auto',
          maxWidth: 600,
          mx: 'auto',
          ...sx,
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <TextField
            inputRef={searchInputRef}
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            placeholder={placeholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoComplete="off"
            autoFocus={autoFocus}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color={isFocused ? 'primary' : 'action'} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : searchQuery ? (
                    <IconButton
                      edge="end"
                      onClick={clearSearch}
                      size="small"
                      sx={{ mr: -1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2,
                ...(variant === 'outlined' && {
                  '& fieldset': {
                    borderRadius: 2,
                  },
                }),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
            }}
          />
        </form>

        {/* Search Results Dropdown */}
        <Fade in={showResults && (searchResults.length > 0 || isLoading)}>
          <Paper
            elevation={4}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              mt: 0.5,
              maxHeight: 400,
              overflow: 'auto',
              zIndex: theme.zIndex.modal,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              display: showResults ? 'block' : 'none',
            }}
          >
            {isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : searchResults.length > 0 ? (
              <List dense={isMobile}>
                {searchResults.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ListItem
                      button
                      onClick={() => handleResultClick(product)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={product.image}
                          alt={product.name}
                          variant="rounded"
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 1,
                            bgcolor: 'background.default',
                          }}
                        >
                          <ImageIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle2"
                            noWrap
                            sx={{ fontWeight: 500 }}
                          >
                            {product.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                            ${product.price.toFixed(2)}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < searchResults.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
                <ListItem
                  button
                  component="a"
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  sx={{
                    justifyContent: 'center',
                    color: 'primary.main',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  View all results for "{searchQuery}"
                </ListItem>
              </List>
            ) : searchQuery ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
              </Box>
            ) : null}
          </Paper>
        </Fade>
      </Box>
    </ClickAwayListener>
  );
}
