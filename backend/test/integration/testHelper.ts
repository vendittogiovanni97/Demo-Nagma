import jwt from 'jsonwebtoken';
import prisma from '../../src/core/shared/utils/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'a3f8c2d7e1b94056f2a8c3d6e0b7f1a4c9d2e5f8b1a3c6d9e2f5a8b4c7d0e3f6';

export async function getAdminAuth() {
  const user = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN', deletedAt: null },
  });

  if (!user) {
    throw new Error('Superadmin user not found in database. Run npm run db:seed first.');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, userId: user.id, email: user.email };
}
