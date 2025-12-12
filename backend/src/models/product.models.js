import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    variantName: { type: String, required: true }, // e.g. "Red Large Door"
    attributes: {
      size: { type: String },
      color: { type: String },
      material: { type: String },
      custom: { type: Object }, // For any extra dynamic properties
    },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, unique: true },
    category: { type: String }, // Optional
    image: {
      url: { type: String },
      fileId: { type: String }, // Required for delete
    },
    variants: [VariantSchema],
    description: { type: String },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", ProductSchema);
