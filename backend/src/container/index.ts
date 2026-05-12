import { PrismaCustomerRepository } from '../modules/customer/infrastructure/PrismaCustomerRepository';
import { CreateCustomer } from '../modules/customer/application/CreateCustomer';
import { ListCustomers } from '../modules/customer/application/ListCustomers';
import { GetCustomerById } from '../modules/customer/application/GetCustomerById';
import { GetCustomerSummary } from '../modules/customer/application/GetCustomerSummary';
import { UpdateCustomer } from '../modules/customer/application/UpdateCustomer';
import { DeleteCustomer } from '../modules/customer/application/DeleteCustomer';
import { CustomerController } from '../modules/customer/interfaces/CustomerController';

import { PrismaBookingRepository } from '../modules/booking/infrastructure/PrismaBookingRepository';
import { CreateBooking } from '../modules/booking/application/CreateBooking';
import { ListBookings } from '../modules/booking/application/ListBookings';
import { GetBookingStats } from '../modules/booking/application/GetBookingStats';
import { GetBookingHistory } from '../modules/booking/application/GetBookingHistory';
import { ListBookingHistory } from '../modules/booking/application/ListBookingHistory';
import { GetAvailableArtists } from '../modules/booking/application/GetAvailableArtists';
import { VerifyBookingPassword } from '../modules/booking/application/VerifyBookingPassword';
import { UpdateBooking } from '../modules/booking/application/UpdateBooking';
import { DeleteBooking } from '../modules/booking/application/DeleteBooking';
import { AnnulBooking } from '../modules/booking/application/AnnulBooking';
import { BookingController } from '../modules/booking/interfaces/BookingController';

import { PrismaUserRepository } from '../modules/auth/infrastructure/PrismaUserRepository';
import { Login } from '../modules/auth/application/Login';
import { Register } from '../modules/auth/application/Register';
import { GetMe } from '../modules/auth/application/GetMe';
import { UpdateMe } from '../modules/auth/application/UpdateMe';
import { ChangePassword } from '../modules/auth/application/ChangePassword';
import { RefreshToken } from '../modules/auth/application/RefreshToken';
import { AuthController } from '../modules/auth/interfaces/AuthController';

import { PrismaStaffRepository } from '../modules/staff/infrastructure/PrismaStaffRepository';
import { PrismaShiftRepository } from '../modules/staff/infrastructure/PrismaShiftRepository';
import { ListStaff } from '../modules/staff/application/ListStaff';
import { CreateStaff } from '../modules/staff/application/CreateStaff';
import { UpdateStaff } from '../modules/staff/application/UpdateStaff';
import { DeleteStaff } from '../modules/staff/application/DeleteStaff';
import { GetStaffById } from '../modules/staff/application/GetStaffById';
import { ListShifts } from '../modules/staff/application/ListShifts';
import { CreateShift } from '../modules/staff/application/CreateShift';
import { UpdateShift } from '../modules/staff/application/UpdateShift';
import { DeleteShift } from '../modules/staff/application/DeleteShift';
import { GetStaffShifts } from '../modules/staff/application/GetStaffShifts';
import { ResetStaffPassword } from '../modules/staff/application/ResetStaffPassword';
import { StaffController } from '../modules/staff/interfaces/StaffController';

import { PrismaTransactionRepository } from '../modules/finance/infrastructure/PrismaTransactionRepository';
import { PrismaSpesaLiberaRepository } from '../modules/finance/infrastructure/PrismaSpesaLiberaRepository';
import { ListTransactions } from '../modules/finance/application/ListTransactions';
import { CreateTransaction } from '../modules/finance/application/CreateTransaction';
import { UpdateTransaction } from '../modules/finance/application/UpdateTransaction';
import { DeleteTransaction } from '../modules/finance/application/DeleteTransaction';
import { ListTransactionHistory } from '../modules/finance/application/ListTransactionHistory';
import { ListSpeseLibere } from '../modules/finance/application/ListSpeseLibere';
import { CreateSpesaLibera } from '../modules/finance/application/CreateSpesaLibera';
import { DeleteSpesaLibera } from '../modules/finance/application/DeleteSpesaLibera';
import { GetFinanceSummary } from '../modules/finance/application/GetFinanceSummary';
import { GetTrends } from '../modules/finance/application/GetTrends';
import { GetArtistPerformance } from '../modules/finance/application/GetArtistPerformance';
import { TransactionController } from '../modules/finance/interfaces/TransactionController';
import { SpesaLiberaController } from '../modules/finance/interfaces/SpesaLiberaController';

