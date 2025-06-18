"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

export interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  description: string
  available: boolean
  createdAt: string
}

export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  totalOrders: number
  totalSpent: number
  joinedDate: string
  lastOrderDate: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image: string
  }>
  subtotal: number
  tax: number
  deliveryFee: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  orderType: "delivery" | "pickup"
  deliveryAddress?: string
  pickupTime?: string
  createdAt: string
  updatedAt: string
}

interface RestaurantState {
  products: Product[]
  orders: Order[]
  customers: Customer[]
  menuFile: {
    type: "pdf" | "image" | null
    url: string | null
    name: string | null
    uploadedAt: string | null
  }
}

type RestaurantAction =
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER_STATUS"; payload: { id: string; status: Order["status"] } }
  | { type: "ADD_CUSTOMER"; payload: Customer }
  | { type: "UPDATE_CUSTOMER"; payload: Customer }
  | { type: "UPLOAD_MENU"; payload: { type: "pdf" | "image"; url: string; name: string } }
  | { type: "REMOVE_MENU" }

const RestaurantContext = createContext<{
  state: RestaurantState
  dispatch: React.Dispatch<RestaurantAction>
} | null>(null)

// Initial sample data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    category: "Pizza",
    price: 18,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Fresh mozzarella, San Marzano tomatoes, basil, and extra virgin olive oil on our signature wood-fired crust",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Pasta Carbonara",
    category: "Pasta",
    price: 22,
    image: "/placeholder.svg?height=200&width=300",
    description: "Homemade fettuccine with pancetta, eggs, Pecorino Romano, and black pepper - a Roman classic",
    available: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Tiramisu",
    category: "Dessert",
    price: 12,
    image: "/placeholder.svg?height=200&width=300",
    description: "Classic Italian dessert with ladyfingers, espresso, mascarpone, and cocoa powder",
    available: true,
    createdAt: new Date().toISOString(),
  },
]

const initialOrders: Order[] = [
  {
    id: "ORD-001",
    customerId: "CUST-001",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    customerPhone: "(555) 123-4567",
    items: [
      { id: "1", name: "Margherita Pizza", price: 18, quantity: 2, image: "/placeholder.svg?height=200&width=300" },
      { id: "3", name: "Tiramisu", price: 12, quantity: 1, image: "/placeholder.svg?height=200&width=300" },
    ],
    subtotal: 48,
    tax: 4.26,
    deliveryFee: 3.99,
    total: 56.25,
    status: "preparing",
    orderType: "delivery",
    deliveryAddress: "123 Main St, New York, NY 10001",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ORD-002",
    customerId: "CUST-002",
    customerName: "Jane Smith",
    customerEmail: "jane@example.com",
    customerPhone: "(555) 987-6543",
    items: [
      { id: "2", name: "Pasta Carbonara", price: 22, quantity: 1, image: "/placeholder.svg?height=200&width=300" },
    ],
    subtotal: 22,
    tax: 1.95,
    deliveryFee: 0,
    total: 23.95,
    status: "ready",
    orderType: "pickup",
    pickupTime: "6:30 PM",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
]

const initialCustomers: Customer[] = [
  {
    id: "CUST-001",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    totalOrders: 5,
    totalSpent: 245.75,
    joinedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastOrderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CUST-002",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com",
    phone: "(555) 987-6543",
    totalOrders: 3,
    totalSpent: 156.4,
    joinedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastOrderDate: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
]

function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      }

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) => (product.id === action.payload.id ? action.payload : product)),
      }

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
      }

    case "ADD_ORDER":
      return {
        ...state,
        orders: [action.payload, ...state.orders],
      }

    case "UPDATE_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.payload.id
            ? { ...order, status: action.payload.status, updatedAt: new Date().toISOString() }
            : order,
        ),
      }

    case "ADD_CUSTOMER":
      return {
        ...state,
        customers: [...state.customers, action.payload],
      }

    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((customer) => (customer.id === action.payload.id ? action.payload : customer)),
      }

    case "UPLOAD_MENU":
      return {
        ...state,
        menuFile: {
          type: action.payload.type,
          url: action.payload.url,
          name: action.payload.name,
          uploadedAt: new Date().toISOString(),
        },
      }

    case "REMOVE_MENU":
      return {
        ...state,
        menuFile: {
          type: null,
          url: null,
          name: null,
          uploadedAt: null,
        },
      }

    default:
      return state
  }
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(restaurantReducer, {
    products: initialProducts,
    orders: initialOrders,
    customers: initialCustomers,
    menuFile: {
      type: null,
      url: null,
      name: null,
      uploadedAt: null,
    },
  })

  return <RestaurantContext.Provider value={{ state, dispatch }}>{children}</RestaurantContext.Provider>
}

export function useRestaurant() {
  const context = useContext(RestaurantContext)
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider")
  }
  return context
}
