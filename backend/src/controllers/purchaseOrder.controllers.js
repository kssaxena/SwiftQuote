import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { PurchaseOrder } from "../models/purchaseOrder.models.js";

const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID missing");
  }

  const {
    supplierName,
    supplierAddress,
    supplierPhone,
    supplierState,
    supplierGST,
    purchaseOrderNumber,
    purchaseOrderDate,
    expectedDeliveryDate,
    referenceNo,
    paymentTerms,
    deliveryTerms,
    billingAmount,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    discount,
    shippingCharge,
    advanceAmount,
    notes,
  } = req.body;

  // Required fields check
  if (
    !supplierName ||
    !supplierAddress ||
    !supplierPhone ||
    !supplierState ||
    !purchaseOrderNumber ||
    !purchaseOrderDate ||
    !expectedDeliveryDate ||
    billingAmount === undefined ||
    taxableValue === undefined ||
    sgstValue === undefined ||
    cgstValue === undefined ||
    totalTax === undefined
  ) {
    throw new ApiError(
      400,
      "Please provide all required purchase order fields",
    );
  }

  // Check for existing purchase order number
  const existingPO = await PurchaseOrder.findOne({ purchaseOrderNumber });
  if (existingPO) {
    throw new ApiError(400, "Purchase Order with this number already exists!");
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
  const shippingAmt = num(shippingCharge);
  const advanceAmt = num(advanceAmount);

  // Calculate discount
  let appliedDiscount = 0;
  let discountedBill = billAmt;

  if (discountPercent > 0 && discountPercent <= 100) {
    appliedDiscount = (billAmt * discountPercent) / 100;
  }

  discountedBill = billAmt - appliedDiscount;
  if (discountedBill < 0) discountedBill = 0;

  appliedDiscount = Number(appliedDiscount.toFixed(2));
  discountedBill = Number(discountedBill.toFixed(2));

  // Calculate due amount
  let dueAmt = discountedBill - advanceAmt;
  if (dueAmt < 0) dueAmt = 0;
  dueAmt = Number(dueAmt.toFixed(2));

  // Create purchase order
  const purchaseOrder = await PurchaseOrder.create({
    userId,
    supplierName,
    supplierAddress,
    supplierPhone,
    supplierGST,
    supplierState,
    purchaseOrderNumber,
    purchaseOrderDate,
    expectedDeliveryDate,
    referenceNo,
    paymentTerms,
    deliveryTerms,
    items,
    billingAmount: billAmt,
    shippingCharge: shippingAmt,
    disBillAmount: discountedBill,
    discount: appliedDiscount,
    taxableValue: num(taxableValue),
    sgstValue: num(sgstValue),
    cgstValue: num(cgstValue),
    totalTax: num(totalTax),
    advanceAmount: advanceAmt,
    dueAmount: dueAmt,
    notes,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        purchaseOrder,
        "Purchase Order created successfully",
      ),
    );
});

// Fetch all purchase orders for user
const getPurchaseOrdersByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const purchaseOrders = await PurchaseOrder.find({ userId });
  res.json(
    new ApiResponse(
      200,
      purchaseOrders,
      "Purchase Orders fetched successfully",
    ),
  );
});

// Fetch single purchase order
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const { purchaseOrderId } = req.params;
  const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase Order not found");
  }
  res.json(
    new ApiResponse(200, purchaseOrder, "Purchase Order fetched successfully"),
  );
});

