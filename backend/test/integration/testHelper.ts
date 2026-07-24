import jwt from 'jsonwebtoken';
import prisma, { closeDatabase } from '../../src/core/shared/utils/prisma';

afterAll(async () => {
  await closeDatabase();
});

const JWT_SECRET = process.env.JWT_SECRET || 'a3f8c2d7e1b94056f2a8c3d6e0b7f1a4c9d2e5f8b1a3c6d9e2f5a8b4c7d0e3f6';

export async function getAdminAuth() {
  let user = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN', deletedAt: null },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Super Admin Test',
        email: 'superadmin@nagma.it',
        password: '$2a$10$abcdefghijklmnopqrstuu',
        role: 'SUPER_ADMIN',
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, userId: user.id, email: user.email };
}
