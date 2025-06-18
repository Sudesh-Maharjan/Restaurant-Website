import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'

// Custom hooks with proper type safety
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// Add type assertion helpers to avoid TypeScript errors
export const selectAuth = (state: RootState) => state.auth
export const selectCart = (state: RootState) => state.cart
export const selectProducts = (state: RootState) => state.products
export const selectOrders = (state: RootState) => state.orders
export const selectCustomers = (state: RootState) => state.customers
export const selectMenu = (state: RootState) => state.menu
