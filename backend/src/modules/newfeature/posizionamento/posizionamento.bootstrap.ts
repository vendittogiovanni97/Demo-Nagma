import { container } from '../../../core/container';
import { ConfigService } from '../../../modules/config/services/configService';
import { BookingPlacementService } from './services/bookingPlacementService';
import { BookingPlacementController } from './controllers/bookingPlacement.controller';

export function bootstrapPosizionamento(): void {
  const configService = container.get(ConfigService);
  const placementService = new BookingPlacementService();
  const placementController = new BookingPlacementController(placementService, configService);
  container.register(BookingPlacementService, placementService);
  container.register(BookingPlacementController, placementController);
}
