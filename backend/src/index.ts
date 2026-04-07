import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma';
import { AppError } from './utils/AppError';

import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import transactionRoutes from './routes/transaction.routes';
import bookingRoutes from './routes/booking.routes';
import teamRoutes from './routes/team.routes';
import creamRoutes from './routes/cream.routes';

dotenv.config();

// Verifica variabili d'ambiente critiche prima di avviare
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET non configurato. Aggiungilo al file .env');
}
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL non configurato. Aggiungilo al file .env');
}

const app = express();
const port = process.env.PORT || 3001;

// CORS: permette solo le origini dichiarate in .env (default: localhost:3000)
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/creams', creamRoutes);

// Health check
app.get('/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(500).json({ message: 'Connessione al database fallita' });
  }
});

// Global error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: 'Errore interno del server' });
});

app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
