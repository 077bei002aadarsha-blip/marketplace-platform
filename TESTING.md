# Testing Strategy & Gaps

## 🧪 Current Testing Status

**Test Coverage: 0%** ❌

The project currently has **NO automated tests** implemented. This is a critical gap that needs to be addressed.

## 🎯 Testing Priorities

### Priority 1: Critical Path Tests (Week 1-2)
These tests cover the most important user flows and should be implemented first:

1. **Authentication Flow**
   - User registration
   - User login
   - Protected route access
   - JWT token validation

2. **Shopping Flow**
   - Product listing and filtering
   - Add to cart
   - Cart management
   - Order creation

3. **Data Integrity**
   - Stock management
   - Order creation race conditions
   - Cart synchronization

### Priority 2: API Coverage (Week 3-4)
Comprehensive API endpoint testing:

1. All authentication endpoints
2. All product endpoints
3. All cart endpoints
4. All order endpoints

### Priority 3: Integration & E2E (Week 5-6)
Full integration and end-to-end testing:

1. Complete user journeys
2. Database integration
3. Error scenarios
4. Edge cases

## 📋 Required Test Types

### 1. Unit Tests

#### lib/auth.ts
```typescript
describe('Authentication Utilities', () => {
  // Password hashing
  - should hash password correctly
  - should verify password correctly
  - should reject incorrect password
  - should use 12 salt rounds

  // JWT operations
  - should create valid JWT token
  - should verify valid JWT token
  - should reject expired token
  - should reject invalid token
  - should reject malformed token

  // Cookie management
  - should set auth cookie with correct options
  - should retrieve auth cookie
  - should remove auth cookie
  - should use httpOnly flag
  - should use secure flag in production
  - should use SameSite=lax
})
```

#### lib/validations.ts
```typescript
describe('Validation Schemas', () => {
  // Register schema
  - should accept valid registration data
  - should reject invalid email
  - should reject short password
  - should reject short name
  - should accept optional phone

  // Login schema
  - should accept valid login data
  - should reject invalid email
  - should require password

  // Product filter schema
  - should accept valid filters
  - should accept optional parameters
  - should validate price ranges
  - should validate sort options

  // Cart schemas
  - should validate UUID for productId
  - should require positive quantity
  - should validate cart item updates

  // Order schema
  - should require minimum address length
  - should accept valid shipping address
})
```

### 2. Integration Tests

#### API: /api/auth/*
```typescript
describe('POST /api/auth/register', () => {
  - should register new user successfully
  - should return 400 for duplicate email
  - should return 400 for invalid input
  - should hash password before storing
  - should create user cart automatically
  - should set auth cookie
  - should return user data (no password)
})

describe('POST /api/auth/login', () => {
  - should login with valid credentials
  - should return 401 for invalid email
  - should return 401 for invalid password
  - should set auth cookie on success
  - should return user data (no password)
  - should handle case sensitivity correctly
})

describe('POST /api/auth/logout', () => {
  - should clear auth cookie
  - should return success message
  - should work even if not logged in
})

describe('GET /api/auth/me', () => {
  - should return current user when authenticated
  - should return 401 when not authenticated
  - should not return password
})
```

#### API: /api/products/*
```typescript
describe('GET /api/products', () => {
  - should return paginated products
  - should filter by category
  - should filter by price range
  - should search by name/description
  - should sort by price ascending
  - should sort by price descending
  - should sort by newest
  - should return only active products
  - should handle invalid parameters gracefully
  - should return correct pagination metadata
})

describe('GET /api/products/:id', () => {
  - should return product details
  - should return 404 for non-existent product
  - should return related products
  - should return 400 for invalid UUID
})
```

#### API: /api/cart/*
```typescript
describe('GET /api/cart', () => {
  - should return user cart when authenticated
  - should return 401 when not authenticated
  - should include product details
  - should calculate correct subtotal
  - should calculate correct item count
  - should return empty cart if no items
})

describe('POST /api/cart', () => {
  - should add item to cart
  - should update quantity if item exists
  - should return 401 when not authenticated
  - should return 404 for invalid product
  - should return 400 for insufficient stock
  - should validate quantity is positive
  - should prevent negative quantities
})

describe('PUT /api/cart/:itemId', () => {
  - should update item quantity
  - should return 401 when not authenticated
  - should return 404 for non-existent item
  - should return 400 for insufficient stock
  - should prevent unauthorized access
})

describe('DELETE /api/cart/:itemId', () => {
  - should remove item from cart
  - should return 401 when not authenticated
  - should return 404 for non-existent item
  - should prevent unauthorized access
})

describe('DELETE /api/cart', () => {
  - should clear all cart items
  - should return 401 when not authenticated
  - should not affect other users carts
})
```

