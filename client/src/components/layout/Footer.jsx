import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from '@mui/icons-material';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* About Us */}
            <Grid item xs={12} sm={6} md={4}>
              <div className="footer-widget">
                <Typography variant="h6" className="footer-title">
                  About Us
                </Typography>
                <Typography variant="body2" className="footer-about">
                  Welcome to our e-commerce store, where you can find the latest trends in fashion, 
                  electronics, home goods, and more. We're committed to providing high-quality 
                  products with excellent customer service.
                </Typography>
                <div className="social-links">
                  <MuiLink href="#" className="social-link">
                    <Facebook />
                  </MuiLink>
                  <MuiLink href="#" className="social-link">
                    <Twitter />
                  </MuiLink>
                  <MuiLink href="#" className="social-link">
                    <Instagram />
                  </MuiLink>
                  <MuiLink href="#" className="social-link">
                    <LinkedIn />
                  </MuiLink>
                </div>
              </div>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={6} sm={3} md={2}>
              <div className="footer-widget">
                <Typography variant="h6" className="footer-title">
                  Shop
                </Typography>
                <ul className="footer-links">
                  <li>
                    <MuiLink component={Link} to="/products?category=men" className="footer-link">
                      Men's Fashion
                    </MuiLink>
                  </li>
                  <li>
                    <MuiLink component={Link} to="/products?category=women" className="footer-link">
                      Women's Fashion
                    </MuiLink>
                  </li>
                  <li>
                    <MuiLink component={Link} to="/products?category=electronics" className="footer-link">
                      Electronics
                    </MuiLink>
                  </li>
                  <li>
                    <MuiLink component={Link} to="/products?category=home" className="footer-link">
                      Home & Living
                    </MuiLink>
                  </li>
                  <li>
                    <MuiLink component={Link} to="/products" className="footer-link">
                      View All Products
                    </MuiLink>
                  </li>
                </ul>
              </div>
            </Grid>

            {/* Customer Service */}
            <Grid item xs={6} sm={3} md={2}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Customer Service
              </Typography>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
                <li>
                  <MuiLink component={Link} to="/contact" color="text.secondary" display="block" mb={1}>
                    Contact Us
                  </MuiLink>
                </li>
                <li>
                  <MuiLink component={Link} to="/faq" color="text.secondary" display="block" mb={1}>
                    FAQ
                  </MuiLink>
                </li>
                <li>
                  <MuiLink component={Link} to="/shipping" color="text.secondary" display="block" mb={1}>
                    Shipping Info
                  </MuiLink>
                </li>
                <li>
                  <MuiLink component={Link} to="/returns" color="text.secondary" display="block" mb={1}>
                    Returns & Exchanges
                  </MuiLink>
                </li>
              </Box>
            </Grid>
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/shipping" color="text.secondary" display="block" mb={1}>
                  Shipping Info
                </MuiLink>
              </li>
              <li>
                <MuiLink component={Link} to="/returns" color="text.secondary" display="block" mb={1}>
                  Returns & Exchanges
                </MuiLink>
              </li>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              123 Fashion Street
              <br />
              New York, NY 10001
              <br />
              United States
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Email: info@stylehub.com
              <br />
              Phone: (123) 456-7890
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} StyleHub. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
            <MuiLink component={Link} to="/privacy-policy" color="text.secondary" variant="body2">
              Privacy Policy
            </MuiLink>
            <MuiLink component={Link} to="/terms" color="text.secondary" variant="body2">
              Terms of Service
            </MuiLink>
            <MuiLink component={Link} to="/sitemap" color="text.secondary" variant="body2">
              Sitemap
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
