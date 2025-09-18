# Social Login Setup Guide

This guide explains how to set up social login (Google, Facebook, GitHub) for the MERN E-commerce application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Social app credentials (Google, Facebook, GitHub)

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   API_URL=http://localhost:5000
   
   # MongoDB Configuration
   MONGO_URI=mongodb://localhost:27017/ecommerce
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   JWT_REFRESH_EXPIRE=90d
   JWT_COOKIE_EXPIRE=30
   
   # Session Configuration
   SESSION_SECRET=your_session_secret_here
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

## Social Login Setup

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
7. Add authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback`
8. Get your Client ID and Client Secret
9. Update `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### 2. Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Go to "Facebook Login" > "Settings"
4. Add Valid OAuth Redirect URIs:
   - `http://localhost:5000/api/v1/auth/facebook/callback`
5. Get your App ID and App Secret
6. Update `.env`:
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   ```

### 3. GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:3000`
4. Set Authorization callback URL:
   - `http://localhost:5000/api/v1/auth/github/callback`
5. Get your Client ID and generate a new Client Secret
6. Update `.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   ```

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd ../client
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the `client` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   REACT_APP_FRONTEND_URL=http://localhost:3000
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd ../client
   npm start
   ```

3. Access the application at `http://localhost:3000`

## Testing Social Login

1. Click on any social login button (Google, Facebook, or GitHub)
2. You'll be redirected to the respective provider's login page
3. After successful authentication, you'll be redirected back to the application
4. The application should now be logged in with your social account

## Troubleshooting

1. **Redirect URI Mismatch**
   - Ensure the redirect URIs in your OAuth app settings match exactly
   - Include both `http` and `https` versions if testing locally with both

2. **CORS Issues**
   - Make sure the `FRONTEND_URL` in the backend matches your frontend URL
   - Check browser console for CORS errors

3. **Session Issues**
   - Clear browser cookies if experiencing session-related issues
   - Ensure `SESSION_SECRET` is set and consistent

4. **Environment Variables**
   - Verify all required environment variables are set
   - Restart the server after making changes to `.env`

## Security Notes

1. Never commit sensitive information (client secrets, API keys) to version control
2. Use environment variables for all sensitive configuration
3. In production, use HTTPS for all endpoints
4. Set appropriate CORS policies
5. Regularly rotate your OAuth client secrets
