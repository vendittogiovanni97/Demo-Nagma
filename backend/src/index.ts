import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import customerRoutes from './routes/customer.routes';
import transactionRoutes from './routes/transaction.routes';
import bookingRoutes from './routes/booking.routes';
import teamRoutes from './routes/team.routes';
import creamRoutes from './routes/cream.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/creams', creamRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Nagma Tattoo API Running' });
});

// Health check and DB test
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Just a simple query to ensure DB is connected
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed', error });
  }
});

// Port configuration
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
