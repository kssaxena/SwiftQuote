import { Estimate } from "../models/estimate.models.js";
import { User } from "../models/user.models.js";
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

  // await User.findByIdAndUpdate(userId, {
  //   $push: { estimates: estimate._id },
  // });

  res
    .status(201)
    .json(new ApiResponse(201, estimate, "Estimate created successfully"));
});

// Fetch all estimates for user
const getEstimatesByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const estimates = await Estimate.find({ userId });
  res.json(new ApiResponse(200, estimates, "Estimates fetched successfully"));
});

// Fetch single estimate
const getEstimateById = asyncHandler(async (req, res) => {
  const { estimateId } = req.params;
  const estimate = await Estimate.findById(estimateId);
  if (!estimate) throw new ApiError(404, "Estimate not found");
  res.json(new ApiResponse(200, estimate, "Estimate fetched successfully"));
});

// Update estimate
const updateEstimate = asyncHandler(async (req, res) => {
  let items = [];
  if (req.body.items) {
    try {
      items = JSON.parse(req.body.items || "[]");
    } catch {
      throw new ApiError(400, "Invalid items format");
    }
  }

  const updatedEstimate = await Estimate.findByIdAndUpdate(
    req.params.id,
    { ...req.body, ...(items.length && { items }) },
    { new: true }
  );

  if (!updatedEstimate) throw new ApiError(404, "Estimate not found");
  res.json(
    new ApiResponse(200, updatedEstimate, "Estimate updated successfully")
  );
});

export {
  createEstimate,
  getEstimatesByUserId,
  updateEstimate,
  getEstimateById,
};
