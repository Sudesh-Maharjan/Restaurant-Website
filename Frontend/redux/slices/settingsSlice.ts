import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// Types
export interface Settings {
  _id: string;
  restaurantName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  openingHours: string;
  hours?: {
    monFri: string;
    satSun: string;
  };
  logo: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  aboutUs: string;
  currency: string;
  createdAt: string;
}

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/settings`;

// Async Actions
export const getSettings = createAsyncThunk(
  'settings/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData: Partial<Settings>, { rejectWithValue }) => {
    try {
      const response = await api.put(API_URL, settingsData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const uploadLogo = createAsyncThunk(
  'settings/uploadLogo',
  async (logoFile: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post(`${API_URL}/logo`, logoFile, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload logo');
    }
  }
);

// Initial state
const initialState: SettingsState = {
  settings: null,
  isLoading: false,
  error: null,
};

// Settings Slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get settings
      .addCase(getSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(getSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload logo
      .addCase(uploadLogo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadLogo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settings = action.payload;
      })
      .addCase(uploadLogo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
