import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

// 🔹 Fetch all invoices of a user
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-all-invoices/${userId}`,
        "get"
      );
      return response.data.data.invoices;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch invoices");
    }
  }
);

// 🔹 Fetch a single invoice by ID
export const fetchInvoiceById = createAsyncThunk(
  "invoices/fetchInvoiceById",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await FetchData(`users/get-invoice/${invoiceId}`, "get");
      return response.data.data.invoice;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch invoice");
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
        // true
      );
      return response.data.data.invoice;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to create invoice");
    }
  }
);

// 🔹 Update an existing invoice
export const updateInvoice = createAsyncThunk(
  "invoices/updateInvoice",
  async ({ invoiceId, formData, userId }, { rejectWithValue }) => {
    try {
      console.log(invoiceId);
      const response = await FetchData(
        `users/update-invoice/${invoiceId}/${userId}`,
        "post", // or "put" depending on your backend
        formData
        // true
      );
      console.log(response);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update invoice");
    }
  }
);

// 🔹 Delete an invoice
export const deleteInvoice = createAsyncThunk(
  "invoices/deleteInvoice",
  async (invoiceId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/delete-invoice/${invoiceId}`,
        "delete"
      );
      return invoiceId; // return only the id so we can remove it locally
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to delete invoice");
    }
  }
);

const InvoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: [],
    currentInvoice: null, // store invoice when fetching by ID
    loading: false,
    error: null,
  },
  reducers: {
    clearInvoices: (state) => {
      state.invoices = [];
    },
    clearCurrentInvoice: (state) => {
      state.currentInvoice = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch invoices
    builder
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
      });

    // Fetch single invoice
    builder
      .addCase(fetchInvoiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentInvoice = action.payload;
      })
      .addCase(fetchInvoiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create invoice
    builder
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

    // Update invoice
    builder
      .addCase(updateInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.loading = false;
        const updatedInvoice = action.payload;
        state.invoices = state.invoices.map((inv) =>
          inv._id === updatedInvoice._id ? updatedInvoice : inv
        );
        // console.log(state.currentInvoice?._id);
        if (state.currentInvoice?._id === updatedInvoice._id) {
          state.currentInvoice = updatedInvoice;
        }
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete invoice
    builder
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = state.invoices.filter(
          (inv) => inv._id !== action.payload
        );
        if (state.currentInvoice?._id === action.payload) {
          state.currentInvoice = null;
        }
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvoices, clearCurrentInvoice } = InvoiceSlice.actions;

export default InvoiceSlice.reducer;
