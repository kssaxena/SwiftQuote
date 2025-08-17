import { ApiError } from "../utils/apiError.js";
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

  // Create new invoice
  const invoice = await Invoice.create({
    userId,
    customerName,
    customerAddress,
    customerPhone,
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
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    receivedAmount,
    dueAmount,
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

// Update an invoice by ID
// const updateInvoice = asyncHandler(async (req, res) => {
//   const { invoiceId } = req.params;

//   if (!invoiceId) {
//     throw new ApiError(400, "Invoice ID is required");
//   }

//   // Parse items from request body (since they come as JSON string in FormData)
//   let items = [];
//   try {
//     items = JSON.parse(req.body.items || "[]");
//   } catch (err) {
//     throw new ApiError(400, "Invalid items format");
//   }

//   // Collect all fields (only update if provided)
//   const updateData = {
//     customerName,
//     customerAddress,
//     customerPhone,
//     customerState,
//     invoiceNumber,
//     invoiceDate,
//     referenceNo,
//     buyerOrderNo,
//     dispatchDocNo,
//     deliveryNote: req.body.deliveryNote,
//     destination: req.body.destination,
//     paymentTerms: req.body.paymentTerms,
//     deliveryTerms: req.body.deliveryTerms,
//     billingAmount: req.body.billingAmount,
//     taxableValue: req.body.taxableValue,
//     sgstValue: req.body.sgstValue,
//     cgstValue: req.body.cgstValue,
//     totalTax: req.body.totalTax,
//     receivedAmount: req.body.receivedAmount,
//     dueAmount: req.body.dueAmount,
//   };

//   if (items.length > 0) {
//     updateData.items = items;
//   }

//   // Find and update invoice
//   const updatedInvoice = await Invoice.findByIdAndUpdate(
//     invoiceId,
//     { $set: updateData },
//     { new: true, runValidators: true }
//   );

//   if (!updatedInvoice) {
//     throw new ApiError(404, "Invoice not found");
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         { invoice: updatedInvoice },
//         "Invoice updated successfully"
//       )
//     );
// });

export { createInvoice, getUserAllInvoices, getInvoiceById };
