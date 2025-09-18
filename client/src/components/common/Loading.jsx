import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

export default function Loading({ message = 'Loading...', fullScreen = false }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 4,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'background.paper',
          zIndex: theme.zIndex.modal + 1,
        }),
      }}
    >
      <CircularProgress
        size={fullScreen ? 60 : 40}
        thickness={4}
        sx={{
          mb: 2,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          mt: 1,
          fontWeight: 500,
          maxWidth: 300,
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
}

export function LoadingSkeleton({ count = 1, height = 20, width = '100%', sx = {} }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            width,
            height,
            backgroundColor: 'action.hover',
            borderRadius: 1,
            animation: 'pulse 1.5s ease-in-out 0.5s infinite',
            ...(index > 0 && { mt: 1 }),
            ...sx,
          }}
        />
      ))}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
