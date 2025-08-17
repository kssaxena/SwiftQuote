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

export { createInvoice };
