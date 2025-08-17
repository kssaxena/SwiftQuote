import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

// 🔹 Fetch invoices of a user
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-all-invoices/${userId}`,
        "get"
      );
      return response.data.data.invoices; // matches your ApiResponse
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch invoices");
    }
  }
);

// 🔹 Create a new invoice
export const createInvoice = createAsyncThunk(
  "invoices/createInvoice",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/generate-invoice/${userId}`,
        "post",
        formData
        // true // sending FormData
      );
      return response.data.data.invoice;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create invoice");
    }
  }
);

const InvoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInvoices: (state) => {
      state.invoices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch invoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create invoice
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.unshift(action.payload);
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoices } = InvoiceSlice.actions;

export default InvoiceSlice.reducer;
