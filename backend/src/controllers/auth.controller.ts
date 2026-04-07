import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { validate, LoginSchema, RegisterSchema } from '../utils/validators';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = validate(LoginSchema, req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Credenziali non valide.', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    res.status(e.status ?? 500).json({ message: e.message });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = validate(RegisterSchema, req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError('Utente già registrato con questa email.', 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role ?? 'ARTIST' },
    });

    res.status(201).json({
      message: 'Utente registrato con successo.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (e: any) {
    res.status(e.status ?? 500).json({ message: e.message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  res.json(req.user);
};