import { PrismaFormTemplateRepository } from '../modules/form-template/infrastructure/PrismaFormTemplateRepository';
import { ListFormTemplates } from '../modules/form-template/application/ListFormTemplates';
import { GetFormTemplateById } from '../modules/form-template/application/GetFormTemplateById';
import { CreateFormTemplate } from '../modules/form-template/application/CreateFormTemplate';
import { UpdateFormTemplate } from '../modules/form-template/application/UpdateFormTemplate';
import { DeleteFormTemplate } from '../modules/form-template/application/DeleteFormTemplate';
import { FormTemplateController } from '../modules/form-template/interfaces/FormTemplateController';

import { PrismaWhatsAppRepository } from '../modules/whatsapp/infrastructure/PrismaWhatsAppRepository';
import { ListWhatsAppTemplates } from '../modules/whatsapp/application/ListWhatsAppTemplates';
import { ListWhatsAppLogs } from '../modules/whatsapp/application/ListWhatsAppLogs';
import { CreateWhatsAppTemplate } from '../modules/whatsapp/application/CreateWhatsAppTemplate';
import { UpdateWhatsAppTemplate } from '../modules/whatsapp/application/UpdateWhatsAppTemplate';
import { DeleteWhatsAppTemplate } from '../modules/whatsapp/application/DeleteWhatsAppTemplate';
import { DuplicateWhatsAppTemplate } from '../modules/whatsapp/application/DuplicateWhatsAppTemplate';
import { SendManualWhatsAppMessage } from '../modules/whatsapp/application/SendManualWhatsAppMessage';
import { WhatsAppController } from '../modules/whatsapp/interfaces/WhatsAppController';

import { PrismaAttachmentRepository } from '../modules/attachment/infrastructure/PrismaAttachmentRepository';
import { UploadAttachment } from '../modules/attachment/application/UploadAttachment';
import { DownloadAttachment } from '../modules/attachment/application/DownloadAttachment';
import { GetBookingAttachments } from '../modules/attachment/application/GetBookingAttachments';
import { DeleteAttachment } from '../modules/attachment/application/DeleteAttachment';
import { GetAttachmentPreview } from '../modules/attachment/application/GetAttachmentPreview';
import { AttachmentController } from '../modules/attachment/interfaces/AttachmentController';

import { CreamService } from '../modules/cream/services/CreamService';
import { CreamController } from '../modules/cream/controllers/CreamController';

import { PrismaConfigRepository } from '../modules/config/infrastructure/PrismaConfigRepository';
import { ConfigService } from '../modules/config/application/ConfigService';

// Repositories
const customerRepository = new PrismaCustomerRepository();
const bookingRepository = new PrismaBookingRepository();
const userRepository = new PrismaUserRepository();
const staffRepository = new PrismaStaffRepository();
const shiftRepository = new PrismaShiftRepository();
const transactionRepository = new PrismaTransactionRepository();
const spesaLiberaRepository = new PrismaSpesaLiberaRepository();
const formTemplateRepository = new PrismaFormTemplateRepository();
const whatsappRepository = new PrismaWhatsAppRepository();
const attachmentRepository = new PrismaAttachmentRepository();
// Cream Repository is bypassed (using direct Prisma queries in CreamService)
const configRepository = new PrismaConfigRepository();

// Global Services
export const configService = new ConfigService(configRepository);

// Use Cases - Customer
const createCustomer = new CreateCustomer(customerRepository);
const listCustomers = new ListCustomers(customerRepository);
const getCustomerById = new GetCustomerById(customerRepository);
const getCustomerSummary = new GetCustomerSummary(customerRepository);
const updateCustomer = new UpdateCustomer(customerRepository);
const deleteCustomer = new DeleteCustomer(customerRepository);

// Use Cases - Booking
const createBooking = new CreateBooking(bookingRepository);
const updateBooking = new UpdateBooking(bookingRepository);
const listBookings = new ListBookings(bookingRepository);
const getBookingStats = new GetBookingStats(bookingRepository);
const getBookingHistory = new GetBookingHistory(bookingRepository);
const listBookingHistory = new ListBookingHistory(bookingRepository);
const getAvailableArtists = new GetAvailableArtists(bookingRepository);
const verifyBookingPassword = new VerifyBookingPassword();
const deleteBooking = new DeleteBooking(bookingRepository);
const annulBooking = new AnnulBooking(bookingRepository);

// Use Cases - Auth
const loginUseCase = new Login(userRepository);
const registerUseCase = new Register(userRepository);
const getMeUseCase = new GetMe(userRepository);
const updateMeUseCase = new UpdateMe(userRepository);
const changePasswordUseCase = new ChangePassword(userRepository);
const refreshTokenUseCase = new RefreshToken(userRepository);

