# Luga - Premium Nepalese Fashion Marketplace

A modern, full-stack e-commerce platform for authentic Nepalese fashion items built with Next.js 16, TypeScript, PostgreSQL, and Drizzle ORM. This is Phase 1 (Core MVP) featuring user authentication, product catalog, shopping cart, and checkout functionality.

## 🚀 Features

### Phase 1 (Core MVP) ✅
- **User Authentication & Authorization**
  - User registration with email validation
  - Secure login/logout with JWT
  - Password hashing with bcrypt (12 salt rounds)
  - Protected routes (client & server-side)
  - Session management with HTTP-only cookies

- **Product Catalog**
  - Responsive product grid
  - Product categories (Saree, Jewelry, Clothing, Accessories)
  - Search functionality
  - Advanced filtering (category, price range, availability)
  - Sorting (price, newest first)
  - Product detail pages with related products

- **Shopping Cart**
  - Add/remove/update items
  - Real-time price calculation
  - Database persistence
  - Cart badge showing item count
  - Detailed cart summary

- **Checkout & Orders**
  - Review order page
  - Shipping information form
  - Order creation and confirmation
  - Order history
  - Order detail pages

## 🛠️ Tech Stack

- **Framework:** Next.js 16.0.3 (App Router, Turbopack)
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL (Neon.tech cloud hosting)
- **ORM:** Drizzle ORM 0.44.7 with drizzle-kit 0.31.7
- **Database Client:** postgres.js 3.4.7
- **Styling:** Tailwind CSS 4.x
- **Authentication:** jose (JWT), bcrypt (12 rounds)
- **Validation:** Zod 4.x
- **Icons:** Lucide React 0.553.0

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marketplace-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database (Neon.tech or your PostgreSQL instance)
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   
   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Generate database migrations**
   ```bash
   npm run db:generate
   ```

5. **Run migrations**
   ```bash
   npm run db:migrate
   ```

6. **Seed the database** (optional - adds 12 sample products)
   ```bash
   npm run db:seed
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

8. **Open [http://localhost:3000](http://localhost:3000)**

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - Get products (with filters)
- `GET /api/products/:id` - Get product details

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update item quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get order details

## 📱 Pages

- `/` - Homepage
- `/products` - Product listing
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/orders` - Order history
- `/orders/:id` - Order confirmation
- `/login` - Login
- `/register` - Registration

## 📝 Scripts

```bash
npm run dev           # Development server with Turbopack
npm run build         # Build for production
npm run start         # Start production server
npm run db:generate   # Generate migrations from schema
npm run db:migrate    # Run migrations
npm run db:push       # Push schema directly to database
npm run db:seed       # Seed sample data (12 products)
npm run db:studio     # Open Drizzle Studio (database GUI)
```

## 🗄️ Database Schema

### Users
- id (UUID), email, password (hashed), name, createdAt, updatedAt

### Products
- id (UUID), name, description, price, category, stockQuantity, imageUrl, isActive, createdAt, updatedAt

### Carts
- id (UUID), userId, createdAt, updatedAt

### CartItems
- id (UUID), cartId, productId, quantity, addedAt

### Orders
- id (UUID), userId, totalAmount, status, shippingAddress, createdAt, updatedAt

### OrderItems
- id (UUID), orderId, productId, quantity, priceAtPurchase

## 🎨 Sample Data

Includes 12 sample Nepalese fashion products:
- 3 Traditional Sarees
- 3 Authentic Jewelry pieces
- 4 Clothing items (Kurta, Dhaka Topi, Gunyu Cholo, Bhoto)
- 2 Accessories (Khukuri, Prayer Beads)

## 🌐 Database Setup (Neon.tech)

1. Create account at [Neon.tech](https://neon.tech)
2. Create new project (select region closest to you)
3. Copy the **pooler** connection string for better performance
4. Add to `.env.local` as `DATABASE_URL`
5. Run migrations: `npm run db:migrate`
6. Seed database: `npm run db:seed`

**Note:** The pooler connection provides connection pooling for serverless environments.

## 🔐 Security

- Bcrypt password hashing (12 rounds)
- JWT authentication with HTTP-only cookies
- Server-side route protection
- Input validation with Zod schemas
- SQL injection prevention (Drizzle ORM parameterized queries)
- Secure session management

## 🚧 Coming Soon (Phase 2)

- Payment integration
- Admin dashboard
- Product management
- Email notifications
- Reviews and ratings
- Wishlist

## 📄 License

MIT License
