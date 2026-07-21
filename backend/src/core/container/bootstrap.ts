import { bootstrapAuth } from '../../modules/auth/auth.bootstrap';
import { bootstrapBooking } from '../../modules/booking/booking.bootstrap';
import { bootstrapConfig } from '../../modules/config/config.bootstrap';
import { bootstrapCream } from '../../modules/cream/cream.bootstrap';
import { bootstrapCustomField } from '../../modules/custom-field/customField.bootstrap';
import { bootstrapCustomer } from '../../modules/customer/customer.bootstrap';
import { bootstrapFinance } from '../../modules/finance/finance.bootstrap';
import { bootstrapFormTemplate } from '../../modules/form-template/formTemplate.bootstrap';
import { bootstrapStaff } from '../../modules/staff/staff.bootstrap';
import { bootstrapWhatsApp } from '../../modules/whatsapp/whatsapp.bootstrap';
import { bootstrapAttachment } from '../../modules/attachment/attachment.bootstrap';
import { bootstrapReports } from '../../modules/reports/reports.bootstrap';
import { bootstrapExport } from '../../modules/export/export.bootstrap';
import { bootstrapUserPreferences } from '../../modules/user/userPreferences.bootstrap';
import { bootstrapMetrics } from '../../modules/metrics/metrics.bootstrap';
import { bootstrapSavedView } from '../../modules/saved-views/savedView.bootstrap';

export function bootstrapContainer(): void {
  bootstrapAttachment();
  bootstrapAuth();
  bootstrapBooking();
  bootstrapConfig();
  bootstrapCream();
  bootstrapCustomField();
  bootstrapCustomer();
  bootstrapFinance();
  bootstrapFormTemplate();
  bootstrapStaff();
  bootstrapWhatsApp();
  bootstrapReports();
  bootstrapExport();
  bootstrapUserPreferences();
  bootstrapMetrics();
  bootstrapSavedView();
}
