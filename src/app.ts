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
app.use(cors());
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
