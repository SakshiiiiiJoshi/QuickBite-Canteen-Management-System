# QuickBite — Canteen Management System

A full-stack **Canteen Management System** built with **Python (Flask) + Vanilla HTML/JS/CSS + MySQL**.  
Customers scan a QR code to browse the menu, add items to cart, place orders, pay via UPI QR, and track their order in real-time. Admins manage food items and update order statuses from a dedicated dashboard.

---

## Project Structure

```
QuickBite/
├── backend/                          # Backend (Python + Flask)
│   ├── app.py                        # Flask entry point & static file server
│   ├── config.py                     # App configuration (DB, JWT, Port)
│   ├── models.py                     # SQLAlchemy models (Admin, Food, Order)
│   ├── middleware.py                  # JWT auth decorator
│   ├── seed.py                       # Database seeder (19 food items + admin)
│   ├── .env                          # Environment variables
│   ├── requirements.txt              # Python dependencies
│   └── routes/
│       ├── auth.py                   # POST /api/auth/login, /seed
│       ├── food.py                   # CRUD /api/foods
│       └── orders.py                 # Place, track, manage /api/orders
│
├── frontend/                         # Frontend (Vanilla HTML + JS + CSS)
│   ├── css/
│   │   └── style.css                 # Full design system (dark theme, glassmorphism)
│   ├── js/
│   │   ├── app.js                    # Shared: Cart, Auth, API helpers, Navbar
│   │   ├── menu.js                   # Menu page logic
│   │   ├── cart.js                   # Cart page logic
│   │   ├── payment.js                # Payment & UPI QR logic
│   │   ├── order.js                  # Order status & polling logic
│   │   └── admin.js                  # Admin dashboard logic
│   ├── images/                       # Local food images
│   ├── index.html                    # Redirects to menu
│   ├── menu.html                     # Customer menu page
│   ├── cart.html                     # Cart & checkout page
│   ├── payment.html                  # UPI payment page
│   ├── order.html                    # Real-time order tracking
│   └── admin/
│       ├── login.html                # Admin login
│       └── dashboard.html            # Admin dashboard (food, orders, QR)
│
└── README.md                         # ← You are here
```

---

## Prerequisites

| Tool        | Version | Download Link                                     |
|-------------|---------|---------------------------------------------------|
| **Python**  | 3.10+   | https://www.python.org/downloads/                 |
| **MySQL**   | 8.0+    | https://dev.mysql.com/downloads/mysql/            |
| **Git**     | Any     | https://git-scm.com/                              |

> **Note:** MySQL must be running locally. Create a database named `canteen` before starting.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd QuickBite
```

### 2. Create MySQL Database

Open MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS canteen;
```

### 3. Configure Environment Variables

Edit `backend/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=canteen
JWT_SECRET=canteen_super_secret_key_2024
```

### 4. Setup Python Virtual Environment & Install Dependencies

