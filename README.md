# Restaurant Website

A full-stack restaurant website with customer-facing pages and an admin panel.

## Project Structure

The project is divided into two main directories:

- `Frontend`: Next.js application with React and Shadcn UI components
- `Backend`: Express.js API server

## Technologies Used

### Frontend
- Next.js
- React
- Redux Toolkit
- Shadcn UI (based on Tailwind CSS)
- Axios for API requests

### Backend
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens for authentication
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup Backend

1. Navigate to the backend directory
```bash
cd "Backend"
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/restaurant-db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

4. Start the server
```bash
npm run dev
```

### Setup Frontend

1. Navigate to the frontend directory
```bash
cd "Frontend"
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server
```bash
npm run dev
```

## Features

### Customer Features
- Browse restaurant menu
- Add items to cart
- Checkout process
- Contact form

### Admin Features
- Dashboard with key metrics
- Product management (CRUD)
- Order management
- Customer management
- Settings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/customer/:customerId` - Get customer orders

### Customers
- `GET /api/customers` - Get all customers (Admin)
- `GET /api/customers/:id` - Get single customer (Admin)
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer (Admin)
- `DELETE /api/customers/:id` - Delete customer (Admin)

### Menu
- `GET /api/menu` - Get current menu file
- `POST /api/menu/upload` - Upload menu file (Admin)
- `DELETE /api/menu` - Delete menu file (Admin)