// Update purchase order
const updatePurchaseOrderById = asyncHandler(async (req, res) => {
  const { purchaseOrderId, userId } = req.params;

  const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase Order not found");
  }

  if (purchaseOrder.userId.toString() !== userId) {
    throw new ApiError(403, "Unauthorized to update this Purchase Order");
  }

  const {
    supplierName,
    supplierAddress,
    supplierPhone,
    supplierState,
    supplierGST,
    purchaseOrderNumber,
    purchaseOrderDate,
    expectedDeliveryDate,
    referenceNo,
    paymentTerms,
    deliveryTerms,
    billingAmount,
    taxableValue,
    sgstValue,
    cgstValue,
    totalTax,
    discount,
    shippingCharge,
    advanceAmount,
    notes,
  } = req.body;

  // Parse items if provided
  let items = purchaseOrder.items;
  if (req.body.items) {
    try {
      items = JSON.parse(req.body.items || "[]");
    } catch {
      throw new ApiError(400, "Invalid items format");
    }
  }

  // Safe number parsing
  const num = (val) => (val !== "" && val !== undefined ? Number(val) : 0);
  const billAmt = num(billingAmount || purchaseOrder.billingAmount);
  const discountPercent = num(discount || purchaseOrder.discount);
  const shippingAmt = num(shippingCharge || purchaseOrder.shippingCharge);
  const advanceAmt = num(advanceAmount || purchaseOrder.advanceAmount);

  // Calculate discount
  let appliedDiscount = 0;
  let discountedBill = billAmt;

  if (discountPercent > 0 && discountPercent <= 100) {
    appliedDiscount = (billAmt * discountPercent) / 100;
  }

  discountedBill = billAmt - appliedDiscount;
  if (discountedBill < 0) discountedBill = 0;

  appliedDiscount = Number(appliedDiscount.toFixed(2));
  discountedBill = Number(discountedBill.toFixed(2));

  // Calculate due amount
  let dueAmt = discountedBill - advanceAmt;
  if (dueAmt < 0) dueAmt = 0;
  dueAmt = Number(dueAmt.toFixed(2));

  // Update purchase order
  const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    purchaseOrderId,
    {
      supplierName: supplierName || purchaseOrder.supplierName,
      supplierAddress: supplierAddress || purchaseOrder.supplierAddress,
      supplierPhone: supplierPhone || purchaseOrder.supplierPhone,
      supplierGST: supplierGST || purchaseOrder.supplierGST,
      supplierState: supplierState || purchaseOrder.supplierState,
      purchaseOrderNumber:
        purchaseOrderNumber || purchaseOrder.purchaseOrderNumber,
      purchaseOrderDate: purchaseOrderDate || purchaseOrder.purchaseOrderDate,
      expectedDeliveryDate:
        expectedDeliveryDate || purchaseOrder.expectedDeliveryDate,
      referenceNo: referenceNo || purchaseOrder.referenceNo,
      paymentTerms: paymentTerms || purchaseOrder.paymentTerms,
      deliveryTerms: deliveryTerms || purchaseOrder.deliveryTerms,
      items,
      billingAmount: billAmt,
      shippingCharge: shippingAmt,
      disBillAmount: discountedBill,
      discount: appliedDiscount,
      taxableValue: num(taxableValue || purchaseOrder.taxableValue),
      sgstValue: num(sgstValue || purchaseOrder.sgstValue),
      cgstValue: num(cgstValue || purchaseOrder.cgstValue),
      totalTax: num(totalTax || purchaseOrder.totalTax),
      advanceAmount: advanceAmt,
      dueAmount: dueAmt,
      notes: notes || purchaseOrder.notes,
    },
    { new: true },
  );

  res.json(
    new ApiResponse(
      200,
      updatedPurchaseOrder,
      "Purchase Order updated successfully",
    ),
  );
});

// Delete purchase order
const deletePurchaseOrder = asyncHandler(async (req, res) => {
  const { purchaseOrderId, userId } = req.params;

  const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
  if (!purchaseOrder) {
    throw new ApiError(404, "Purchase Order not found");
  }

  if (purchaseOrder.userId.toString() !== userId) {
    throw new ApiError(403, "Unauthorized to delete this Purchase Order");
  }

  await PurchaseOrder.findByIdAndDelete(purchaseOrderId);

  res.json(new ApiResponse(200, {}, "Purchase Order deleted successfully"));
});

// Update purchase order status
const updatePurchaseOrderStatus = asyncHandler(async (req, res) => {
  const { purchaseOrderId } = req.params;
  const { status, paymentStatus } = req.body;

  const validStatuses = [
    "Draft",
    "Sent",
    "Confirmed",
    "Delivered",
    "Cancelled",
  ];
  const validPaymentStatuses = ["Pending", "Partial", "Paid"];

  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    throw new ApiError(400, "Invalid payment status");
  }

  const updatedPurchaseOrder = await PurchaseOrder.findByIdAndUpdate(
    purchaseOrderId,
    {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
    },
    { new: true },
  );

  if (!updatedPurchaseOrder) {
    throw new ApiError(404, "Purchase Order not found");
  }

  res.json(
    new ApiResponse(
      200,
      updatedPurchaseOrder,
      "Purchase Order status updated successfully",
    ),
  );
});

export {
  createPurchaseOrder,
  getPurchaseOrdersByUserId,
  getPurchaseOrderById,
  updatePurchaseOrderById,
  deletePurchaseOrder,
  updatePurchaseOrderStatus,
};
