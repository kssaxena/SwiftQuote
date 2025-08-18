import mongoose from "mongoose";

const estimateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    estimateNumber: { type: String, required: true },
    referenceNo: String,
    buyerOrderNo: String,
    dispatchDocNo: String,
    deliveryNote: String,
    destination: String,
    paymentTerms: String,
    deliveryTerms: String,

    // Customer Details
    customerName: { type: String, required: true },
    customerAddress: String,
    customerPhone: String,
    customerState: String,

    // Items
    items: [
      {
        description: String,
        size: String,
        qty: Number,
        rate: Number,
        amount: Number,
      },
    ],

    // Billing
    taxableValue: Number,
    sgstValue: Number,
    cgstValue: Number,
    totalTax: Number,
    billingAmount: Number,
    receivedAmount: Number,
    dueAmount: Number,
    amountInWords: String,

    validUntil: Date, // ✅ extra field for estimate
    pdfUrl: String,
  },
  { timestamps: true }
);

export const Estimate = mongoose.model("Estimate", estimateSchema);
