import { Estimate } from "../models/estimate.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createEstimate = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  let items = [];

  try {
    items = JSON.parse(req.body.items || "[]");
  } catch (err) {
    throw new ApiError(400, "Invalid items format");
  }

  if (!items.length) throw new ApiError(400, "At least one item is required");

  const estimate = await Estimate.create({
    userId,
    ...req.body,
    items,
  });

  res.status(201).json(new ApiResponse(201, estimate, "Estimate created"));
});

const getEstimatesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const estimates = await Estimate.find({ userId }).sort({ createdAt: -1 });
  res
    .status(200)
    .json(new ApiResponse(200, estimates, "User estimates fetched"));
});

const getEstimateById = asyncHandler(async (req, res) => {
  const { estimateId } = req.params;
  const estimate = await Estimate.findById(estimateId);
  if (!estimate) throw new ApiError(404, "Estimate not found");
  res.status(200).json(new ApiResponse(200, estimate, "Estimate fetched"));
});

const updateEstimate = asyncHandler(async (req, res) => {
  const { estimateId } = req.params;
  let items = [];

  try {
    items = JSON.parse(req.body.items || "[]");
  } catch (err) {
    throw new ApiError(400, "Invalid items format");
  }

  const updatedEstimate = await Estimate.findByIdAndUpdate(
    estimateId,
    { ...req.body, items },
    { new: true }
  );

  if (!updatedEstimate) throw new ApiError(404, "Estimate not found");
  res
    .status(200)
    .json(new ApiResponse(200, updatedEstimate, "Estimate updated"));
});

export {
  createEstimate,
  getEstimatesByUserId,
  updateEstimate,
  getEstimateById,
};
