import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Box,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const footerLinks = [
    { title: 'Shop', links: ['New Arrivals', 'Best Sellers', 'Sale'] },
    { 
      title: 'Customer Service', 
      links: ['Contact Us', 'FAQs', 'Shipping & Returns', 'Size Guide'] 
    },
    { 
      title: 'About Us', 
      links: ['Our Story', 'Sustainability', 'Careers', 'Press'] 
    },
  ];

  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.secondary,
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={6} md={4} key={section.title}>
              <Typography 
                variant="h6" 
                color="text.primary" 
                gutterBottom
                sx={{ fontWeight: 600 }}
              >
                {section.title}
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: 'none' }}>
                {section.links.map((item) => (
                  <li key={item}>
                    <Link 
                      component={RouterLink}
                      to="#" 
                      color="inherit"
                      underline="hover"
                      sx={{
                        display: 'inline-block',
                        py: 0.5,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </Box>
            </Grid>
          ))}
          
          <Grid item xs={12} sm={6} md={4}>
            <Typography 
              variant="h6" 
              color="text.primary" 
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Subscribe to Our Newsletter
            </Typography>
            <Typography variant="body2" gutterBottom>
              Get the latest updates on new products and upcoming sales
            </Typography>
            <Box component="form" sx={{ mt: 2, display: 'flex' }}>
              <input
                type="email"
                placeholder="Your email address"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: '4px 0 0 4px',
                  fontSize: '0.875rem',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  border: 'none',
                  padding: '0 16px',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                Subscribe
              </button>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <IconButton 
                color="inherit" 
                aria-label="Facebook"
                component="a"
                href="https://facebook.com"
                target="_blank"
                rel="noopener"
              >
                <Facebook />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Twitter"
                component="a"
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
              >
                <Twitter />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Instagram"
                component="a"
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
              >
                <Instagram />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} E-Commerce Store. All rights reserved.
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Link 
                component={RouterLink}
                to="/privacy-policy" 
                color="text.secondary"
                variant="body2"
                underline="hover"
              >
                Privacy Policy
              </Link>
              <Link 
                component={RouterLink}
                to="/terms-of-service" 
                color="text.secondary"
                variant="body2"
                underline="hover"
              >
                Terms of Service
              </Link>
              <Link 
                component={RouterLink}
                to="/shipping-policy" 
                color="text.secondary"
                variant="body2"
                underline="hover"
              >
                Shipping Policy
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
