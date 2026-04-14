import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { validate, LoginSchema, RegisterSchema } from '../utils/validators';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = validate(LoginSchema, req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError('Credenziali non valide.', 401, 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: config.jwtExpiry }
  );

  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = validate(RegisterSchema, req.body);

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw new AppError('Utente già registrato con questa email.', 400, 'DUPLICATE_EMAIL');

  const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role: role ?? 'ARTIST' },
  });

  res.status(201).json({
    message: 'Utente registrato con successo.',
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
  }
  res.json(req.user);
});
