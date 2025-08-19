import mongoose from "mongoose";

const estimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Customer Details
    customerName: { type: String, required: true },
    customerAddress: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerGST: { type: String },
    customerState: { type: String, required: true },

    // Estimate Details
    estimateNumber: { type: String, required: true },
    estimateDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    referenceNo: { type: String },
    buyerOrderNo: { type: String },
    dispatchDocNo: { type: String },
    deliveryNote: { type: String },
    destination: { type: String, required: true },
    paymentTerms: { type: String, required: true },

    // Goods/Items
    items: [
      {
        description: { type: String, required: true },
        size: { type: String },
        color: { type: String },
        qty: { type: Number, required: true },
        rate: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],

    // Tax & Summary
    billingAmount: { type: Number, required: true },
    taxableValue: { type: Number, required: true },
    sgst: { type: Number, required: true },
    cgst: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    receivedAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Estimate = mongoose.model("Estimate", estimateSchema);
