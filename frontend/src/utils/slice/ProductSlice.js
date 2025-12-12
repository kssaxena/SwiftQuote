// src/utils/slice/ProductSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

// 🟢 Fetch all products
export const fetchAllProducts = createAsyncThunk(
  "products/fetchAll",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(`users/product/all/${userId}`, "get");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch products"
      );
    }
  }
);

// 🟢 Add product (multipart form with image/variant)
export const addProduct = createAsyncThunk(
  "products/add",
  async ({ formData, userId }, { rejectWithValue }) => {
    console.log(userId);

    try {
      const response = await FetchData(
        `users/product/add/${userId}`,
        "post",
        formData,
        true
      );
      console.log(response);
      return response.data.data;
    } catch (err) {
      console.log(err);
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add product"
      );
    }
  }
);

// 🔵 Update product general details (text only)
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await FetchData(`product/${id}`, "post", data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update product"
      );
    }
  }
);

// 🔵 Add new variant
export const addVariant = createAsyncThunk(
  "products/addVariant",
  async ({ productId, data }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `product/${productId}/variant`,
        "post",
        data
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add variant"
      );
    }
  }
);

// 🟡 Update Stock manually for specific variant
export const updateVariantStock = createAsyncThunk(
  "products/updateStock",
  async ({ productId, variantId, stock }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `product/${productId}/variant/${variantId}/stock`,
        "post",
        { stock }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update stock"
      );
    }
  }
);

// 🔴 Delete Variant
export const deleteVariant = createAsyncThunk(
  "products/deleteVariant",
  async ({ productId, variantId }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `product/${productId}/variant/${variantId}`,
        "delete"
      );
      return { productId, variantId };
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete variant"
      );
    }
  }
);

// 🔴 Delete Product
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (productId, { rejectWithValue }) => {
    try {
      await FetchData(`product/${productId}`, "delete");
      return productId;
    } catch (err) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to delete product"
      );
    }
  }
);

// 🔥 Slice
const ProductSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder

      // FETCH
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD PRODUCT
      .addCase(addProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })

      // UPDATE PRODUCT
      .addCase(updateProduct.fulfilled, (state, action) => {
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx > -1) state.products[idx] = action.payload;
      })

      // ADD VARIANT
      .addCase(addVariant.fulfilled, (state, action) => {
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx > -1) state.products[idx] = action.payload;
      })

      // UPDATE STOCK
      .addCase(updateVariantStock.fulfilled, (state, action) => {
        const idx = state.products.findIndex(
          (p) => p._id === action.payload._id
        );
        if (idx > -1) state.products[idx] = action.payload;
      })

      // DELETE VARIANT
      .addCase(deleteVariant.fulfilled, (state, action) => {
        const { productId, variantId } = action.payload;
        const prod = state.products.find((p) => p._id === productId);
        if (prod) {
          prod.variants = prod.variants.filter((v) => v._id !== variantId);
        }
      })

      // DELETE PRODUCT
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      });
  },
});

export default ProductSlice.reducer;
