import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { validate, loginSchema, registerSchema, updateMeSchema, changePasswordSchema } from '../schemas';
import { config } from '../config/env';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';
import { asyncHandler } from '../utils/async-handler';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = validate(loginSchema, req.body);

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

  register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password, role } = validate(registerSchema, req.body);

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

  me = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    }
    res.json(req.user);
  });

  updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    }

    const data = validate(updateMeSchema, req.body);

    // Utente può aggiornare solo name e phone del proprio profilo
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: data.name, ...(data.phone !== undefined && { phone: data.phone }) },
      omit: { password: true },
    });

    res.json(updated);
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('Utente non autenticato', 401, 'UNAUTHENTICATED');
    }

    const data = validate(changePasswordSchema, req.body);

    // Recupera l'utente con la password per verificare la password attuale
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw new AppError('Utente non trovato', 404);
    }

    // Verifica che la password attuale sia corretta
    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      throw new AppError('Password attuale non corretta.', 401);
    }

    // Hash la nuova password e aggiorna
    const hashedPassword = await bcrypt.hash(data.newPassword, config.bcryptSaltRounds);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password aggiornata con successo.' });
  });
}
