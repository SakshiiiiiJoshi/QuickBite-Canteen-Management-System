# 🍽️ QuickBite — Canteen Management System

A full-stack **Canteen Management System** built with the **MERN Stack** (MongoDB, Express, React, Node.js).  
Customers scan a QR code to browse the menu, add items to cart, place orders, pay via UPI QR, and track their order in real-time. Admins manage food items and update order statuses from a dedicated dashboard.

---

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Customer — Menu Page
![Menu](https://via.placeholder.com/800x400?text=Menu+Page)

### Customer — Cart & Payment
![Cart](https://via.placeholder.com/800x400?text=Cart+%26+Payment)

### Admin — Dashboard
![Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

</details>

---

## 🏗️ Project Structure

```
QuickBite/
├── server/                          # Backend (Node.js + Express)
│   ├── config/db.js                 # MongoDB connection
│   ├── middleware/authMiddleware.js  # JWT authentication
│   ├── models/
│   │   ├── Admin.js                 # Admin model (bcrypt hashed)
│   │   ├── Food.js                  # Food item model
│   │   └── Order.js                 # Order model with status tracking
│   ├── routes/
│   │   ├── authRoutes.js            # POST /login, /seed
│   │   ├── foodRoutes.js            # CRUD operations for food
│   │   └── orderRoutes.js           # Place, track, manage orders
│   ├── server.js                    # Express entry point
│   ├── seed.js                      # Database seeder (14 sample items)
│   ├── .env                         # Environment variables
│   └── package.json
│
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CartContext.jsx       # Global cart state (Context API)
│   │   │   ├── FoodCard.jsx          # Food item card
│   │   │   ├── Navbar.jsx            # Sticky navbar with cart badge
│   │   │   └── QRCodeDisplay.jsx     # QR code renderer
│   │   ├── pages/
│   │   │   ├── Menu.jsx              # Browse food + search + filter
│   │   │   ├── Cart.jsx              # Review cart + place order
│   │   │   ├── Payment.jsx           # UPI Payment QR + confirmation
│   │   │   ├── OrderStatus.jsx       # Real-time order tracking
│   │   │   └── admin/
│   │   │       ├── Login.jsx          # Admin login
│   │   │       ├── Dashboard.jsx      # Stats overview + menu QR
│   │   │       ├── ManageFood.jsx     # Add/Edit/Delete food
│   │   │       └── ManageOrders.jsx   # Update order statuses
│   │   ├── App.jsx                   # Routes
│   │   ├── main.jsx                  # React entry
│   │   └── index.css                 # Full design system (dark theme)
│   ├── index.html
│   └── package.json
│
└── README.md                        # ← You are here
```

---

## ⚙️ Prerequisites

Make sure you have these installed on your system before starting:

| Tool       | Version  | Download Link                          |
|------------|----------|----------------------------------------|
| **Node.js** | v18+    | https://nodejs.org/                    |
| **MongoDB** | v6+     | https://www.mongodb.com/try/download   |
| **Git**     | Any     | https://git-scm.com/                   |

> **Note:** MongoDB must be running locally on port `27017`. Alternatively, you can use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) — just update the `MONGO_URI` in `server/.env`.

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd QuickBite
```

### 2. Setup & Start the Backend

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Seed the database with sample food items + default admin
npm run seed

# Start the backend server (with auto-reload)
npm run dev
```

✅ Backend will start at: **http://localhost:5000**

### 3. Setup & Start the Frontend

Open a **new terminal** and run:

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

✅ Frontend will start at: **http://localhost:5173**

### 4. Open in Browser

| Page              | URL                              |
|-------------------|----------------------------------|
| 🍽️ Customer Menu  | http://localhost:5173/menu        |
| 🛒 Cart           | http://localhost:5173/cart        |
| 🔐 Admin Login    | http://localhost:5173/admin       |
| 📊 Admin Dashboard| http://localhost:5173/admin/dashboard |

---

## 🔑 Default Admin Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> The default admin is auto-created when you run `npm run seed` or when the server starts for the first time.

---

## 📋 Available Commands

### Server Commands (`cd server`)

| Command          | Description                                      |
|------------------|--------------------------------------------------|
| `npm install`    | Install all backend dependencies                 |
| `npm run dev`    | Start server with auto-reload (nodemon)          |
| `npm start`      | Start server without auto-reload (production)    |
| `npm run seed`   | Seed database with 14 food items + admin account |

### Client Commands (`cd client`)

| Command          | Description                                |
|------------------|--------------------------------------------|
| `npm install`    | Install all frontend dependencies          |
| `npm run dev`    | Start Vite dev server with hot-reload      |
| `npm run build`  | Build production bundle into `dist/`       |
| `npm run preview`| Preview the production build locally       |

---

## 🌐 API Endpoints

### Authentication

| Method | Endpoint            | Auth  | Description           |
|--------|---------------------|-------|-----------------------|
| POST   | `/api/auth/login`   | No    | Admin login (returns JWT) |
| POST   | `/api/auth/seed`    | No    | Seed default admin    |

### Food Items

| Method | Endpoint            | Auth  | Description           |
|--------|---------------------|-------|-----------------------|
| GET    | `/api/foods`        | No    | Get all food items    |
| GET    | `/api/foods/:id`    | No    | Get single food item  |
| POST   | `/api/foods`        | Admin | Add new food item     |
| PUT    | `/api/foods/:id`    | Admin | Update food item      |
| DELETE | `/api/foods/:id`    | Admin | Delete food item      |

### Orders

| Method | Endpoint                  | Auth  | Description             |
|--------|---------------------------|-------|-------------------------|
| POST   | `/api/orders`             | No    | Place a new order       |
| GET    | `/api/orders`             | Admin | List all orders         |
| GET    | `/api/orders/:id`         | No    | Get order status        |
| PUT    | `/api/orders/:id/status`  | Admin | Update order status     |
| PUT    | `/api/orders/:id/pay`     | No    | Mark order as paid      |

---

## 📱 QR Code System

| QR Type          | Purpose                                  | Location           |
|------------------|------------------------------------------|--------------------|
| **Menu QR**      | Scan → Opens the customer menu page      | Admin Dashboard    |
| **Payment QR**   | Scan → UPI payment with pre-filled amount| Payment Page       |
| **Order QR**     | Scan → Track order status in real-time   | Order Confirmation & Status Page |

---

## 🔄 Customer Flow

```
  📱 Scan MENU QR
        ↓
  🍽️ Browse Menu (search + filter by category)
        ↓
  🛒 Add Items to Cart
        ↓
  📝 Enter Name & Table Number
        ↓
  ✅ Place Order
        ↓
  💰 Total: ₹XXX
        ↓
  📱 Scan PAYMENT QR (UPI)
        ↓
  💳 Pay & Confirm
        ↓
  📱 Get ORDER QR (save/share)
        ↓
  📦 Track: Placed → Preparing → Ready → Delivered
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                           |
|------------|------------------------------------------------------|
| Frontend   | React 18, Vite, React Router, Axios, qrcode.react   |
| Backend    | Node.js, Express.js, Mongoose, JWT, bcryptjs         |
| Database   | MongoDB                                              |
| Styling    | Vanilla CSS (dark theme, glassmorphism, animations)  |
| Icons      | react-icons (Ionicons)                               |

---

## 🔧 Environment Variables

The backend uses a `.env` file in `server/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/canteen
JWT_SECRET=canteen_super_secret_key_2024
```

> ⚠️ **For production:** Change `JWT_SECRET` to a strong random string and use MongoDB Atlas for the database.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `MongoDB connection error` | Make sure MongoDB is running: `mongod` or check MongoDB service |
| `EADDRINUSE: port 5000` | Another process is using port 5000. Kill it or change `PORT` in `.env` |
| `Cannot find module` | Run `npm install` in both `server/` and `client/` |
| `CORS errors in browser` | Make sure the backend server is running on port 5000 |
| `Admin login fails` | Run `npm run seed` in the server folder to create the default admin |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using the MERN Stack
</p>
