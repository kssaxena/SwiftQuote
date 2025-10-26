import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Invoice } from "../models/invoice.models.js";

const createInvoice = asyncHandler(async (req, res) => {
  const { userId } = req.params; // assuming you attach user in auth middleware
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
    receivedAmount,
    dueAmount,
  } = req.body;
  console.log(
    customerName,
    customerAddress,
    customerPhone,
    customerState,
    invoiceNumber,
    invoiceDate,
    destination,
    paymentTerms,
    billingAmount,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    receivedAmount
  );

  // Validate required fields
  if (
    !customerName ||
    !customerAddress ||
    !customerPhone ||
    !customerState ||
    !invoiceNumber ||
    !invoiceDate ||
    !destination ||
    !paymentTerms ||
    !billingAmount ||
    !taxableValue ||
    !sgstValue ||
    !cgstValue ||
    !totalTax ||
    !receivedAmount
  ) {
    throw new ApiError(400, "Please provide all required invoice fields");
  }
  const existingInvoice = await Invoice.findOne({ invoiceNumber });

  if (existingInvoice) {
    throw new ApiError(
      400,
      "Invoice with this Invoice Number already Exist ! "
    );
  }

  // Parse items from FormData (it comes as stringified JSON)
  let items = [];
  try {
    items = JSON.parse(req.body.items || "[]");
  } catch (err) {
    throw new ApiError(400, "Invalid items format");
  }

  if (!items.length) {
    throw new ApiError(400, "At least one item is required");
  }
  const discountedGrandTotal =
    billingAmount - (billingAmount * discount || 0) / 100;
  const discountedDueAmount = dueAmount - discountedGrandTotal;

  // Create new invoice
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
    billingAmount,
    disBillAmount: discountedGrandTotal,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    discount,
    receivedAmount,
    dueAmount: discountedDueAmount,
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

  const invoices = await Invoice.find({ userId }).sort({ createdAt: -1 });

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

export { createInvoice, getUserAllInvoices, getInvoiceById, updateInvoiceById };
