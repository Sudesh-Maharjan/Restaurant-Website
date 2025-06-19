import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  available: boolean;
  createdAt: string;
}

interface ProductsState {
  products: Product[];
  featured: Product[];
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/products`;

// Async Actions
export const getProducts = createAsyncThunk(
  'products/getProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      // Ensure we have a valid response with data
      if (!response.data || !response.data.data) {
        return { data: [] };
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Initial state
const initialState: ProductsState = {
  products: [],
  featured: [],
  isLoading: false,
  error: null,
};

// Products Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get Products
    builder.addCase(getProducts.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });    builder.addCase(getProducts.fulfilled, (state, action) => {
      state.isLoading = false;
      state.products = action.payload?.data || [];
      // Get only available products for featured (max 6)
      state.featured = Array.isArray(action.payload?.data) 
        ? action.payload.data
            .filter((product: Product) => product && product.available)
            .slice(0, 6)
        : [];
      state.error = null;
    });
    builder.addCase(getProducts.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearProductsError } = productsSlice.actions;
export default productsSlice.reducer;
