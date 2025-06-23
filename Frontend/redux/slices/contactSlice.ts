import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// Types
interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

interface ContactState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  message: string | null;
}

// API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/contact`;

// Async Actions
export const submitContactForm = createAsyncThunk(
  'contact/submitContactForm',
  async (contactData: ContactFormData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, contactData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit contact form');
    }
  }
);

// Initial state
const initialState: ContactState = {
  isLoading: false,
  error: null,
  success: false,
  message: null,
};

// Contact Slice
const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {
    clearContactState: (state) => {
      state.error = null;
      state.success = false;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Submit contact form
      .addCase(submitContactForm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(submitContactForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.message = action.payload.message;
      })
      .addCase(submitContactForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { clearContactState } = contactSlice.actions;
export default contactSlice.reducer;
