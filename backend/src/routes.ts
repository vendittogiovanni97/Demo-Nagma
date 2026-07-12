import { Express } from 'express';
import { registerAuthRoutes } from './modules/auth/routes';
import { registerCustomerRoutes } from './modules/customer/routes';
import { registerBookingRoutes } from './modules/booking/routes';
import { registerStaffRoutes } from './modules/staff/routes';
import { registerFinanceRoutes } from './modules/finance/routes';
import { registerWhatsAppRoutes } from './modules/whatsapp/routes';
import { registerFormTemplateRoutes } from './modules/form-template/routes';
import { registerCreamRoutes } from './modules/cream/routes';
import { registerConfigRoutes } from './modules/config/routes';
import { registerAttachmentRoutes } from './modules/attachment/routes';
import { registerConsentRoutes } from './modules/newfeature/consenso/routes';
import { registerBookingPlacementRoutes } from './modules/newfeature/posizionamento/routes';

export function registerRoutes(app: Express): void {
  registerAuthRoutes(app);
  registerCustomerRoutes(app);
  registerBookingRoutes(app);
  registerStaffRoutes(app);
  registerFinanceRoutes(app);
  registerWhatsAppRoutes(app);
  registerFormTemplateRoutes(app);
  registerCreamRoutes(app);
  registerConfigRoutes(app);
  registerAttachmentRoutes(app);
  registerConsentRoutes(app);
  registerBookingPlacementRoutes(app);
}
