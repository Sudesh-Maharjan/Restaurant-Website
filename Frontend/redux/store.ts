import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import productReducer from './slices/productSlice'
import productsReducer from './slices/productsSlice'
import customerReducer from './slices/customerSlice'
import orderReducer from './slices/orderSlice'
import cartReducer from './slices/cartSlice'
import menuReducer from './slices/menuSlice'
import settingsReducer from './slices/settingsSlice'
import reservationReducer from './slices/reservationSlice'
import notificationReducer from './slices/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    products: productsReducer,
    customers: customerReducer,
    orders: orderReducer,
    cart: cartReducer,
    menu: menuReducer,
    settings: settingsReducer,
    reservations: reservationReducer,
    notifications: notificationReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
