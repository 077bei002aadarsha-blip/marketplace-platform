# Critical Fixes Checklist

> **⚠️ WARNING:** These critical issues must be addressed before production deployment.

## 🔴 Critical Security Fixes (Week 1)

### 1. Fix JWT Secret Fallback ⚠️ CRITICAL
**Priority:** IMMEDIATE  
**File:** `lib/auth.ts:6`  
**Risk:** Authentication bypass

**Current Code:**
```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-key-change-in-production"
);
```

**Fix:**
```typescript
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? (() => {
    throw new Error('JWT_SECRET environment variable is required');
  })()
);
```

**Tasks:**
- [ ] Update `lib/auth.ts` to throw error if JWT_SECRET missing
- [ ] Generate strong JWT secret: `openssl rand -base64 32`
- [ ] Add JWT_SECRET to `.env.local` (never commit this file)
- [ ] Verify JWT_SECRET is set in all environments
- [ ] Test authentication still works
- [ ] Update deployment documentation

**Testing:**
```bash
# Test 1: Without JWT_SECRET (should fail to start)
unset JWT_SECRET
npm run dev  # Should throw error

# Test 2: With JWT_SECRET (should work)
export JWT_SECRET="your-generated-secret"
npm run dev  # Should start successfully
```

---

### 2. Implement Rate Limiting ⚠️ CRITICAL
**Priority:** HIGH  
**Risk:** Brute force attacks, DDoS

**Install Dependencies:**
```bash
npm install express-rate-limit
```

**Create Middleware:**
```typescript
// lib/rate-limit.ts
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(options: {
  windowMs: number
  maxRequests: number
}) {
  return (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    const record = rateLimitMap.get(ip)
    
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + options.windowMs
      })
      return null
    }
    
    if (record.count >= options.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
          }
        }
      )
    }
    
    record.count++
    return null
  }
}
```

**Apply to Auth Routes:**
```typescript
// app/api/auth/login/route.ts
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 requests per window
})

export async function POST(request: NextRequest) {
  const rateLimitResponse = limiter(request)
  if (rateLimitResponse) return rateLimitResponse
  
  // ... rest of login logic
}
```

**Tasks:**
- [ ] Install rate limiting package
- [ ] Create rate limit middleware
- [ ] Apply to login endpoint (5 attempts per 15 min)
- [ ] Apply to register endpoint (3 attempts per hour)
- [ ] Apply to all API endpoints (100 requests per 15 min)
- [ ] Add Redis for production (shared across instances)
- [ ] Test rate limiting works
- [ ] Document rate limit policies

**Testing:**
```bash
# Test login rate limit
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done
# Attempt 6 should return 429 Too Many Requests
```

---

### 3. Fix Order Creation Race Condition ⚠️ CRITICAL
**Priority:** HIGH  
**File:** `app/api/orders/route.ts`  
**Risk:** Product overselling

**Current Issue:** Stock check and update are not atomic

**Fix with Transaction:**
```typescript
// app/api/orders/route.ts
export async function POST(request: NextRequest) {
  // ... authentication and validation ...
  
  try {
    // Use transaction for atomic operations
    const result = await db.transaction(async (tx) => {
      // 1. Lock products and verify stock (FOR UPDATE)
      const lockedItems = await tx
        .select()
        .from(products)
        .where(
          inArray(products.id, items.map(i => i.productId))
        )
        .for('update') // Pessimistic lock
      
      // 2. Verify stock availability
      for (const item of items) {
        const product = lockedItems.find(p => p.id === item.productId)
        if (!product || product.stockQuantity < item.quantity) {
          throw new Error('Insufficient stock')
        }
      }
      
      // 3. Create order
      const [order] = await tx.insert(orders).values({
        userId: currentUser.userId,
        totalAmount: totalAmount.toFixed(2),
        shippingAddress: validatedData.shippingAddress,
        status: "pending",
      }).returning()
      
      // 4. Create order items
      await tx.insert(orderItems).values(
        items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price,
        }))
      )
      
      // 5. Update stock (within same transaction)
      for (const item of items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`
          })
          .where(eq(products.id, item.productId))
      }
      
      // 6. Clear cart
      await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id))
      
      return order
    })
    
    return NextResponse.json({
      message: "Order created successfully",
      order: result
    }, { status: 201 })
    
  } catch (error) {
    if (error.message === 'Insufficient stock') {
      return NextResponse.json(
        { error: "One or more items are out of stock" },
        { status: 400 }
      )
    }
    throw error
  }
}
```

**Tasks:**
- [ ] Wrap order creation in database transaction
- [ ] Add pessimistic locking (FOR UPDATE) on products
- [ ] Use SQL decrement for stock updates
- [ ] Add proper error handling
- [ ] Test concurrent order scenarios
- [ ] Add integration tests

**Testing:**
```bash
# Concurrent order test (requires testing framework)
# Create test that attempts 10 concurrent orders for same product
# Only orders up to stock quantity should succeed
```

---

### 4. Update Dependencies ⚠️ HIGH
**Priority:** HIGH  
**Risk:** Known security vulnerabilities

**Current Issues:**
```
esbuild <=0.24.2
Severity: moderate
4 moderate severity vulnerabilities
```

**Tasks:**
- [ ] Review npm audit output
- [ ] Update dependencies: `npm audit fix`
- [ ] If breaking changes: `npm audit fix --force` (review changes)
- [ ] Test application after updates
- [ ] Run npm audit to verify fixes
- [ ] Update package-lock.json
- [ ] Commit updated dependencies

**Commands:**
```bash
# Check vulnerabilities
npm audit

