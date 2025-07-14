import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    data: {
      type: Map,
      of: String,
      required: true,
    },
    pdfUrl: String,
  },
  { timestamps: true }
);

export const Invoice = mongoose.model("Invoice", invoiceSchema);