#### API: /api/orders/*
```typescript
describe('POST /api/orders', () => {
  - should create order from cart
  - should return 401 when not authenticated
  - should return 400 for empty cart
  - should return 400 for insufficient stock
  - should calculate correct total
  - should create order items
  - should update product stock
  - should clear cart after order
  - should handle concurrent orders (race condition)
  - should validate shipping address
})

describe('GET /api/orders', () => {
  - should return user orders
  - should return 401 when not authenticated
  - should sort by newest first
  - should not return other users orders
})

describe('GET /api/orders/:id', () => {
  - should return order details
  - should return 401 when not authenticated
  - should return 404 for non-existent order
  - should prevent unauthorized access
  - should include order items
})
```

### 3. End-to-End Tests

```typescript
describe('Complete User Journey', () => {
  // Registration and Login
  - User can register new account
  - User can login with credentials
  - User cannot access protected pages without login
  - User is redirected after login

  // Product Browsing
  - User can view product list
  - User can filter by category
  - User can search products
  - User can view product details

  // Shopping Cart
  - User can add product to cart
  - Cart badge shows correct count
  - User can update quantities
  - User can remove items
  - Subtotal calculates correctly

  // Checkout
  - User can proceed to checkout
  - User must provide shipping address
  - Order summary is correct
  - User can place order

  // Order Confirmation
  - Order confirmation page shows details
  - Order appears in order history
  - Product stock is updated
  - Cart is cleared

  // Logout
  - User can logout
  - User is redirected to homepage
  - Protected pages require login again
})

describe('Error Scenarios', () => {
  - Handles network failures gracefully
  - Shows appropriate error messages
  - Validates form inputs client-side
  - Prevents duplicate order submissions
  - Handles out-of-stock situations
  - Handles concurrent cart modifications
})
```

### 4. Security Tests

```typescript
describe('Security Tests', () => {
  // Authentication Security
  - Cannot access protected routes without token
  - Cannot use expired JWT tokens
  - Cannot forge JWT tokens
  - Cannot access other users data

  // Input Validation
  - SQL injection attempts are prevented
  - XSS attempts are sanitized
  - Invalid UUIDs are rejected
  - Negative quantities are rejected
  - Oversized inputs are rejected

  // Authorization
  - Cannot modify other users carts
  - Cannot view other users orders
  - Cannot access other users data

  // Rate Limiting (when implemented)
  - Login endpoint is rate limited
  - Registration endpoint is rate limited
  - API endpoints are rate limited
})
```

### 5. Performance Tests

```typescript
describe('Performance Tests', () => {
  // Load Testing
  - Handle 100 concurrent users
  - Handle 1000 products in database
  - Handle 100 items in cart
  - Response time under 200ms for API calls

  // Database Performance
  - Product search is optimized
  - Cart queries are efficient
  - Order creation is transactional
  - Indexes are used correctly

  // Concurrent Operations
  - Multiple users can checkout simultaneously
  - Stock updates are atomic
  - No race conditions in order creation
})
```

## 🛠️ Recommended Testing Stack

### Testing Framework
**Vitest** (Recommended)
- Fast, modern testing framework
- Built for Vite/Next.js
- Compatible with Jest API
- Excellent TypeScript support

Alternative: **Jest**
- More mature, larger ecosystem
- Requires more configuration

### Integration Testing
**Supertest**
- API endpoint testing
- HTTP assertions
- Works with Next.js API routes

### E2E Testing
**Playwright** (Recommended)
- Modern, fast, reliable
- Cross-browser testing
- Built-in test runner
- Excellent documentation

Alternative: **Cypress**
- Popular choice
- Great developer experience
- Good documentation

### Database Testing
**Testcontainers**
- Isolated test database
- Real PostgreSQL instance
- Clean state for each test

Alternative: **In-memory SQLite**
- Faster but less accurate
- Good for unit tests

### Mocking
**MSW (Mock Service Worker)**
- API mocking for E2E tests
- Works in browser and Node.js

## 📦 Setup Instructions

### 1. Install Dependencies

```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D supertest @types/supertest
npm install -D playwright @playwright/test
npm install -D msw
```

### 2. Configure Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

### 3. Configure Playwright

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4. Add Test Scripts

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 5. Create Test Structure

```
tests/
├── setup.ts                 # Test setup and global mocks
├── unit/                    # Unit tests
│   ├── auth.test.ts
│   ├── validations.test.ts
│   └── utils.test.ts
├── integration/             # Integration tests
│   ├── auth.test.ts
│   ├── products.test.ts
│   ├── cart.test.ts
│   └── orders.test.ts
├── e2e/                     # E2E tests
│   ├── registration.spec.ts
│   ├── shopping.spec.ts
│   └── checkout.spec.ts
├── fixtures/                # Test data
│   ├── users.ts
│   ├── products.ts
│   └── orders.ts
└── helpers/                 # Test utilities
    ├── setup-db.ts
    ├── create-test-user.ts
    └── clear-db.ts
```