// Use Cases - Staff
const listStaff = new ListStaff(staffRepository);
const createStaff = new CreateStaff(staffRepository);
const updateStaff = new UpdateStaff(staffRepository);
const deleteStaff = new DeleteStaff(staffRepository);
const getStaffById = new GetStaffById(staffRepository);
const listShifts = new ListShifts(shiftRepository);
const createShift = new CreateShift(shiftRepository);
const updateShift = new UpdateShift(shiftRepository);
const deleteShift = new DeleteShift(shiftRepository);
const getStaffShifts = new GetStaffShifts(shiftRepository);
const resetStaffPassword = new ResetStaffPassword(userRepository);

// Use Cases - Finance
const listTransactions = new ListTransactions(transactionRepository);
const createTransaction = new CreateTransaction(transactionRepository);
const updateTransaction = new UpdateTransaction(transactionRepository);
const deleteTransaction = new DeleteTransaction(transactionRepository);
const listTransactionHistory = new ListTransactionHistory(transactionRepository);
const listSpeseLibere = new ListSpeseLibere(spesaLiberaRepository);
const createSpesaLibera = new CreateSpesaLibera(spesaLiberaRepository, transactionRepository);
const deleteSpesaLibera = new DeleteSpesaLibera(spesaLiberaRepository, transactionRepository);
const getFinanceSummary = new GetFinanceSummary(transactionRepository, spesaLiberaRepository);
const getTrends = new GetTrends(transactionRepository);
const getArtistPerformance = new GetArtistPerformance(transactionRepository);

// Use Cases - Form Template
const listFormTemplates = new ListFormTemplates(formTemplateRepository);
const getFormTemplateById = new GetFormTemplateById(formTemplateRepository);
const createFormTemplate = new CreateFormTemplate(formTemplateRepository);
const updateFormTemplate = new UpdateFormTemplate(formTemplateRepository);
const deleteFormTemplate = new DeleteFormTemplate(formTemplateRepository);

// Use Cases - WhatsApp
const listWhatsAppTemplates = new ListWhatsAppTemplates(whatsappRepository);
const listWhatsAppLogs = new ListWhatsAppLogs(whatsappRepository);
const createWhatsAppTemplate = new CreateWhatsAppTemplate(whatsappRepository);
const updateWhatsAppTemplate = new UpdateWhatsAppTemplate(whatsappRepository);
const deleteWhatsAppTemplate = new DeleteWhatsAppTemplate(whatsappRepository);
const duplicateWhatsAppTemplate = new DuplicateWhatsAppTemplate(whatsappRepository);
const sendManualWhatsAppMessage = new SendManualWhatsAppMessage(whatsappRepository);

// Use Cases - Attachment
const uploadAttachment = new UploadAttachment(attachmentRepository);
const downloadAttachment = new DownloadAttachment(attachmentRepository);
const getBookingAttachments = new GetBookingAttachments(attachmentRepository);
const deleteAttachment = new DeleteAttachment(attachmentRepository);
const getAttachmentPreview = new GetAttachmentPreview();

// Services - Cream
const creamService = new CreamService();

// Controllers
const customerController = new CustomerController(
  listCustomers,
  createCustomer,
  getCustomerById,
  getCustomerSummary,
  updateCustomer,
  deleteCustomer
);

const bookingController = new BookingController(
  listBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  annulBooking,
  getBookingStats,
  getBookingHistory,
  listBookingHistory,
  getAvailableArtists,
  verifyBookingPassword
);

const authController = new AuthController(
  loginUseCase,
  registerUseCase,
  getMeUseCase,
  updateMeUseCase,
  changePasswordUseCase,
  refreshTokenUseCase
);

const staffController = new StaffController(
  listStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffById,
  listShifts,
  createShift,
  updateShift,
  deleteShift,
  getStaffShifts,
  resetStaffPassword
);

const transactionController = new TransactionController(
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  listTransactionHistory,
  getFinanceSummary,
  getTrends,
  getArtistPerformance
);

const spesaLiberaController = new SpesaLiberaController(
  listSpeseLibere,
  createSpesaLibera,
  deleteSpesaLibera
);

const formTemplateController = new FormTemplateController(
  listFormTemplates,
  getFormTemplateById,
  createFormTemplate,
  updateFormTemplate,
  deleteFormTemplate
);

const whatsappController = new WhatsAppController(
  listWhatsAppTemplates,
  listWhatsAppLogs,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate,
  duplicateWhatsAppTemplate,
  sendManualWhatsAppMessage
);

const attachmentController = new AttachmentController(
  uploadAttachment,
  downloadAttachment,
  getBookingAttachments,
  deleteAttachment,
  getAttachmentPreview
);

const creamController = new CreamController(creamService);

export const container = {
  customerController,
  bookingController,
  authController,
  staffController,
  transactionController,
  spesaLiberaController,
  formTemplateController,
  whatsappController,
  attachmentController,
  creamController,
  configService,
};
