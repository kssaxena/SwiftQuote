import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Invoice } from "../models/invoice.models.js";

const createInvoice = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID missing");
  }

  const {
    customerName,
    customerAddress,
    customerPhone,
    customerState,
    customerGST,
    invoiceNumber,
    invoiceDate,
    referenceNo,
    buyerOrderNo,
    dispatchDocNo,
    deliveryNote,
    destination,
    paymentTerms,
    deliveryTerms,
    billingAmount,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    discount,
    discountInAmount,
    receivedAmount,
    dueAmount,
  } = req.body;

  // Log incoming data
  console.log({
    customerName,
    invoiceNumber,
    billingAmount,
    discount,
    discountInAmount,
    dueAmount,
  });

  // Required fields check
  if (
    !customerName ||
    !customerAddress ||
    !customerPhone ||
    !customerState ||
    !invoiceNumber ||
    !invoiceDate ||
    !destination ||
    !paymentTerms ||
    billingAmount === undefined ||
    taxableValue === undefined ||
    sgstValue === undefined ||
    cgstValue === undefined ||
    totalTax === undefined ||
    receivedAmount === undefined
  ) {
    throw new ApiError(400, "Please provide all required invoice fields");
  }

  // Check for existing invoice number
  const existingInvoice = await Invoice.findOne({ invoiceNumber });
  if (existingInvoice) {
    throw new ApiError(400, "Invoice with this Invoice Number already exists!");
  }

  // Parse items
  let items = [];
  try {
    items = JSON.parse(req.body.items || "[]");
  } catch (err) {
    throw new ApiError(400, "Invalid items format");
  }
  if (!items.length) {
    throw new ApiError(400, "At least one item is required");
  }

  // Safe number parsing
  const num = (val) => (val !== "" && val !== undefined ? Number(val) : 0);
  const billAmt = num(billingAmount);
  const discountPercent = num(discount);
  const discountAmountFixed = num(discountInAmount);
  const receivedAmt = num(receivedAmount);

  // ================================
  //   🔥 FINAL DISCOUNT CALCULATION
  // ================================

  let appliedDiscount = 0;
  let discountedBill = billAmt;

  // Case A → Percentage discount
  if (discountPercent > 0 && discountPercent <= 100) {
    appliedDiscount = (billAmt * discountPercent) / 100;
  }

  // Case B → Flat discount (this OVERRIDES percentage if present)
  if (discountAmountFixed > 0) {
    appliedDiscount = discountAmountFixed;
  }

  discountedBill = billAmt - appliedDiscount;

  // Prevent negative value
  if (discountedBill < 0) discountedBill = 0;

  // Round off
  appliedDiscount = Number(appliedDiscount.toFixed(2));
  discountedBill = Number(discountedBill.toFixed(2));

  // ================================
  //       🔥 FINAL DUE CALCULATION
  // ================================
  let discountedDue = discountedBill - receivedAmt;

  if (discountedDue < 0) discountedDue = 0;

  discountedDue = Number(discountedDue.toFixed(2));

  // Create invoice
  const invoice = await Invoice.create({
    userId,
    customerName,
    customerAddress,
    customerPhone,
    customerGST,
    customerState,
    invoiceNumber,
    invoiceDate,
    referenceNo,
    buyerOrderNo,
    dispatchDocNo,
    deliveryNote,
    destination,
    paymentTerms,
    deliveryTerms,
    items,
    billingAmount: billAmt,
    disBillAmount: discountedBill,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    discount: appliedDiscount,
    receivedAmount: receivedAmt,
    dueAmount: discountedDue,
  });

  res
    .status(201)
    .json(new ApiResponse(201, { invoice }, "Invoice created successfully"));
});

const getUserAllInvoices = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const invoices = await Invoice.find({ userId }).sort({ invoiceNumber: -1 });

  if (!invoices || invoices.length === 0) {
    throw new ApiError(404, "No invoices found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { invoices }, "Invoices fetched successfully"));
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  if (!invoiceId) {
    throw new ApiError(400, "Invoice ID is required");
  }

  const invoice = await Invoice.findById(invoiceId).populate();
  // populate will also return user info (name, email). Remove if not needed.

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { invoice }, "Invoice fetched successfully"));
});

// const updateInvoiceById = asyncHandler(async (req, res) => {
//   const { invoiceId, userId } = req.params;
//   console.log("controller Reached", invoiceId, userId);

//   if (!invoiceId) {
//     throw new ApiError(400, "Invoice ID is required");
//   }

//   // Collect everything sent in body/form-data
//   const updateFields = { ...req.body };

//   // If items were sent as JSON string (from frontend FormData)
//   if (updateFields.items) {
//     try {
//       updateFields.items = JSON.parse(updateFields.items);
//     } catch (err) {
//       throw new ApiError(400, "Invalid items format. Must be JSON.");
//     }
//   }

//   // Build new data map for invoice
//   const updatedData = { ...updateFields };

//   const invoice = await Invoice.findOneAndUpdate(
//     { _id: invoiceId, userId }, // ensures only owner can edit
//     { data: updatedData },
//     { new: true }
//   );

//   if (!invoice) {
//     throw new ApiError(404, "Invoice not found or not authorized to edit");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { invoice }, "Invoice updated successfully"));
// });

const updateInvoiceById = asyncHandler(async (req, res) => {
  // const { invoiceId } = req.params;
  const { invoiceId, userId } = req.params;

  // If using FormData, all fields come inside req.body
  // Items will come as JSON string -> parse it
  let updatedData = { ...req.body };

  if (updatedData.items) {
    try {
      updatedData.items = JSON.parse(updatedData.items);
    } catch (err) {
      throw new ApiError(400, "Invalid items format. Must be JSON.");
    }
  }

  // ✅ Debug log
  console.log("Updating invoice:", invoiceId, updatedData);

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  // Merge the updated fields into existing invoice
  Object.keys(updatedData).forEach((key) => {
    invoice[key] = updatedData[key];
  });

  await invoice.save();

  res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice updated successfully"));
});

const deleteInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;

  const invoice = await Invoice.findByIdAndDelete(invoiceId);
  if (!invoice) throw new ApiError(404, "Invoice not found");

  res.status(200).json(new ApiResponse(200, "Invoice deleted Successfully"));
});

export {
  createInvoice,
  getUserAllInvoices,
  getInvoiceById,
  updateInvoiceById,
  deleteInvoice,
};
