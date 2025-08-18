import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  size: { type: String },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  color: { type: String },
});

const invoiceSchema = new mongoose.Schema(
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

    // Invoice Details
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    referenceNo: { type: String },
    buyerOrderNo: { type: String },
    dispatchDocNo: { type: String },
    deliveryNote: { type: String },
    destination: { type: String, required: true },
    paymentTerms: { type: String, required: true },
    deliveryTerms: { type: String },

    // Goods / Items
    items: [itemSchema],

    // Tax & Summary
    billingAmount: { type: Number, required: true }, // total incl. tax
    taxableValue: { type: Number, required: true },
    sgstValue: { type: Number, required: true },
    cgstValue: { type: Number, required: true },
    totalTax: { type: Number, required: true },
    receivedAmount: { type: Number, required: true },
    dueAmount: { type: Number, required: true },

    // pdfUrl: String, // optional if you want to generate/store PDF later
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
