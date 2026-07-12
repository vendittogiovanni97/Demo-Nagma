import { bootstrapAuth } from '../../modules/auth/auth.bootstrap';
import { bootstrapBooking } from '../../modules/booking/booking.bootstrap';
import { bootstrapConfig } from '../../modules/config/config.bootstrap';
import { bootstrapCream } from '../../modules/cream/cream.bootstrap';
import { bootstrapCustomer } from '../../modules/customer/customer.bootstrap';
import { bootstrapFinance } from '../../modules/finance/finance.bootstrap';
import { bootstrapFormTemplate } from '../../modules/form-template/formTemplate.bootstrap';
import { bootstrapStaff } from '../../modules/staff/staff.bootstrap';
import { bootstrapWhatsApp } from '../../modules/whatsapp/whatsapp.bootstrap';
import { bootstrapAttachment } from '../../modules/attachment/attachment.bootstrap';
import { bootstrapConsenso } from '../../modules/newfeature/consenso/consenso.bootstrap';
import { bootstrapPosizionamento } from '../../modules/newfeature/posizionamento/posizionamento.bootstrap';

export function bootstrapContainer(): void {
  bootstrapAttachment();
  bootstrapAuth();
  bootstrapBooking();
  bootstrapConfig();
  bootstrapCream();
  bootstrapCustomer();
  bootstrapFinance();
  bootstrapFormTemplate();
  bootstrapStaff();
  bootstrapWhatsApp();
  bootstrapConsenso();
  bootstrapPosizionamento();
}