```bash
cd backend
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Seed the Database

```bash
python seed.py
```

This creates all MySQL tables and populates them with 19 food items + a default admin account.

### 6. Start the Server

```bash
python app.py
```

✅ The app will start at: **http://localhost:5000**  
Flask serves **both the API and the frontend** from a single server.

---

## Pages

| Page               | URL                                          | Notes                                                  |
|--------------------|----------------------------------------------|--------------------------------------------------------|
| Customer Menu      | http://localhost:5000/menu.html              | Includes a scan-to-order QR banner at the top          |
| Cart               | http://localhost:5000/cart.html              |                                                        |
| Payment            | http://localhost:5000/payment.html           | UPI QR generated per-order                             |
| Order Status       | http://localhost:5000/order.html             | Polls every 10 s; reached via payment confirmation     |
| Track Order        | http://localhost:5000/track.html             | Manual order lookup by ID; shows latest order shortcut |
| Admin Login        | http://localhost:5000/admin/login.html       |                                                        |
| Admin Dashboard    | http://localhost:5000/admin/dashboard.html   | Menu QR + Payment QR modals                            |

### My Order — Navbar Link

The customer navbar always shows a **My Order** link:
- If the customer has placed an order in the current browser session, it links directly to their live order status page.
- If they have no recent order (or opened a fresh browser), it links to the **Track Order** page where they can enter an Order ID manually.
- The orange dot indicator lights up when a recent order is stored locally.

---

## Default Admin Credentials

| Field    | Value      |
|----------|------------|
| Username | `admin`    |
| Password | `admin123` |

> The default admin and all food items are auto-created when you run `python seed.py`.

---

## API Endpoints

### Authentication

| Method | Endpoint           | Auth  | Description                |
|--------|--------------------|-------|----------------------------|
| POST   | `/api/auth/login`  | No    | Admin login → returns JWT  |
| POST   | `/api/auth/seed`   | No    | Seed default admin         |

### Food Items

| Method | Endpoint          | Auth  | Description           |
|--------|-------------------|-------|-----------------------|
| GET    | `/api/foods`      | No    | Get all food items    |
| GET    | `/api/foods/<id>` | No    | Get single food item  |
| POST   | `/api/foods`      | Admin | Add new food item     |
| PUT    | `/api/foods/<id>` | Admin | Update food item      |
| DELETE | `/api/foods/<id>` | Admin | Delete food item      |

### Orders

| Method | Endpoint                    | Auth  | Description             |
|--------|-----------------------------|-------|-------------------------|
| POST   | `/api/orders`               | No    | Place a new order       |
| GET    | `/api/orders`               | Admin | List all orders         |
| GET    | `/api/orders/<id>`          | No    | Get order status        |
| PUT    | `/api/orders/<id>/status`   | Admin | Update order status     |
| PUT    | `/api/orders/<id>/pay`      | No    | Mark order as paid      |

---

## Menu — Food Items

| Category      | Items                                                                        |
|---------------|------------------------------------------------------------------------------|
| **Snacks**    | Samosa, Idli, Frankie, Dosa, Vada Pav, French Fries                         |
| **Beverages** | Mango Lassi, Masala Chai, Cold Coffee, Lemonade, Iced Tea, Buttermilk (Chaas)|
| **Starters**  | Paneer Tikka, Veg Spring Rolls                                               |
| **Main Course** | Chicken Biryani, Dal Makhani, Butter Naan                                  |
| **Desserts**  | Gulab Jamun, Chocolate Brownie                                               |

---

## QR Code System

The app has three QR codes, each serving a distinct purpose:

| QR Type         | Where it appears                          | What it does                                    |
|-----------------|-------------------------------------------|-------------------------------------------------|
| **Menu QR**     | Top of the customer menu page (always visible) | Customer scans to share the menu URL — useful for printing/sharing table cards |
| **Menu QR**     | Admin sidebar > "Menu QR Code"             | Admin generates and prints for table placement  |
| **Payment QR**  | Admin sidebar > "Payment QR Code"          | Admin configures UPI ID/payee name, generates UPI deep-link QR to print at counter |
| **Order QR**    | Payment confirmation + Order status page  | Customer saves/shares to track their order status |

---

## Customer Flow

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

## Tech Stack

| Layer      | Technology                                              |
|------------|---------------------------------------------------------|
| Frontend   | Vanilla HTML5, CSS3, JavaScript (ES6+), QRCode.js (CDN) |
| Backend    | Python 3, Flask, Flask-SQLAlchemy, Flask-CORS, PyJWT   |
| Database   | MySQL 8.0 (via PyMySQL)                                 |
| Auth       | JWT (JSON Web Tokens) + bcrypt password hashing         |
| Styling    | Vanilla CSS (dark theme, glassmorphism, animations)     |

---

## Environment Variables (`backend/.env`)

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=canteen
JWT_SECRET=canteen_super_secret_key_2024
```

> ⚠️ **For production:** Change `JWT_SECRET` to a strong random string.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Access denied for user 'root'` | Check your MySQL password in `backend/.env` |
| `Can't connect to MySQL server` | Make sure MySQL service is running |
| `ModuleNotFoundError` | Activate venv and run `pip install -r requirements.txt` |
| `EADDRINUSE: port 5000` | Another process is using port 5000. Change `PORT` in `.env` |
| `Admin login fails` | Run `python seed.py` in the `backend/` folder |
| Food images not loading | Check that images exist in `frontend/images/` |

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with the MERN-to-Python stack
</p>
