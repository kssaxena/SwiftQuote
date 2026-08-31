import mongoose from "mongoose";

const dealerSchema = new mongoose.Schema(
  {
    dealerName: String,
    dealerContactNumber: String,
    dealerEmail: String,
    officeDetails: {
      officeName: String,
      officeAddress: String,
      officeContactNumber: String,
      GST: String,
    },
    accountDetails: {
      bankName: String,
      branchName: String,
      accountHolderName: String,
      accountNumber: String,
      confirmAccountNumber: String,
      ifscCode: String,
    },
  },
  { timestamps: true },
);

export const Dealer = mongoose.model("Dealer", dealerSchema);
