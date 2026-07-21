import prisma from '../../../core/shared/utils/prisma';
import { UpdateUserPreferencesDto, UserPreferencesDto } from '../types/userPreferences.types';

export class UserPreferencesService {
  async getPreferences(userId: number): Promise<UserPreferencesDto> {
    const pref = await prisma.userPreference.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        language: 'it',
        timezone: 'Europe/Rome',
        dateFormat: 'DD/MM/YYYY',
        itemsPerPage: 25,
        emailNotifications: true,
        inAppNotifications: true,
      },
    });

    return {
      language: pref.language,
      timezone: pref.timezone,
      dateFormat: pref.dateFormat,
      itemsPerPage: pref.itemsPerPage,
      emailNotifications: pref.emailNotifications,
      inAppNotifications: pref.inAppNotifications,
    };
  }

  async updatePreferences(userId: number, data: UpdateUserPreferencesDto): Promise<UserPreferencesDto> {
    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        language: data.language || 'it',
        timezone: data.timezone || 'Europe/Rome',
        dateFormat: data.dateFormat || 'DD/MM/YYYY',
        itemsPerPage: data.itemsPerPage || 25,
        emailNotifications: data.emailNotifications ?? true,
        inAppNotifications: data.inAppNotifications ?? true,
      },
    });

    return {
      language: updated.language,
      timezone: updated.timezone,
      dateFormat: updated.dateFormat,
      itemsPerPage: updated.itemsPerPage,
      emailNotifications: updated.emailNotifications,
      inAppNotifications: updated.inAppNotifications,
    };
  }
}
