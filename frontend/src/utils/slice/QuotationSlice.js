import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

export const fetchQuotations = createAsyncThunk(
  "quotations/fetchQuotations",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-all-quotations/${userId}`,
        "get"
      );
      return response.data.data.quotations;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to fetch quotations"
      );
    }
  }
);

export const fetchQuotationById = createAsyncThunk(
  "quotations/fetchQuotationById",
  async (quotationId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-quotation/${quotationId}`,
        "get"
      );
      return response.data.data.quotation;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch quotation");
    }
  }
);

export const createQuotation = createAsyncThunk(
  "quotations/createQuotation",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/generate-quotation/${userId}`,
        "post",
        formData
      );
      return response.data.data.quotation;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to create quotation"
      );
    }
  }
);

export const updateQuotation = createAsyncThunk(
  "quotations/updateQuotation",
  async ({ quotationId, formData, userId }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/update-quotation/${quotationId}/${userId}`,
        "post",
        formData
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to update quotation"
      );
    }
  }
);

export const deleteQuotation = createAsyncThunk(
  "quotations/deleteQuotation",
  async (quotationId, { rejectWithValue }) => {
    try {
      await FetchData(`users/delete-quotation/${quotationId}`, "delete");
      return quotationId;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Failed to delete quotation"
      );
    }
  }
);

const QuotationSlice = createSlice({
  name: "quotations",
  initialState: {
    quotations: [],
    currentQuotation: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearQuotations: (state) => {
      state.quotations = [];
    },
    clearCurrentQuotation: (state) => {
      state.currentQuotation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuotations
      .addCase(fetchQuotations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotations.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = action.payload;
      })
      .addCase(fetchQuotations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchQuotationById
      .addCase(fetchQuotationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuotationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuotation = action.payload;
      })
      .addCase(fetchQuotationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // createQuotation
      .addCase(createQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations.unshift(action.payload);
      })
      .addCase(createQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // updateQuotation
      .addCase(updateQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuotation.fulfilled, (state, action) => {
        state.loading = false;
        const updatedQuotation = action.payload;
        state.quotations = state.quotations.map((q) =>
          q._id === updatedQuotation._id ? updatedQuotation : q
        );
        if (state.currentQuotation?._id === updatedQuotation._id) {
          state.currentQuotation = updatedQuotation;
        }
      })
      .addCase(updateQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // deleteQuotation
      .addCase(deleteQuotation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuotation.fulfilled, (state, action) => {
        state.loading = false;
        state.quotations = state.quotations.filter(
          (q) => q._id !== action.payload
        );
        if (state.currentQuotation?._id === action.payload) {
          state.currentQuotation = null;
        }
      })
      .addCase(deleteQuotation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuotations, clearCurrentQuotation } =
  QuotationSlice.actions;
export default QuotationSlice.reducer;
