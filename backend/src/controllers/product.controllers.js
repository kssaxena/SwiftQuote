import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DeleteImage, UploadImages } from "../utils/imageKit.io.js";

const addProduct = asyncHandler(async (req, res) => {
  const { name, category, variants, description } = req.body;

  if (!name || !variants) {
    throw new ApiError(400, "Product name & variants required");
  }

  let imageResponse = {};

  // Handling file upload to ImageKit
  if (req?.file?.filename) {
    imageResponse = await UploadImages(req.file.filename, {
      folderStructure: `/billing/products/${name}`,
    });
  }

  const product = await Product.create({
    name,
    category,
    description,
    image: {
      url: imageResponse.url || "",
      fileId: imageResponse.fileId || "",
    },
    variants: JSON.parse(variants),
  });

  res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, description } = req.body;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  product.name = name || product.name;
  product.category = category || product.category;
  product.description = description || product.description;

  await product.save();

  res.json(new ApiResponse(200, product, "Product updated successfully"));
});

const updateVariantStock = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const { stock } = req.body;

  if (stock == null) throw new ApiError(400, "Stock required");

  const product = await Product.findOneAndUpdate(
    { _id: productId, "variants._id": variantId },
    { $set: { "variants.$.stock": stock } },
    { new: true }
  );

  if (!product) throw new ApiError(404, "Product or variant not found");

  res.json(new ApiResponse(200, product, "Stock updated successfully"));
});

const addVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantName, attributes, price, stock } = req.body;

  if (!variantName || !price) {
    throw new ApiError(400, "Variant name & price required");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    {
      $push: {
        variants: {
          variantName,
          attributes,
          price,
          stock: stock || 0,
        },
      },
    },
    { new: true }
  );

  if (!product) throw new ApiError(404, "Product not found");

  res.json(new ApiResponse(200, product, "Variant added successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  // Delete from ImageKit if exists
  if (product?.image?.fileId) {
    await DeleteImage(product.image.fileId);
  }

  await Product.deleteOne({ _id: id });

  res.json(new ApiResponse(200, {}, "Product deleted successfully"));
});

const deleteVariant = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const result = await Product.findByIdAndUpdate(
    productId,
    { $pull: { variants: { _id: variantId } } },
    { new: true }
  );

  if (!result) throw new ApiError(404, "Product or variant not found");

  res.json(new ApiResponse(200, result, "Variant deleted successfully"));
});

export {
  addProduct,
  updateProduct,
  updateVariantStock,
  addVariant,
  deleteProduct,
  deleteVariant,
};
