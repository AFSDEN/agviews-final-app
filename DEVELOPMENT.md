# Development Guide

This guide helps you set up the development environment and understand the codebase.

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

**Option A: Using Neon.tech (Recommended)**
- Go to [neon.tech](https://neon.tech)
- Create free account
- Create new project and database
- Copy connection string

**Option B: Using Local PostgreSQL**
```bash
createdb agviews
```

### 3. Initialize Database
```bash
# Neon.tech: Copy init.sql content into SQL editor
# Local PostgreSQL: 
psql agviews -f init.sql
```

### 4. Configure Environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/agviews
JWT_SECRET=dev-secret-key-change-in-production
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: `http://localhost:3000`

## Project Structure Explained

### `/pages`
- **`index.tsx`**: Landing page with features and CTA
- **`login.tsx`**: User login form
- **`register.tsx`**: User registration form
- **`dashboard.tsx`**: Main user dashboard showing assessments
- **`assessment.tsx`**: Assessment builder interface
- **`assessment-results.tsx`**: Results analytics page
- **`_app.tsx`**: App wrapper with global auth state
- **`_document.tsx`**: HTML document structure

### `/pages/api`
REST API endpoints:
- **`auth/`**: Authentication endpoints (login, register, verify)
- **`assessments/`**: Assessment CRUD operations
- **`assessments/[id]/results.ts`**: Get assessment results
- **`health.ts`**: System health check

### `/lib`
Core utilities and logic:
- **`db.ts`**: Database connection pooling and query helpers
- **`schema.ts`**: TypeScript interfaces and SQL schema definitions
- **`auth.ts`**: JWT, password hashing, user management
- **`logger.ts`**: Structured logging utility
- **`utils.ts`**: Common helper functions

### `/styles`
- **`globals.css`**: Global styles with Tailwind directives

### Root Configuration Files
- **`package.json`**: Dependencies and scripts
- **`tsconfig.json`**: TypeScript configuration
- **`next.config.js`**: Next.js configuration
- **`tailwind.config.js`**: Tailwind CSS theme
- **`postcss.config.js`**: PostCSS plugins
- **`middleware.ts`**: Next.js edge middleware for auth

## Common Development Tasks

### Add a New API Endpoint

1. Create file: `pages/api/endpoint-name.ts`
2. Import auth and db utilities
3. Verify token in request
4. Query database
5. Return response

Example:
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, extractTokenFromHeader } from '../../../lib/auth';
import { query } from '../../../lib/db';
import { sendSuccess, sendError } from '../../../lib/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405);
  }

  const token = extractTokenFromHeader(req.headers.authorization);
  if (!token) {
    return sendError(res, 'No token provided', 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return sendError(res, 'Invalid token', 401);
  }

  try {
    // Your logic here
    return sendSuccess(res, { data: 'example' }, 'Success', 200);
  } catch (error) {
    return sendError(res, 'Error', 500);
  }
}
```

### Add a New Page

1. Create file: `pages/new-page.tsx`
2. Import Head for SEO
3. Create React component
4. Add to navigation if needed
5. Check middleware.ts for routing rules

### Modify Database Schema

1. Add changes to `lib/schema.ts`
2. Create migration or modify `init.sql`
3. Run: `psql $DATABASE_URL -f migration.sql`
4. Test thoroughly
5. Update TypeScript interfaces

### Run Type Checking
```bash
npm run type-check
```

### Build for Production
```bash
npm run build
npm start
```

## API Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Get assessments (with token)
curl -X GET http://localhost:3000/api/assessments \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create assessment
curl -X POST http://localhost:3000/api/assessments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Sample Assessment",
    "description": "Test assessment",
    "assessmentType": "general",
    "passingScore": 70,
    "questions": [
      {
        "text": "Sample question?",
        "type": "multiple_choice",
        "options": ["A", "B", "C"],
        "correctAnswer": "A",
        "points": 1
      }
    ]
  }'
```

### Using Postman

1. Import collection (create manually)
2. Set base URL: `http://localhost:3000`
3. Create environment with TOKEN variable
4. Test endpoints with different methods

## Database Queries

### Common Queries

```sql
-- Get user with email
SELECT * FROM users WHERE email = 'user@example.com';

-- Get user's assessments
SELECT * FROM assessments WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- Get assessment with questions
SELECT * FROM assessment_questions WHERE assessment_id = 'assessment-id';

-- Get responses for assessment
SELECT * FROM assessment_responses WHERE assessment_id = 'assessment-id';

-- Count assessments
SELECT COUNT(*) FROM assessments WHERE user_id = 'user-id';

-- Get average score
SELECT AVG(score) FROM assessment_responses WHERE assessment_id = 'assessment-id';
```

## Debugging Tips

### Check Logs
```bash
# Terminal shows console.log output
# Check browser console for frontend errors
```

### Database Issues
```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Describe table
\d users

# Exit
\q
```

### API Debugging
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check network tab in browser DevTools
# View response in terminal
```

### Common Errors

**Database Connection Failed**
- Verify DATABASE_URL is correct
- Check database is running
- Ensure credentials are valid

**JWT Token Invalid**
- JWT_SECRET might be different from when token was created
- Token might be expired (24 hours)
- Token might be corrupted in transmission

**Type Errors**
- Run `npm run type-check`
- Check interface definitions match usage
- Verify imports are correct

## Performance Tips

- Use indexes on frequently queried columns
- Avoid N+1 queries (fetch related data in one query)
- Cache authentication checks
- Use connection pooling (already configured)
- Optimize database queries with EXPLAIN

## Next Steps

1. Read through each page component
2. Understand API endpoint structure
3. Modify database schema as needed
4. Add new features
5. Deploy to Vercel

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jose JWT Library](https://github.com/panva/jose)

---

Happy coding! 🚀
