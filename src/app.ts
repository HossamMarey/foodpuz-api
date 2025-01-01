import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import middleware from 'i18next-http-middleware';
import i18next from './config/i18n';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Configure CORS options to allow requests only from *.foodpuz.com domain
const corsOptions = {
  origin: /\.foodpuz\.com$/,  // Only allow subdomains of foodpuz.com
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow credentials (cookies, authorization headers)
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS middleware with configured options
app.use(cors(corsOptions));

app.use(express.json());

// i18n middleware
app.use(middleware.handle(i18next));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use(limiter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FoodPuz API is running' });
});

// API routes
app.use('/api', setupRoutes());

// Error handling
app.use(errorHandler);

// Only start the server if we're not in a Vercel environment
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export for Vercel
export default app;
