import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../core/shared/utils/prisma';
import { AppError } from '../../../core/shared/errors/AppError';
import { config } from '../../../core/config/env';
import { Role, ThemeMode } from '@prisma/client';

function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, 'password'> {
  const { password, ...rest } = user;
  return rest;
}

export class AuthService {
  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new AppError('Credenziali non valide.', 401, 'INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion ?? 0 },
      process.env.JWT_SECRET!,
      { expiresIn: config.jwtExpiry }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(data: { name: string; email: string; password: string; role?: string; phone?: string }) {
    const exists = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (exists) {
      throw new AppError('Utente già registrato con questa email.', 400, 'DUPLICATE_EMAIL');
    }

    const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);

    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role | undefined,
        phone: data.phone,
      },
    });

    return {
      ...sanitizeUser(created),
      toJSON() {
        return sanitizeUser(created);
      },
    };
  }

  async getMe(userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new AppError('Utente non trovato', 401);
    }
    return {
      ...sanitizeUser(user),
      toJSON() {
        return sanitizeUser(user);
      },
    };
  }

  async updateMe(userId: number, data: { name: string; phone?: string }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return {
      ...sanitizeUser(updated),
      toJSON() {
        return sanitizeUser(updated);
      },
    };
  }

  async updateTheme(userId: number, theme: string) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { theme: theme.toUpperCase() as ThemeMode },
    });
    return {
      ...sanitizeUser(updated),
      toJSON() {
        return sanitizeUser(updated);
      },
    };
  }

  async changePassword(userId: number, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new AppError('Utente non trovato', 404);
    }

    if (!(await bcrypt.compare(data.currentPassword, user.password))) {
      throw new AppError('Password attuale non corretta.', 401);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, config.bcryptSaltRounds);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, tokenVersion: { increment: 1 } },
    });
  }

  async refreshToken(userId: number) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new AppError('Utente non trovato', 401, 'USER_NOT_FOUND');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion ?? 0 },
      process.env.JWT_SECRET!,
      { expiresIn: config.jwtExpiry }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
