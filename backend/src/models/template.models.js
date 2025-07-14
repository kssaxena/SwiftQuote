import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    templateName: String,
    fields: [
      {
        label: String,
        key: String,
        type: String,
        required: Boolean,
      },
    ],
    logoUrl: String,
    layoutSettings: Object,
  },
  { timestamps: true }
);

export const Template = mongoose.model("Template", templateSchema);
