import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { RootState } from '../store';

// Types
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  description?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

// Get cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Error parsing cart from localStorage', e);
      }
    }
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(items));
  }
};

// Helper function to calculate cart totals
const calculateCartTotals = (items: CartItem[]) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { total, itemCount };
};

// API Endpoints
const API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/orders`;

// Define the checkout thunk with proper typing
export const checkout = createAsyncThunk<any, any, { state: RootState }>(
  'cart/checkout',
  async (shippingInfo, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const { isAuthenticated } = state.auth;
      const { items, total } = state.cart;
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        return rejectWithValue('You must be logged in to checkout');
      }
      
      const orderData = {
        items,
        totalAmount: total,
        shippingInfo,
        status: 'pending'
      };
      
      const response = await api.post(`${API_URL}`, orderData);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Checkout failed');
    }
  }
);

// Initial state with localStorage data
const initialItems = loadCartFromStorage();
const { total, itemCount } = calculateCartTotals(initialItems);

const initialState: CartState = {
  items: initialItems,
  total,
  itemCount,
  isLoading: false,
  error: null,
};

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex !== -1) {
        // Increment quantity for existing item
        state.items[existingItemIndex].quantity += 1;
      } else {
        // Add new item with quantity 1
        state.items.push({ ...action.payload, quantity: 1 });
      }
      
      // Update totals
      const { total, itemCount } = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      // Update totals
      const { total, itemCount } = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        state.items = state.items.filter(item => item.id !== id);
      } else {
        // Update quantity
        const itemIndex = state.items.findIndex(item => item.id === id);
        if (itemIndex !== -1) {
          state.items[itemIndex].quantity = quantity;
        }
      }
      
      // Update totals
      const { total, itemCount } = calculateCartTotals(state.items);
      state.total = total;
      state.itemCount = itemCount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
      state.itemCount = 0;
      
      // Clear localStorage
      localStorage.removeItem('cart');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.isLoading = false;
        // Clear cart after successful checkout
        state.items = [];
        state.total = 0;
        state.itemCount = 0;
        localStorage.removeItem('cart');
      })
      .addCase(checkout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
