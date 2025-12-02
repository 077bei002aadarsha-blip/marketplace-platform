# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier works)
- Railway/Supabase account for PostgreSQL database

---

## Step 1: Prepare Database (Railway)

### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Provision PostgreSQL"
5. Once created, click on PostgreSQL service
6. Go to "Connect" tab
7. Copy the "Postgres Connection URL"
   ```
   postgresql://postgres:password@server.railway.app:5432/railway
   ```

### Option B: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for provisioning
4. Go to Settings → Database
5. Copy "Connection string" under "Connection pooling"

---

## Step 2: Setup Git Repository

```bash
cd marketplace-platform

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Phase 1 MVP"

# Create GitHub repo (go to github.com and create new repo)
# Then link it:
git remote add origin https://github.com/yourusername/marketplace-platform.git

# Push
git push -u origin main
```

---

## Step 3: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "Add New Project"**
4. **Import your repository**
5. **Configure Project:**
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Install Command: `npm install` (default)

6. **Add Environment Variables:**

   Click "Environment Variables" and add:

   **Core Variables:**
   ```env
   DATABASE_URL=your-railway-connection-string
   JWT_SECRET=generate-with-command-below
   NEXTAUTH_SECRET=generate-with-command-below
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   NODE_ENV=production
   ```

   **Email (Resend) - Required for order notifications:**
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```
   Get API key from: https://resend.com/api-keys

   **File Upload (Cloudinary) - Required for product images:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   Get credentials from: https://console.cloudinary.com

   **Payment Gateway (eSewa) - Required for online payments:**
   ```env
   NEXT_PUBLIC_ESEWA_MERCHANT_ID=EPAYTEST
   ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
   NEXT_PUBLIC_ESEWA_ENVIRONMENT=production
   ```
   Note: Use test credentials above for testing. Get production credentials from eSewa merchant account.

   **Generate secrets:**
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32

   # Generate NEXTAUTH_SECRET
   openssl rand -base64 32
   ```

7. **Click "Deploy"**

Wait 2-3 minutes for deployment to complete.

---

## Step 4: Setup Database Schema

After deployment, you need to create tables and seed data.

### Method 1: Using Local Terminal

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-railway-connection-string"

# Or on Windows:
set DATABASE_URL=your-railway-connection-string

# Push schema to production database
npm run db:push

# Seed data
npm run db:seed
```

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.production
npm run db:push

# Seed data
npm run db:seed
```

---

## Step 5: Verify Deployment

1. **Visit your Vercel URL:** `https://your-project.vercel.app`

2. **Test the following:**
   - [ ] Homepage loads
   - [ ] Register new user
   - [ ] Login works
   - [ ] Products display
   - [ ] Search works
   - [ ] Cart functionality
   - [ ] Checkout works
   - [ ] Orders appear

---

## Step 6: Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-60 minutes)

---

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"
- Verify environment variables in Vercel dashboard
- Redeploy after adding variables

### Error: "relation 'products' does not exist"
- Run `npm run db:push` with production DATABASE_URL
- Check Railway/Supabase logs for connection issues

### Products not showing
- Run `npm run db:seed` with production DATABASE_URL
- Check database using Railway dashboard

### 500 Internal Server Error
- Check Vercel Function logs
- Verify all environment variables are set
- Check database connection

### JWT/Auth errors
- Regenerate JWT_SECRET and NEXTAUTH_SECRET
- Make sure NEXTAUTH_URL matches your domain
- Clear browser cookies

---

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database schema pushed
- [ ] Sample data seeded
- [ ] Homepage accessible
- [ ] User registration works
- [ ] Login/logout works
- [ ] Products display
- [ ] Cart functionality works
- [ ] Checkout works
- [ ] Orders save correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] HTTPS enabled

---

## Monitoring & Maintenance

### Vercel Dashboard
- Check deployment status
- View function logs
- Monitor bandwidth usage
- Review analytics

### Railway/Supabase Dashboard
- Monitor database size
- Check connection count
- Review slow queries
- Set up backups

### Regular Tasks
- Monitor error logs weekly
- Check database performance
- Update dependencies monthly
- Review user feedback
- Plan Phase 2 features

---

## Scaling Considerations

### When you need to scale:

1. **Database:**
   - Upgrade Railway plan
   - Enable connection pooling
   - Add read replicas

2. **Application:**
   - Vercel auto-scales
   - Consider edge functions
   - Implement caching

3. **Images:**
   - Use Cloudinary/Uploadcare
   - Implement lazy loading
   - Optimize image sizes

---

## Rollback Plan

If deployment fails:

1. **Revert to previous deployment:**
   - Go to Vercel dashboard
   - Click "Deployments"
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Fix and redeploy:**
   ```bash
   git revert HEAD
   git push origin main
   ```

---

## Cost Estimation

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- 100GB-hours compute
- Unlimited projects

**Railway:**
- $5 free credits/month
- ~160 hours of database

**Total: $0-5/month for MVP**

### Paid Tier (When scaling)
- Vercel Pro: $20/month
- Railway: ~$10-20/month
- **Total: ~$30-40/month**

---

## Security Checklist

- [ ] Strong JWT secrets in production
- [ ] HTTPS enforced
- [ ] HTTP-only cookies enabled
- [ ] CORS configured properly
- [ ] Rate limiting (Phase 2)
- [ ] SQL injection protection (Drizzle handles this)
- [ ] XSS prevention (React handles this)
- [ ] Regular dependency updates

---

## Next Steps After Deployment

1. **Test thoroughly** on production
2. **Share with friends** for feedback
3. **Monitor logs** for errors
4. **Plan Phase 2** features:
   - Payment integration
   - Admin dashboard
   - Email notifications
   - Reviews & ratings

---

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Drizzle ORM Production](https://orm.drizzle.team/docs/overview)

---

**🎉 Congratulations on deploying your e-commerce platform!**
