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

module.exports = mongoose.model("Template", templateSchema);
