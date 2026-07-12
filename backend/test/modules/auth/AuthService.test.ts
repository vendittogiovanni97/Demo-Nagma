import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../../src/core/shared/errors/AppError';

const mockUser = {
  id: 1,
  name: 'Mario Rossi',
  email: 'mario@test.it',
  password: '$2a$10$hashedpassword1234567890',
  role: 'ADMIN',
  phone: null,
  deletedAt: null,
};

const createMockPrisma = () => ({
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

jest.mock('../../../src/core/shared/utils/prisma', () => ({
  __esModule: true,
  default: createMockPrisma(),
}));

import prisma from '../../../src/core/shared/utils/prisma';
import { AuthService } from '../../../src/modules/auth/services/authService';

const mockPrisma = prisma as unknown as ReturnType<typeof createMockPrisma>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    process.env.JWT_SECRET = 'test-secret-at-least-32-chars-long!!';
  });

  describe('login', () => {
    it('should return token + user when credentials are valid', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwt, 'sign').mockReturnValue('fake-jwt-token' as never);

      const result = await authService.login({ email: 'mario@test.it', password: 'password123' });

      expect(result.token).toBe('fake-jwt-token');
      expect(result.user.email).toBe('mario@test.it');
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'mario@test.it', deletedAt: null },
      });
    });

    it('should throw 401 when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.login({ email: 'unknown@test.it', password: 'x' }))
        .rejects.toThrow(new AppError('Credenziali non valide.', 401, 'INVALID_CREDENTIALS'));
    });

    it('should throw 401 when password is wrong', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.login({ email: 'mario@test.it', password: 'wrong' }))
        .rejects.toThrow(new AppError('Credenziali non valide.', 401, 'INVALID_CREDENTIALS'));
    });
  });

  describe('register', () => {
    it('should create user when email is new', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const user = await authService.register({
        name: 'Mario Rossi',
        email: 'mario@test.it',
        password: 'password123',
        role: 'ADMIN',
      });

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'mario@test.it', deletedAt: null },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(user.toJSON()).not.toHaveProperty('password');
    });

    it('should throw 400 when email already exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      await expect(authService.register({
        name: 'Mario Rossi',
        email: 'mario@test.it',
        password: 'password123',
        role: 'ADMIN',
      })).rejects.toThrow(new AppError('Utente già registrato con questa email.', 400, 'DUPLICATE_EMAIL'));
    });
  });

  describe('getMe', () => {
    it('should return user when found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const user = await authService.getMe(1);

      expect(user.id).toBe(1);
      expect(user.email).toBe('mario@test.it');
    });

    it('should throw 401 when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.getMe(999))
        .rejects.toThrow(new AppError('Utente non trovato', 401));
    });
  });

  describe('refreshToken', () => {
    it('should return new token when user exists', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'sign').mockReturnValue('new-jwt-token' as never);

      const result = await authService.refreshToken(1);

      expect(result.token).toBe('new-jwt-token');
      expect(result.user.id).toBe(1);
    });

    it('should throw 401 when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.refreshToken(999))
        .rejects.toThrow(new AppError('Utente non trovato', 401, 'USER_NOT_FOUND'));
    });
  });

  describe('changePassword', () => {
    it('should update password when current password is correct', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('new-hashed' as never);

      await authService.changePassword(1, { currentPassword: 'old', newPassword: 'new123' });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { password: 'new-hashed' },
      });
    });

    it('should throw 401 when current password is wrong', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.changePassword(1, { currentPassword: 'wrong', newPassword: 'new123' }))
        .rejects.toThrow(new AppError('Password attuale non corretta.', 401));
    });

    it('should throw 404 when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(authService.changePassword(999, { currentPassword: 'x', newPassword: 'y' }))
        .rejects.toThrow(new AppError('Utente non trovato', 404));
    });
  });
});
