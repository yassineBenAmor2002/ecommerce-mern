import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ReportProblem as ReportProblemIcon } from '@mui/icons-material';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // You can also log the error to an error tracking service here
    // logErrorToMyService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // If there's a way to reset the application state, you can call it here
    // For example, if you're using Redux, you might dispatch a reset action
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback: FallbackComponent, showDetails = false } = this.props;

      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return <FallbackComponent error={error} errorInfo={errorInfo} onReset={this.handleReset} />;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%',
              borderRadius: 2,
              backgroundColor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.grey[50]
                  : theme.palette.grey[900],
            }}
          >
            <ReportProblemIcon
              color="error"
              sx={{ fontSize: 64, mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h5" component="h1" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but an unexpected error occurred. Our team has been notified and we're working to fix it.
            </Typography>
            
            {showDetails && (
              <Box
                component="details"
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: 'background.paper',
                  borderRadius: 1,
                  textAlign: 'left',
                  maxHeight: 200,
                  overflow: 'auto',
                  '& pre': {
                    margin: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  },
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Error Details
                  </Typography>
                </summary>
                <pre>{error && error.toString()}</pre>
                {errorInfo && errorInfo.componentStack && (
                  <pre>{errorInfo.componentStack}</pre>
                )}
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReset}
                sx={{ textTransform: 'none' }}
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{ textTransform: 'none' }}
              >
                Reload Page
              </Button>
              <Button
                variant="text"
                component="a"
                href="/"
                sx={{ textTransform: 'none' }}
              >
                Go to Home
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage with function components
export const withErrorBoundary = (WrappedComponent, errorBoundaryProps) => {
  return (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );
};

// Custom error fallback component that can be used with the ErrorBoundary
const DefaultErrorFallback = ({ error, errorInfo, onReset }) => (
  <Box
    sx={{
      p: 3,
      border: '1px solid',
      borderColor: 'error.light',
      borderRadius: 1,
      backgroundColor: 'error.lightest',
    }}
  >
    <Typography variant="subtitle1" color="error" gutterBottom>
      An error occurred
    </Typography>
    <Typography variant="body2" color="text.secondary" paragraph>
      {error?.message || 'Something went wrong.'}
    </Typography>
    <Button
      variant="outlined"
      size="small"
      color="error"
      onClick={onReset}
    >
      Retry
    </Button>
  </Box>
);

export { DefaultErrorFallback };
