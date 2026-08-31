import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  size: { type: String },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  color: { type: String },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Supplier Details
    supplierName: { type: String, required: true },
    supplierAddress: { type: String, required: true },
    supplierPhone: { type: String, required: true },
    supplierGST: { type: String },
    supplierState: { type: String, required: true },

    // Purchase Order Details
    purchaseOrderNumber: { type: String, required: true },
    purchaseOrderDate: { type: Date, required: true },
    expectedDeliveryDate: { type: Date, required: true },
    referenceNo: { type: String },
    paymentTerms: { type: String },
    deliveryTerms: { type: String },
    notes: { type: String },

    // Goods / Items
    items: [itemSchema],

    // Tax & Summary
    billingAmount: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    disBillAmount: { type: Number },
    discount: { type: Number, default: 0 },
    taxableValue: { type: Number, required: true },
    sgstValue: { type: Number, required: true },
    cgstValue: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ["Draft", "Sent", "Confirmed", "Delivered", "Cancelled"],
      default: "Draft",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

export const PurchaseOrder = mongoose.model(
  "PurchaseOrder",
  purchaseOrderSchema,
);
