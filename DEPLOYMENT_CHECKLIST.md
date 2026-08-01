# Agviews Deployment Checklist

Complete this checklist before deploying to production.

## Pre-Deployment

### Code Quality
- [ ] Run `npm run type-check` - no TypeScript errors
- [ ] Run `npm run build` - build succeeds
- [ ] Run `npm run lint` - no linting issues
- [ ] Review code for console.logs and debug statements
- [ ] Verify all imports are correct (run `npm ls`)

### Database
- [ ] Database initialized with `init.sql`
- [ ] All tables created successfully
- [ ] Indexes created for performance
- [ ] Test database connection: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] Backup database if migrating from existing

### Environment Variables
- [ ] All `.env.example` variables configured
- [ ] `DATABASE_URL` is correct and tested
- [ ] `JWT_SECRET` is strong (min 32 characters, random)
- [ ] `JWT_SECRET` changed from default value
- [ ] `NODE_ENV` set to `production`
- [ ] `NEXT_PUBLIC_APP_URL` set to production domain
- [ ] No hardcoded secrets in code

### Security
- [ ] All passwords hashed with bcrypt
- [ ] JWT tokens expire appropriately (24h default)
- [ ] HTTP-only cookies enabled for tokens
- [ ] CORS headers configured correctly
- [ ] SQL injection protection verified (parameterized queries)
- [ ] No sensitive data logged
- [ ] API rate limiting considered

### Testing
- [ ] User registration works end-to-end
- [ ] User login works end-to-end
- [ ] Assessment creation works
- [ ] Assessment results display correctly
- [ ] All API endpoints tested with valid token
- [ ] All API endpoints reject invalid token
- [ ] Health check endpoint responds: `/api/health`

## Vercel Deployment

### Project Setup
- [ ] GitHub repository created and pushed
- [ ] Vercel account created
- [ ] Vercel project connected to GitHub repo

### Environment Variables on Vercel
Set these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL = postgresql://...
JWT_SECRET = <your-strong-secret>
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

- [ ] All environment variables added
- [ ] Production environment selected
- [ ] Variables are **not** exposed to browser (except NEXT_PUBLIC_*)

### Build Settings
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`
- [ ] Node version: 18.x or later

### Domain Configuration
- [ ] Custom domain added to Vercel project
- [ ] DNS records configured (if using custom domain)
- [ ] SSL certificate auto-generated
- [ ] HTTPS redirect enabled

### Post-Deployment Verification

#### Immediate Tests
- [ ] Production URL loads without errors
- [ ] Health check responds: `https://your-domain/api/health`
- [ ] Landing page displays
- [ ] Login page loads
- [ ] Registration page loads

#### Functional Tests
- [ ] Register new user
- [ ] Login with new user
- [ ] Create assessment
- [ ] View dashboard
- [ ] Update assessment
- [ ] Delete assessment
- [ ] Export results to CSV

#### API Tests
```bash
# Test registration
curl -X POST https://your-domain/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Test login
curl -X POST https://your-domain/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Test health check
curl https://your-domain/api/health
```

#### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Lighthouse score > 80
- [ ] No console errors in browser

#### Security Tests
- [ ] No hardcoded secrets in frontend
- [ ] Cookies are HTTP-only
- [ ] CSRF protection enabled
- [ ] Rate limiting working
- [ ] Invalid tokens rejected

## Post-Deployment

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry optional)
- [ ] Database backups configured
- [ ] Monitor health check endpoint regularly

### Logging
- [ ] Application logs accessible
- [ ] Error logs reviewed daily
- [ ] Performance logs monitored

### Maintenance
- [ ] Database maintenance scheduled
- [ ] Regular backups verified
- [ ] Update dependencies monthly
- [ ] Security patches applied immediately

## Rollback Plan

If deployment fails:

1. Check Vercel deployment logs
2. Check environment variables
3. Verify database connectivity
4. Rollback to previous commit: `git revert HEAD`
5. Redeploy to Vercel

## Troubleshooting

### Database Connection Failed
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection string format
# postgresql://user:password@host:port/database
```

### Build Failed
```bash
npm run build
npm run type-check
# Check error output
```

### Auth Not Working
- Verify JWT_SECRET is set
- Verify database tables exist
- Check user exists in users table
- Review auth API logs

### Performance Issues
- Check database query performance
- Review Vercel function logs
- Monitor API response times
- Check database connection pooling

## Production Best Practices

- ✅ Use strong JWT secrets
- ✅ Enable HTTPS (automatic on Vercel)
- ✅ Regular database backups
- ✅ Monitor error rates
- ✅ Track user analytics
- ✅ Set up alerts for errors
- ✅ Document API changes
- ✅ Version your API
- ✅ Rate limit endpoints
- ✅ Implement logging

## Support

For deployment issues:
1. Check Vercel deployment logs
2. Review README.md troubleshooting section
3. Verify environment configuration
4. Check database connectivity
5. Review application logs

---

**Deployment Status**: [ ] Ready for Production
