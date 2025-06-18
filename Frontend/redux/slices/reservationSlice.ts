import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = '/reservations';

// Define error type
interface ApiError {
  response?: {
    data: any;
  };
  message?: string;
}

// Create a reservation
export const createReservation = createAsyncThunk(
  'reservations/create',
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URL, reservationData);
      return response.data;
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data || 'Failed to create reservation');
    }
  }
);

// Get all reservations (admin only)
export const getReservations = createAsyncThunk(
  'reservations/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URL);
      return response.data;
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data || 'Failed to fetch reservations');
    }
  }
);

// Update reservation status (admin only)
export const updateReservationStatus = createAsyncThunk(
  'reservations/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await api.put(`${API_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data || 'Failed to update reservation status');
    }
  }
);

// Delete a reservation (admin only)
export const deleteReservation = createAsyncThunk(
  'reservations/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      const err = error as ApiError;
      return rejectWithValue(err.response?.data || 'Failed to delete reservation');
    }
  }
);

interface Reservation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

interface ReservationState {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ReservationState = {
  reservations: [],
  isLoading: false,
  error: null,
};

const reservationsSlice = createSlice({
  name: 'reservations',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations.push(action.payload.data);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get all reservations
      .addCase(getReservations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReservations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = action.payload.data;
      })
      .addCase(getReservations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update reservation status
      .addCase(updateReservationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedReservation = action.payload.data;
        const index = state.reservations.findIndex(r => r._id === updatedReservation._id);
        if (index !== -1) {
          state.reservations[index] = updatedReservation;
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete reservation
      .addCase(deleteReservation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reservations = state.reservations.filter(r => r._id !== action.payload);
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearErrors } = reservationsSlice.actions;
export default reservationsSlice.reducer;
