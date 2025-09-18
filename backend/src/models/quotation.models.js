import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema(
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
    customerEmail: { type: String },
    customerGST: { type: String },
    customerState: { type: String, required: true },

    // Quotation Details
    quotationNumber: { type: String, required: true },
    quotationDate: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    referenceNo: { type: String },
    buyerOrderNo: { type: String },
    deliveryNote: { type: String },
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
    subTotal: { type: Number, required: true },
    taxableValue: { type: Number, required: true },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, required: true },
    grandTotal: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export const Quotation = mongoose.model("Quotation", quotationSchema);
