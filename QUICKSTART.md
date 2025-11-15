# Quick Start Guide

## Getting Your Database Ready

### 1. Install PostgreSQL (if you haven't already)

**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- Or use [Railway](https://railway.app/) or [Supabase](https://supabase.com/) for a cloud database

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

### 2. Create a Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE marketplace_db;

# Exit
\q
```

**Or use Railway/Supabase:**
- Create a new project
- Copy the PostgreSQL connection string
- It will look like: `postgresql://user:password@host:port/database`

### 3. Update .env.local

Replace the DATABASE_URL in your `.env.local` file with your connection string:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/marketplace_db
```

### 4. Push Schema to Database

```bash
npm run db:push
```

This creates all the tables (users, products, carts, cart_items, orders, order_items).

### 5. Seed Sample Data

```bash
npm run db:seed
```

This adds 12 sample products to your database.

### 6. Start the Application

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the Application

### 1. Create an Account
- Go to `/register`
- Enter:
  - Full Name: `John Doe`
  - Email: `john@example.com`
  - Password: `password123` (at least 8 characters)
- Click "Create account"
- You'll be automatically logged in

### 2. Browse Products
- Visit homepage or `/products`
- Try searching for "saree" or "jewelry"
- Use filters:
  - Category: Select "Saree"
  - Sort by: Price (Low to High)
  - Price range: Min 1000, Max 10000

### 3. Add to Cart
- Click on any product
- Select quantity
- Click "Add to Cart"
- Notice the cart badge in the navbar

### 4. Checkout
- Click the cart icon in navbar
- Review your items
- Click "Proceed to Checkout"
- Enter shipping address:
  ```
  123 Main Street
  Apartment 4B
  Mumbai, Maharashtra
  PIN: 400001
  ```
- Click "Place Order"

### 5. View Orders
- You'll be redirected to order confirmation
- Click "View All Orders" to see order history
- Click on any order to see details

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Make sure `.env.local` file exists
- Check that DATABASE_URL is properly set
- Restart the dev server

### Error: "Failed to connect to database"
- Verify PostgreSQL is running
- Check connection string is correct
- Test connection with: `psql "your-connection-string"`

### Error: "relation 'products' does not exist"
- Run `npm run db:push` to create tables
- If that fails, check database permissions

### Cart not persisting
- Make sure you're logged in
- Check browser console for errors
- Verify cart table exists in database

### Products not showing
- Run `npm run db:seed` to add sample data
- Check if products exist: `psql` → `SELECT * FROM products;`

## Database Inspection

### Using psql:
```bash
psql -U postgres -d marketplace_db

# List tables
\dt

# View products
SELECT * FROM products;

# View users
SELECT id, email, full_name FROM users;

# View cart items with product names
SELECT ci.*, p.name 
FROM cart_items ci 
JOIN products p ON ci.product_id = p.id;

# Exit
\q
```

### Using GUI Tools:
- [pgAdmin](https://www.pgadmin.org/) - Free, full-featured
- [TablePlus](https://tableplus.com/) - Modern, clean interface
- [DBeaver](https://dbeaver.io/) - Cross-platform, open-source

## Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `DATABASE_URL` (use Railway/Supabase)
     - `JWT_SECRET` (generate: `openssl rand -base64 32`)
     - `NEXTAUTH_SECRET` (generate: `openssl rand -base64 32`)
     - `NEXTAUTH_URL` (your Vercel URL)
     - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
   - Deploy!

3. **Run migrations on production**
   ```bash
   # Locally, with production DATABASE_URL
   DATABASE_URL="your-production-url" npm run db:push
   DATABASE_URL="your-production-url" npm run db:seed
   ```

### Railway Database Setup

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Copy connection string
5. Use in `.env.local` and Vercel

## Next Steps

- [ ] Add real product images
- [ ] Integrate payment gateway (Stripe/Razorpay)
- [ ] Build admin dashboard
- [ ] Add email notifications
- [ ] Implement wishlist
- [ ] Add product reviews

## Need Help?

- Check the main [README.md](./README.md)
- Review the [System Design Document](../DESIGN.md)
- Inspect API endpoints in `/app/api/`
- Check database schema in `/lib/db/schema.ts`

**Happy coding! 🚀**
