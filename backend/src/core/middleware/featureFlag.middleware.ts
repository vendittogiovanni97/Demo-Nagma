import { Request, Response, NextFunction } from 'express';
import { container } from '../../core/container';
import { ConfigService } from '../../modules/config/services/configService';
import { logger } from '../shared/utils/logger';

export interface FeatureFlagOptions {
  feature: keyof ClientFeatures;
  fallback?: boolean;
}

export interface ClientFeatures {
  enableCream: boolean;
  enableWhatsApp: boolean;
  enableFormTemplate: boolean;
  enableConfig: boolean;
}

let cachedFeatures: ClientFeatures | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minuti

async function getClientFeatures(): Promise<ClientFeatures> {
  const now = Date.now();
  if (cachedFeatures && now < cacheExpiry) {
    return cachedFeatures;
  }

  const configService = container.get(ConfigService);
  const features = await configService.getFeatures();

  cachedFeatures = features;
  cacheExpiry = now + CACHE_TTL;
  return features;
}

export function requireFeature(feature: keyof ClientFeatures) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await getClientFeatures();

      if (!features[feature]) {
        res.status(403).json({
          success: false,
          error: 'FEATURE_DISABLED',
          message: `La funzionalità "${feature}" non è abilitata per questo client`,
          feature,
        });
        return;
      }

      next();
    } catch (error) {
      logger.errorWithStack('[FeatureFlag] Errore controllo feature', error);
      res.status(500).json({
        success: false,
        error: 'FEATURE_CHECK_FAILED',
        message: 'Impossibile verificare la disponibilità della funzionalità',
      });
    }
  };
}

export function optionalFeature(feature: keyof ClientFeatures) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await getClientFeatures();
      req.features = features;
      req.featureEnabled = features[feature];
      next();
    } catch (error) {
      logger.errorWithStack('[FeatureFlag] Errore controllo feature opzionale', error);
      req.features = getDefaultFeatures();
      req.featureEnabled = false;
      next();
    }
  };
}

export function getFeaturesMiddleware() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const features = await getClientFeatures();
      req.features = features;
      next();
    } catch (error) {
      logger.errorWithStack('[FeatureFlag] Errore caricamento features', error);
      req.features = getDefaultFeatures();
      next();
    }
  };
}

function getDefaultFeatures(): ClientFeatures {
  return {
    enableCream: true,
    enableWhatsApp: true,
    enableFormTemplate: true,
    enableConfig: true,
  };
}

export function clearFeatureCache(): void {
  cachedFeatures = null;
  cacheExpiry = 0;
}