# Fix non-breaking changes
npm audit fix

# Fix all (may include breaking changes)
npm audit fix --force

# Verify fixes
npm audit

# Test application
npm run dev
npm run build
```

---

### 5. Strengthen Password Policy ⚠️ HIGH
**Priority:** HIGH  
**File:** `lib/validations.ts:6`  
**Risk:** Weak passwords

**Current Code:**
```typescript
password: z.string().min(8, "Password must be at least 8 characters")
```

**Fix:**
```typescript
password: z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
```

**Tasks:**
- [ ] Update password validation schema
- [ ] Update registration form with password requirements
- [ ] Add password strength indicator (optional)
- [ ] Update documentation
- [ ] Test registration with weak passwords (should fail)
- [ ] Test registration with strong passwords (should succeed)
- [ ] Communicate changes to existing users

---

## 🟡 High Priority (Week 2)

### 6. Setup Test Framework
**Priority:** HIGH

**Tasks:**
- [ ] Install testing dependencies: `npm install -D vitest @vitest/ui`
- [ ] Create `vitest.config.ts`
- [ ] Create `tests/` directory structure
- [ ] Write first unit test (password hashing)
- [ ] Add test scripts to package.json
- [ ] Setup GitHub Actions for CI
- [ ] Aim for 80% coverage

---

### 7. Implement Logging System
**Priority:** HIGH

**Tasks:**
- [ ] Install winston or pino: `npm install winston`
- [ ] Create logging utility in `lib/logger.ts`
- [ ] Replace all `console.log` with logger
- [ ] Add different log levels (error, warn, info, debug)
- [ ] Configure log output (file in production, console in dev)
- [ ] Add structured logging with context

---

### 8. Add Error Monitoring
**Priority:** HIGH

**Tasks:**
- [ ] Choose error monitoring service (Sentry, Rollbar)
- [ ] Install Sentry: `npm install @sentry/nextjs`
- [ ] Run Sentry wizard: `npx @sentry/wizard -i nextjs`
- [ ] Configure error boundaries
- [ ] Test error reporting
- [ ] Monitor production errors

---

## 📋 Verification Checklist

Before considering these fixes complete:

### Security Verification
- [ ] JWT_SECRET is required and validated
- [ ] Rate limiting is active on all API endpoints
- [ ] Order creation uses transactions
- [ ] No dependency vulnerabilities remain
- [ ] Password policy enforced
- [ ] All sensitive data in environment variables
- [ ] No secrets in code or commits

### Testing Verification
- [ ] Unit tests for critical functions
- [ ] Integration tests for API endpoints
- [ ] Can successfully create account
- [ ] Can successfully login
- [ ] Can add items to cart
- [ ] Can place order without race condition
- [ ] Rate limiting blocks excessive requests

### Production Readiness
- [ ] All critical issues resolved
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Monitoring configured
- [ ] Logging implemented
- [ ] Error tracking active
- [ ] Security headers configured

---

## 📞 Support

If you encounter issues implementing these fixes:

1. Review the detailed documentation:
   - [WEAKNESSES.md](./WEAKNESSES.md)
   - [SECURITY.md](./SECURITY.md)
   - [TESTING.md](./TESTING.md)

2. Check individual issue details for more context

3. Test thoroughly before deploying

---

## ✅ Progress Tracking

Use this checklist to track progress:

```
Critical Security Fixes:
[ ] 1. JWT Secret Fixed
[ ] 2. Rate Limiting Implemented
[ ] 3. Order Race Condition Fixed
[ ] 4. Dependencies Updated
[ ] 5. Password Policy Strengthened

High Priority:
[ ] 6. Test Framework Setup
[ ] 7. Logging System Implemented
[ ] 8. Error Monitoring Active

Verification:
[ ] Security audit passed
[ ] Tests passing
[ ] Production deployment successful
```

---

**Remember:** Do not deploy to production until all critical items are checked off.

**Last Updated:** 2025-11-17
