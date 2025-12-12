import { Product } from "../models/product.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DeleteImage, UploadImages } from "../utils/imageKit.io.js";

const addProduct = asyncHandler(async (req, res) => {
  const { name, category = "", description = "" } = req.body;
  const { userId } = req.params;

  if (!name) {
    throw new ApiError(400, "Product name is required");
  }

  // Parse variants: accept either array or JSON string
  let variants = [];
  if (req.body.variants) {
    try {
      variants =
        typeof req.body.variants === "string"
          ? JSON.parse(req.body.variants)
          : req.body.variants;
      if (!Array.isArray(variants)) {
        throw new Error("Variants must be an array");
      }
    } catch (err) {
      throw new ApiError(400, "Invalid variants format. Send JSON array.");
    }
  } else {
    throw new ApiError(400, "At least one variant is required");
  }

  // Optional: check for duplicate product name
  const exists = await Product.findOne({ name });
  if (exists) {
    throw new ApiError(400, "Product with same name already exists");
  }

  // Upload image if provided (match the pattern used in registerUser)
  let imageResponse = {};
  try {
    const imageFile = req.file;
    if (imageFile) {
      // Build a safe folder name from product name
      const folderName = `${name}`.split(" ").join("-");
      // Call UploadImages in same style as your registerUser usage
      // (some UploadImages implementations accept extra args; this mirrors your working controller)
      imageResponse = await UploadImages(
        imageFile.filename,
        { folderStructure: `all-products/${folderName}` },
        [`${folderName}-img`]
      );

      // Basic validation of upload result
      if (
        !imageResponse ||
        (!imageResponse.url && !imageResponse.fileId && !imageResponse.file_id)
      ) {
        throw new Error("ImageKit upload returned invalid response");
      }
    }
  } catch (err) {
    console.error("Failed to upload product image:", err);
    // Prefer a 500 internal error for upload issues
    throw new ApiError(
      500,
      "Failed to upload product image. Please try again."
    );
  }

  // Normalize fileId key (ImageKit response may use different keys)
  const fileId =
    imageResponse?.fileId || imageResponse?.file_id || imageResponse?.fileId;

  // Prepare product payload
  const productPayload = {
    userId,
    name,
    category,
    description,
    variants,
    image: {
      url: imageResponse?.url || "",
      fileId: fileId || "",
    },
  };

  // Save product
  const product = await Product.create(productPayload);

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

const getUserAllProducts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching products for userId:", userId);

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const products = await Product.find({ userId }).sort({ createdAt: -1 });

  if (!products || products.length === 0) {
    throw new ApiError(404, "No products found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { products }, "Products fetched successfully"));
});

export {
  addProduct,
  updateProduct,
  updateVariantStock,
  addVariant,
  deleteProduct,
  deleteVariant,
  getUserAllProducts,
};
