import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  useTheme,
  Paper,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function NotFound() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 4, md: 8 },
          textAlign: 'center',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '6rem', sm: '8rem' },
              fontWeight: 700,
              lineHeight: 1,
              color: theme.palette.primary.main,
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2 }}
          >
            Oops! Page Not Found
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}
          >
            The page you are looking for might have been removed, had its name
            changed, or is temporarily unavailable.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ textTransform: 'none' }}
            >
              Back to Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.history.back()}
              sx={{ textTransform: 'none' }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
