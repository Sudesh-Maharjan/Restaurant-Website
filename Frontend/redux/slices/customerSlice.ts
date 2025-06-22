import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// Types
export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastOrderDate: string | null;
}

interface CustomersState {
  customers: Customer[];
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_URL = '/customers';

// Async Actions
export const getCustomers = createAsyncThunk(
  'customers/getCustomers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Making API call to fetch customers...');
      const response = await api.get(API_URL);
      console.log('API response:', response);
      
      if (!response.data || !response.data.data) {
        console.error('Invalid API response format:', response.data);
        return rejectWithValue('Invalid API response format');
      }
      
      console.log('Customers data:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('API error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const getCustomer = createAsyncThunk(
  'customers/getCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: Omit<Customer, '_id' | 'totalOrders' | 'totalSpent' | 'joinedDate' | 'lastOrderDate'>, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, customerData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create customer');
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }: { id: string; customerData: Partial<Customer> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/${id}`, customerData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer');
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete customer');
    }
  }
);

// Initial state
const initialState: CustomersState = {
  customers: [],
  customer: null,
  isLoading: false,
  error: null,
};

// Customers Slice
const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.customer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all customers
      .addCase(getCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(getCustomers.fulfilled, (state, action) => {
        console.log('getCustomers.fulfilled with payload:', action.payload);
        state.isLoading = false;
        state.customers = action.payload || [];
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get single customer
      .addCase(getCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customer = action.payload;
      })
      .addCase(getCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create customer
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update customer
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedCustomer = action.payload;
        state.customers = state.customers.map((customer) => 
          customer._id === updatedCustomer._id ? updatedCustomer : customer
        );
        state.customer = updatedCustomer;
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete customer
      .addCase(deleteCustomer.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = state.customers.filter(
          (customer) => customer._id !== action.payload
        );
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomerError, clearSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
