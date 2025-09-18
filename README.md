# E-Commerce MERN Stack Application

A full-stack e-commerce application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with features like user authentication, product catalog, shopping cart, and payment processing.

## Features

- **User Authentication**
  - Register/Login with email/password
  - Social login (Google, Facebook, GitHub)
  - Password reset functionality
  - Email verification

- **Product Management**
  - Browse products with filters and search
  - Product details with images and descriptions
  - Product categories and tags
  - Product reviews and ratings

- **Shopping Cart**
  - Add/remove items from cart
  - Update quantities
  - Apply discount codes
  - Save cart for later

- **Checkout Process**
  - Secure payment processing with Stripe
  - Multiple payment methods
  - Order summary and confirmation
  - Order history and tracking

- **User Dashboard**
  - View order history
  - Track orders
  - Manage account details
  - View and manage addresses

- **Admin Panel**
  - Manage products
  - Process orders
  - View sales analytics
  - Manage users

## Tech Stack

- **Frontend**: React.js, Redux, Material-UI, Styled Components
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js
- **Payments**: Stripe
- **File Storage**: Cloudinary
- **Deployment**: Docker, AWS/GCP (optional)

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB Atlas account or local MongoDB installation
- Stripe account for payment processing
- Cloudinary account for image storage (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ecommerce-mern.git
   cd ecommerce-mern
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env` in both `server` and `client` directories
   - Update the variables with your configuration

5. **Start the development servers**
   - In the server directory:
     ```bash
     npm run dev
     ```
   - In the client directory (new terminal):
     ```bash
     npm start
     ```

## Configuration

### Server (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=your_session_secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your_email@example.com
SMTP_PASSWORD=your_email_password

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_CURRENCY=usd

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/v1/auth/google/callback

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=/api/v1/auth/facebook/callback

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=/api/v1/auth/github/callback
```

### Client (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## Available Scripts

### Server

- `npm run start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Client

- `npm start` - Start the development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from create-react-app

## API Documentation

API documentation is available at `/api-docs` when running in development mode.

## Deployment

### Backend Deployment

1. **Prepare for production**
   - Set `NODE_ENV=production` in your `.env` file
   - Update all environment variables with production values
   - Ensure CORS is properly configured for your domain

2. **Using PM2 (recommended)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name ecommerce-api
   pm2 save
   pm2 startup
   ```

3. **Using Docker (optional)**
   ```dockerfile
   FROM node:14-alpine
   WORKDIR /usr/src/app
   COPY package*.json ./
   RUN npm install --only=production
   COPY . .
   EXPOSE 5000
   CMD ["node", "server.js"]
   ```
   ```bash
   docker build -t ecommerce-api .
   docker run -p 5000:5000 -d ecommerce-api
   ```

### Frontend Deployment

1. **Build the application**
   ```bash
   cd client
   npm run build
   ```

2. **Serve the build folder**
   - Using serve:
     ```bash
     npm install -g serve
     serve -s build -l 3000
     ```
   - Or deploy to platforms like Vercel, Netlify, or AWS S3

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Create React App](https://create-react-app.dev/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Stripe](https://stripe.com/)
- [Passport.js](http://www.passportjs.org/)
- [Material-UI](https://material-ui.com/)
