import { Quotation } from "../models/quotation.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ✅ Create a new Quotation
const createQuotation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const {
    customerName,
    customerAddress,
    customerPhone,
    customerGST,
    customerState,
    quotationNumber,
    quotationFromDate,
    quotationUptoDate,
    subject,
  } = req.body;

  // Validate required fields
  if (
    !customerName ||
    !customerAddress ||
    !customerPhone ||
    !customerState ||
    !quotationNumber ||
    !quotationFromDate ||
    !quotationUptoDate
  ) {
    throw new ApiError(400, "Please provide all required invoice fields");
  }

  const existingQuotation = await Quotation.findOne({
    quotationNumber,
  });
  if (existingQuotation) {
    throw new ApiError(400, "Quotation already exist !");
  }

  let items = [];
  try {
    items = JSON.parse(req.body.items || "[]");
  } catch (err) {
    throw new ApiError(400, "Invalid items format");
  }

  if (!items.length) throw new ApiError(400, "At least one item is required");

  const quotation = await Quotation.create({
    userId,
    customerName,
    customerAddress,
    customerPhone,
    customerGST,
    customerState,
    quotationNumber,
    quotationFromDate,
    quotationUptoDate,
    subject,
    items,
  });

  // If you want to link quotations to users
  // await User.findByIdAndUpdate(userId, {
  //   $push: { quotations: quotation._id },
  // });

  res
    .status(201)
    .json(
      new ApiResponse(201, { quotation }, "Quotation created successfully")
    );
});

// ✅ Fetch all quotations for a user
const getQuotationsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("controller reached ", userId);
  if (!userId) throw new ApiError(400, "Invalid User");

  const quotations = await Quotation.find({ userId }).sort({ createdAt: -1 });

  console.log(quotations);
  return res
    .status(200)
    .json(
      new ApiResponse(200, { quotations }, "Quotations fetched successfully")
    );
});

// ✅ Fetch single quotation by ID
const getQuotationById = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  if (!quotationId) {
    throw new ApiError(400, "Quotation ID is required");
  }
  const quotation = await Quotation.findById(quotationId).populate();
  if (!quotation) throw new ApiError(404, "Quotation not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { quotation }, "Quotation fetched successfully")
    );
});

// ✅ Update quotation
const updateQuotationById = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  // Copy body data
  let updatedData = { ...req.body };

  // Parse items if provided
  if (updatedData.items) {
    try {
      updatedData.items = JSON.parse(updatedData.items);
    } catch (err) {
      throw new ApiError(400, "Invalid items format. Must be JSON.");
    }
  }

  // ✅ Debug log
  console.log("Updating quotation:", quotationId, updatedData);

  const quotation = await Quotation.findById(quotationId);
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }

  // Merge updated fields into existing quotation
  Object.keys(updatedData).forEach((key) => {
    quotation[key] = updatedData[key];
  });

  await quotation.save();

  res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation updated successfully"));
});

const quotationStatus = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  // Find product
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) {
    return res.status(404).json({
      success: false,
      message: "Quotation not found",
    });
  }

  // Update status
  quotation.status = "Downloaded & Sent";
  await quotation.save();

  res.status(200).json({
    success: true,
    message: "quotation marked as active successfully",
    quotation,
  });
});

// ✅ Delete quotation
const deleteQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const quotation = await Quotation.findByIdAndDelete(id);

  if (!quotation) throw new ApiError(404, "Quotation not found");

  res.json(new ApiResponse(200, quotation, "Quotation deleted successfully"));
});

export {
  createQuotation,
  getQuotationsByUserId,
  getQuotationById,
  updateQuotationById,
  deleteQuotation,
  quotationStatus,
};
