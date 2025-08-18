import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { FetchData } from "../FetchFromApi";

// Fetch all estimates
export const fetchEstimates = createAsyncThunk(
  "estimates/fetchEstimates",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await FetchData(`users/get-estimates/${userId}`, "get");
      // console.log(response);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Fetch single estimate
export const fetchEstimateById = createAsyncThunk(
  "estimates/fetchEstimateById",
  async (estimateId, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/get-estimate/${estimateId}`,
        "get"
      );
      // console.log(response);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Create estimate
export const createEstimate = createAsyncThunk(
  "estimates/createEstimate",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      const response = await FetchData(
        `users/create-estimate/${userId}`,
        "post",
        formData
      );
      alert("Estimate generated successfully ! ");
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// Update estimate
export const updateEstimate = createAsyncThunk(
  "estimates/updateEstimate",
  async ({ estimateId, formData }, { rejectWithValue }) => {
    try {
      return await FetchData(
        `users/update-estimate/${estimateId}`,
        "put",
        formData
      );
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const estimateSlice = createSlice({
  name: "estimates",
  initialState: {
    estimates: [],
    currentEstimate: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearEstimateState: (state) => {
      state.estimates = [];
      state.currentEstimate = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchEstimates.fulfilled, (state, action) => {
        state.estimates = action.payload;
        state.loading = false;
      })
      // Fetch by ID
      .addCase(fetchEstimateById.fulfilled, (state, action) => {
        state.currentEstimate = action.payload;
        state.loading = false;
      })
      // Create
      .addCase(createEstimate.fulfilled, (state, action) => {
        state.estimates.unshift(action.payload);
        state.currentEstimate = action.payload;
        state.loading = false;
      })
      // Update
      .addCase(updateEstimate.fulfilled, (state, action) => {
        const updated = action.payload;
        state.estimates = state.estimates.map((est) =>
          est._id === updated._id ? updated : est
        );
        if (state.currentEstimate?._id === updated._id) {
          state.currentEstimate = updated;
        }
        state.loading = false;
      });
  },
});

export const { clearEstimateState } = estimateSlice.actions;
export default estimateSlice.reducer;
