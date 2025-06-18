import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// Types
export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  paid: boolean;
  paymentMethod: 'cash' | 'card' | 'paypal' | '';
  address?: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  order: Order | null;
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_URL = 'http://localhost:5000/api/orders';

// Async Actions
export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, orderData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/${id}/status`, { status });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const updateOrderPayment = createAsyncThunk(
  'orders/updateOrderPayment',
  async ({ id, paid, paymentMethod }: { id: string; paid: boolean; paymentMethod?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/${id}/payment`, { paid, paymentMethod });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment status');
    }
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete order');
    }
  }
);

export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/my-orders`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch your orders');
    }
  }
);

// Initial state
const initialState: OrdersState = {
  orders: [],
  order: null,
  isLoading: false,
  error: null,
};

// Orders Slice
const orderSlice = createSlice({
  name: 'orders',
  initialState,  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    clearSelectedOrder: (state) => {
      state.order = null;
    },
    updateOrderViaWebSocket: (state, action: PayloadAction<Order>) => {
      const updatedOrder = action.payload;
      // Update in orders array
      state.orders = state.orders.map((order) => 
        order._id === updatedOrder._id ? updatedOrder : order
      );
      
      // Update selected order if it's the same one
      if (state.order && state.order._id === updatedOrder._id) {
        state.order = updatedOrder;
      }
    },
    addOrderViaWebSocket: (state, action: PayloadAction<Order>) => {
      // Add to orders array if not already present
      if (!state.orders.some(order => order._id === action.payload._id)) {
        state.orders = [action.payload, ...state.orders];
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get single order
      .addCase(getOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.push(action.payload);
      })      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        state.order = updatedOrder;
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update order payment
      .addCase(updateOrderPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrderPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedOrder = action.payload;
        state.orders = state.orders.map((order) => 
          order._id === updatedOrder._id ? updatedOrder : order
        );
        state.order = updatedOrder;
      })
      .addCase(updateOrderPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = state.orders.filter(
          (order) => order._id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get my orders
      .addCase(getMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearOrderError, 
  clearSelectedOrder,
  updateOrderViaWebSocket,
  addOrderViaWebSocket
} = orderSlice.actions;
export default orderSlice.reducer;
