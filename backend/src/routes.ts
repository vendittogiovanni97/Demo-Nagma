import { Router } from 'express';
import attachmentRoutes from './modules/attachment/interfaces/attachment.routes';
import authRoutes from './modules/auth/interfaces/auth.routes';
import bookingRoutes from './modules/booking/interfaces/booking.routes';
import creamRoutes from './modules/cream/interfaces/cream.routes';
import customerRoutes from './modules/customer/interfaces/customer.routes';
import financeRoutes from './modules/finance/interfaces/finance.routes';
import formTemplateRoutes from './modules/form-template/interfaces/form-template.routes';
import staffRoutes from './modules/staff/interfaces/staff.routes';
import whatsappTemplateRoutes from './modules/whatsapp/interfaces/whatsapp.routes';
import consentRoutes from './modules/newfeature/consenso/interfaces/consent.routes';
import placementRoutes from './modules/newfeature/posizionamento/interfaces/booking-placement.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/finance', financeRoutes);
router.use('/bookings', bookingRoutes);
router.use('/staff', staffRoutes);
router.use('/form-templates', formTemplateRoutes);
router.use('/whatsapp-templates', whatsappTemplateRoutes);
router.use('/cream', creamRoutes);
router.use('/attachments', attachmentRoutes);
router.use('/newfeature', consentRoutes);
router.use('/newfeature', placementRoutes);

export default router;
