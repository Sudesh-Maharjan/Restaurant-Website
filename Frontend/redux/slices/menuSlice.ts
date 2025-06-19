import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface MenuFile {
  type: 'pdf' | 'image' | null;
  url: string | null;
  name: string | null;
  uploadedAt: string | null;
}

interface MenuState {
  menuFile: MenuFile;
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/menu`;

// Async Actions
export const getMenuFile = createAsyncThunk(
  'menu/getMenuFile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch menu file');
    }
  }
);

export const uploadMenuFile = createAsyncThunk(
  'menu/uploadMenuFile',
  async (formData: FormData, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };
      
      const response = await axios.post(`${API_URL}/upload`, formData, config);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload menu file');
    }
  }
);

export const deleteMenuFile = createAsyncThunk(
  'menu/deleteMenuFile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      
      await axios.delete(API_URL, config);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete menu file');
    }
  }
);

// Initial state
const initialState: MenuState = {
  menuFile: {
    type: null,
    url: null,
    name: null,
    uploadedAt: null,
  },
  isLoading: false,
  error: null,
};

// Menu Slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    clearMenuError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Menu File
    builder.addCase(getMenuFile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getMenuFile.fulfilled, (state, action) => {
      state.isLoading = false;
      const menuData = action.payload.data;
      state.menuFile = {
        type: menuData.type,
        url: menuData.url,
        name: menuData.name,
        uploadedAt: menuData.uploadedAt,
      };
      state.error = null;
    });
    builder.addCase(getMenuFile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Upload Menu File
    builder.addCase(uploadMenuFile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(uploadMenuFile.fulfilled, (state, action) => {
      state.isLoading = false;
      const menuData = action.payload.data;
      state.menuFile = {
        type: menuData.type,
        url: menuData.url,
        name: menuData.name,
        uploadedAt: menuData.uploadedAt,
      };
      state.error = null;
    });
    builder.addCase(uploadMenuFile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Delete Menu File
    builder.addCase(deleteMenuFile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteMenuFile.fulfilled, (state) => {
      state.isLoading = false;
      state.menuFile = {
        type: null,
        url: null,
        name: null,
        uploadedAt: null,
      };
      state.error = null;
    });
    builder.addCase(deleteMenuFile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearMenuError } = menuSlice.actions;
export default menuSlice.reducer;
