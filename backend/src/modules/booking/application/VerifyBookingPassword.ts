import { configService } from '../../../container';
import { AppError } from '../../../shared/errors/AppError';

export class VerifyBookingPassword {
  async execute(password: string): Promise<void> {
    const storedPasswordHash = await configService.getBookingUpdatePassword();

    if (!storedPasswordHash) {
      throw new AppError(
        'Password non configurata. Contattare l\'amministratore.',
        503,
        'PASSWORD_NOT_CONFIGURED'
      );
    }

    const isValid = await configService.verifyBookingUpdatePassword(password);
    if (!isValid) {
      throw new AppError('Password non corretta', 403, 'INVALID_PASSWORD');
    }
  }
}