## 📊 Coverage Goals

### Target Coverage
- **Overall:** 80% minimum
- **Critical paths:** 95% minimum
- **Business logic:** 90% minimum
- **API endpoints:** 85% minimum

### Current Coverage
- **Overall:** 0% ❌
- **Critical paths:** 0% ❌
- **Business logic:** 0% ❌
- **API endpoints:** 0% ❌

## ⚡ Quick Start Example

### Example Unit Test

```typescript
// tests/unit/auth.test.ts
import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/auth'

describe('Password Utilities', () => {
  it('should hash password correctly', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)
    
    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should verify correct password', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)
    
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'testpassword123'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword('wrongpassword', hash)
    
    expect(isValid).toBe(false)
  })
})
```

### Example Integration Test

```typescript
// tests/integration/auth.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createTestServer } from '../helpers/setup'
import { cleanDatabase } from '../helpers/db'

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await cleanDatabase()
  })

  it('should register new user successfully', async () => {
    const response = await request(createTestServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        fullName: 'Test User'
      })
      
    expect(response.status).toBe(201)
    expect(response.body.user.email).toBe('test@example.com')
    expect(response.body.user.fullName).toBe('Test User')
    expect(response.body.user.password).toBeUndefined()
  })

  it('should return 400 for duplicate email', async () => {
    // Register first user
    await request(createTestServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        fullName: 'Test User'
      })

    // Try to register again with same email
    const response = await request(createTestServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Different123!',
        fullName: 'Another User'
      })
      
    expect(response.status).toBe(400)
    expect(response.body.error).toBeDefined()
  })
})
```

### Example E2E Test

```typescript
// tests/e2e/shopping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Shopping Flow', () => {
  test('user can add product to cart and checkout', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    
    // Click on first product
    await page.click('text=View Details').first()
    
    // Add to cart
    await page.click('text=Add to Cart')
    
    // Verify cart badge updated
    const cartBadge = page.locator('[data-testid="cart-badge"]')
    await expect(cartBadge).toHaveText('1')
    
    // Go to cart
    await page.click('text=Cart')
    
    // Verify product in cart
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1)
    
    // Proceed to checkout
    await page.click('text=Proceed to Checkout')
    
    // Fill shipping address
    await page.fill('[name="shippingAddress"]', '123 Test St, Test City, TC 12345')
    
    // Place order
    await page.click('text=Place Order')
    
    // Verify success
    await expect(page.locator('text=Order Placed Successfully')).toBeVisible()
  })
})
```

## 🚀 Implementation Roadmap

### Week 1: Setup & Infrastructure
- [ ] Install testing dependencies
- [ ] Configure Vitest
- [ ] Configure Playwright
- [ ] Create test structure
- [ ] Setup test database
- [ ] Create test helpers

### Week 2: Unit Tests
- [ ] Test lib/auth.ts
- [ ] Test lib/validations.ts
- [ ] Test utility functions
- [ ] Achieve 80% unit test coverage

### Week 3: Integration Tests - Auth
- [ ] Test POST /api/auth/register
- [ ] Test POST /api/auth/login
- [ ] Test POST /api/auth/logout
- [ ] Test GET /api/auth/me

### Week 4: Integration Tests - Products & Cart
- [ ] Test GET /api/products
- [ ] Test GET /api/products/:id
- [ ] Test all cart endpoints
- [ ] Test cart business logic

### Week 5: Integration Tests - Orders
- [ ] Test POST /api/orders
- [ ] Test GET /api/orders
- [ ] Test GET /api/orders/:id
- [ ] Test order race conditions

### Week 6: E2E Tests
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test shopping flow
- [ ] Test checkout flow
- [ ] Test error scenarios

### Week 7: Performance & Security
- [ ] Load testing
- [ ] Security testing
- [ ] Performance benchmarks
- [ ] Fix identified issues

### Week 8: CI/CD Integration
- [ ] Setup GitHub Actions
- [ ] Run tests on PR
- [ ] Coverage reports
- [ ] Automated deployment on passing tests

## 📈 Success Metrics

- ✅ All critical paths have tests
- ✅ 80% overall code coverage
- ✅ All tests pass consistently
- ✅ Tests run in under 5 minutes
- ✅ No flaky tests
- ✅ CI/CD pipeline integrated

## 🎓 Best Practices

1. **Write tests first** (TDD when possible)
2. **Keep tests isolated** (no shared state)
3. **Use descriptive test names**
4. **Test behavior, not implementation**
5. **Mock external dependencies**
6. **Clean up after tests**
7. **Run tests frequently**
8. **Maintain test quality**

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Note:** Testing is not optional for production applications. Start implementing tests immediately to ensure code quality and prevent regressions.
