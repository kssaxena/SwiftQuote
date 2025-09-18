import { Router } from "express";
import {
  registerUser,
  loginUser,
  LogOutUser,
  regenerateRefreshToken,
  RawImageUpload,
  generateInvoice,
  createTermsCondition,
  updateTermsCondition,
  addBankDetails,
  getBankDetailsById,
} from "../controllers/user.controllers.js";
import { VerifyUser } from "../middlewares/auth.middlewares.js";
import { upload } from "../middlewares/multer.middlewares.js";
import {
  createInvoice,
  getInvoiceById,
  getUserAllInvoices,
  updateInvoiceById,
} from "../controllers/invoice.controllers.js";
import {
  createEstimate,
  getEstimateById,
  getEstimatesByUserId,
} from "../controllers/estimate.controllers.js";
import {
  createQuotation,
  getQuotationsByUserId,
  getQuotationById,
  updateQuotation,
  deleteQuotation,
} from "../controllers/quotation.controllers.js";

const router = Router();

// login, register, re-login
router.route("/register").post(upload.single("image"), registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-tokens").post(VerifyUser, regenerateRefreshToken);
router.route("/add-terms-condition").post(VerifyUser, createTermsCondition);
router.route("/add-bank-detail/:userId").post(VerifyUser, addBankDetails);
router.route("/get-bank-detail/:userId").get(VerifyUser, getBankDetailsById);
router
  .route("/update-terms-condition/:userId")
  .post(VerifyUser, updateTermsCondition);

// router
//   .route("/raw-image-upload")
//   .post(VerifyUser, upload.single("image"), RawImageUpload);

router.route("/templates/create").post(VerifyUser, generateInvoice);

//routes for invoices
router.route("/generate-invoice/:userId").post(VerifyUser, createInvoice);
router.route("/get-all-invoices/:userId").get(VerifyUser, getUserAllInvoices);
router.route("/get-invoice/:invoiceId").get(VerifyUser, getInvoiceById);
router
  .route("/update-invoice/:invoiceId/:userId")
  .post(VerifyUser, updateInvoiceById);

// routes for estimates
router.route("/create-estimate/:userId").post(VerifyUser, createEstimate);
router.route("/get-estimates/:userId").get(VerifyUser, getEstimatesByUserId);
router.route("/get-estimate/:estimateId").get(VerifyUser, getEstimateById);

// routes for quotations
router.route("/create-quotation/:userId").post(VerifyUser, createQuotation);
router.route("/get-quotations/:userId").get(VerifyUser, getQuotationsByUserId);
router.route("/get-quotation/:quotationId").get(VerifyUser, getQuotationById);
router
  .route("/update-quotation/:quotationId/:userId")
  .post(VerifyUser, updateQuotation);

//secured routes
router.route("/logout").post(VerifyUser, LogOutUser);
// router.route("/user/get-user-details/:userId").get(GetUserDetails);

export default router;
