# Agviews - Professional Assessment Platform

A production-ready Next.js application for creating, managing, and analyzing professional assessments.

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Assessment Builder**: Create custom assessments with multiple question types
- **Response Analytics**: Real-time tracking and analysis of assessment responses
- **User Dashboard**: Manage assessments and view detailed results
- **RESTful API**: Complete API for programmatic access
- **Database**: PostgreSQL with comprehensive schema
- **Security**: HTTPS support, SQL injection protection, CSRF tokens
- **Scalability**: Built on Next.js for serverless deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+
- PostgreSQL database (or Neon.tech/Supabase)

### Installation

1. **Clone and setup**
```bash
cd agviews-app
npm install
```

2. **Configure environment**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```
DATABASE_URL=postgresql://user:password@localhost:5432/agviews
JWT_SECRET=your-super-secret-key-change-this
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Initialize database**

Option A: If using Neon.tech or Supabase:
- Copy the entire contents of `init.sql`
- Go to your Neon/Supabase SQL editor
- Paste and run the script

Option B: If using local PostgreSQL:
```bash
psql -U postgres -d agviews -f init.sql
```

4. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📁 Project Structure

```
agviews-app/
├── pages/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login.ts         # Login endpoint
│   │   │   ├── register.ts       # Registration endpoint
│   │   │   └── verify.ts         # Token verification
│   │   ├── assessments/
│   │   │   ├── index.ts          # List & create assessments
│   │   │   ├── [id].ts           # Get, update, delete assessment
│   │   │   └── [id]/results.ts   # Get assessment results
│   │   └── health.ts             # Health check endpoint
│   ├── index.tsx                 # Landing page
│   ├── login.tsx                 # Login page
│   ├── register.tsx              # Registration page
│   ├── dashboard.tsx             # User dashboard
│   ├── assessment.tsx            # Assessment builder
│   ├── assessment-results.tsx    # Results page
│   ├── _app.tsx                  # App wrapper
│   └── _document.tsx             # HTML document
├── lib/
│   ├── db.ts                     # Database connection & helpers
│   ├── schema.ts                 # Database schema definitions
│   ├── auth.ts                   # Authentication logic
│   ├── logger.ts                 # Logging utility
│   └── utils.ts                  # Helper functions
├── styles/
│   └── globals.css               # Global styles
├── middleware.ts                 # Next.js middleware
├── init.sql                      # Database initialization
└── package.json                  # Dependencies

```

## 🔐 Authentication

The application uses JWT tokens for authentication:

1. User registers/logs in
2. Server returns JWT token
3. Token is stored in localStorage and HTTP-only cookie
4. Subsequent requests include token in Authorization header
5. Middleware verifies token before accessing protected routes

### Key Auth Functions

- `hashPassword(password)` - Hash password with bcrypt
- `verifyPassword(password, hash)` - Verify password
- `createToken(payload)` - Create JWT token
- `verifyToken(token)` - Verify and decode JWT
- `createUser(...)` - Create new user
- `getUserById(id)` - Get user by ID

## 📊 Database Schema

### Users Table
- User accounts with authentication
- Role-based access control (admin, user, viewer)
- Account status tracking

### Assessments Table
- Assessment metadata
- Support for different assessment types
- Time limits and passing scores

### Assessment Questions Table
- Questions with multiple type support
- Points system
- Ordered questions

### Assessment Responses Table
- Respondent answers
- Score tracking
- Time tracking

### Answers Table
- Individual answers to questions
- Correctness evaluation
- Points earned

### Sessions Table
- JWT token management
- Token expiration
- IP tracking

### Leads Table
- Lead capture from landing page
- Source tracking
- Conversion status

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Assessments
- `GET /api/assessments` - List user's assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/[id]` - Get assessment details
- `PUT /api/assessments/[id]` - Update assessment
- `DELETE /api/assessments/[id]` - Delete assessment
- `GET /api/assessments/[id]/results` - Get assessment results

### System
- `GET /api/health` - Health check

## 🚢 Deployment to Vercel

### 1. Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Set Environment Variables on Vercel

Go to Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL = postgresql://...
JWT_SECRET = your-secret-key
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

### 3. Deploy

```bash
vercel --prod
```

Or connect GitHub repo and Vercel will auto-deploy on push.

### 4. Verify Deployment

- Check `/api/health` endpoint
- Try login/register flow
- Test assessment creation

## 🧪 Testing

### Manual Testing

1. **Register**: Create new account
2. **Login**: Sign in with credentials
3. **Create Assessment**: Build assessment with questions
4. **View Dashboard**: See all created assessments
5. **Check Results**: View analytics and responses

### API Testing (curl)

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Verify token
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer <token>"
```

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (10 rounds)
- ✅ JWT token-based authentication
- ✅ HTTP-only secure cookies
- ✅ SQL injection protection (parameterized queries)
- ✅ CORS headers configured
- ✅ Environment variable protection
- ✅ Rate limiting ready (implement using middleware)
- ✅ Input validation and sanitization

## 📈 Performance Optimization

- Next.js auto-optimization
- Database connection pooling
- Query indexing
- Static page generation where possible
- CSS minification via Tailwind
- Image optimization

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test connection string
psql $DATABASE_URL -c "SELECT 1"
```

### Authentication Problems

- Check JWT_SECRET is set
- Verify token expiration time
- Clear localStorage and try again

### Build Failures

```bash
npm run type-check
npm run build
```

### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

## 📝 License

MIT License - feel free to use this template

## 🤝 Support

For issues and questions:
- Check GitHub Issues
- Review API documentation
- Check environment configuration

---

**Built with ❤️ using Next.js, React, TypeScript, and Tailwind CSS**
