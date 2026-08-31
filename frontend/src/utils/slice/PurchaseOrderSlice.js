import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrders",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-all-purchase-orders/${userId}`,
        "get",
      );
      return response.data.data.purchaseOrders;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch purchase orders",
      );
    }
  },
);

export const fetchPurchaseOrderById = createAsyncThunk(
  "purchaseOrders/fetchPurchaseOrderById",
  async (purchaseOrderId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-purchase-order/${purchaseOrderId}`,
        "get",
      );
      return response.data.data.purchaseOrder;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch purchase order",
      );
    }
  },
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/createPurchaseOrder",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/generate-purchase-order/${userId}`,
        "post",
        formData,
      );
      console.log(response);
      alert(
        response.data.data.message ||
          response.data.message ||
          "Purchase Order created successfully!",
      );
      return response.data.data.purchaseOrder;
    } catch (err) {
      alert("Failed to create Purchase Order");
      return rejectWithValue(
        err.response?.data || "Failed to create purchase order",
      );
    }
  },
);

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/updatePurchaseOrder",
  async ({ purchaseOrderId, formData, userId }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/update-purchase-order/${purchaseOrderId}/${userId}`,
        "post",
        formData,
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to update purchase order",
      );
    }
  },
);

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/deletePurchaseOrder",
  async (purchaseOrderId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/delete-purchase-order/${purchaseOrderId}`,
        "delete",
      );
      return purchaseOrderId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to delete purchase order",
      );
    }
  },
);

export const updatePurchaseOrderStatus = createAsyncThunk(
  "purchaseOrders/updatePurchaseOrderStatus",
  async ({ purchaseOrderId, status, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/update-purchase-order-status/${purchaseOrderId}`,
        "post",
        { status, paymentStatus },
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to update purchase order status",
      );
    }
  },
);

const PurchaseOrderSlice = createSlice({
  name: "purchaseOrders",
  initialState: {
    purchaseOrders: [],
    currentPurchaseOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearPurchaseOrders: (state) => {
      state.purchaseOrders = [];
    },
    clearCurrentPurchaseOrder: (state) => {
      state.currentPurchaseOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(fetchPurchaseOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPurchaseOrder = action.payload;
      })
      .addCase(fetchPurchaseOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(createPurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders.unshift(action.payload);
      })
      .addCase(createPurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updatePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPO = action.payload;
        state.purchaseOrders = state.purchaseOrders.map((po) =>
          po._id === updatedPO._id ? updatedPO : po,
        );
        if (state.currentPurchaseOrder?._id === updatedPO._id) {
          state.currentPurchaseOrder = updatedPO;
        }
      })
      .addCase(updatePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(deletePurchaseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePurchaseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.purchaseOrders = state.purchaseOrders.filter(
          (po) => po._id !== action.payload,
        );
        if (state.currentPurchaseOrder?._id === action.payload) {
          state.currentPurchaseOrder = null;
        }
      })
      .addCase(deletePurchaseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updatePurchaseOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePurchaseOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPO = action.payload;
        state.purchaseOrders = state.purchaseOrders.map((po) =>
          po._id === updatedPO._id ? updatedPO : po,
        );
        if (state.currentPurchaseOrder?._id === updatedPO._id) {
          state.currentPurchaseOrder = updatedPO;
        }
      })
      .addCase(updatePurchaseOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPurchaseOrders, clearCurrentPurchaseOrder } =
  PurchaseOrderSlice.actions;

export default PurchaseOrderSlice.reducer;
