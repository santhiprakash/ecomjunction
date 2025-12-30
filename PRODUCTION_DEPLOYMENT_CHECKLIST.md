# Production Deployment Checklist

## Status Summary

✅ **Completed:**
- Database configured in .env (NeonDB)
- Cloudflare R2 bucket created (Account ID, S3 API URL, Bucket name available)
- SMTP credentials from Emailit (to be provided)

⏳ **Pending:**
- Run database migration scripts
- Configure R2 environment variables
- Configure Emailit environment variables
- Test all integrations
- Deploy to production

---

## 1. Database Setup (NeonDB) ✅ → ⏳ Run Migration

### Step 1: Run Database Migration

You have two options to run the migration:

**Option A: Using Neon SQL Editor (Recommended for first-time setup)**
1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Copy the entire contents of `migrations/001_initial_schema_neon.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute
7. Verify tables are created in the "Tables" tab

**Option B: Using psql CLI**
```bash
# Run the migration script
psql "YOUR_DATABASE_URL" -f migrations/001_initial_schema_neon.sql

# Verify tables were created
psql "YOUR_DATABASE_URL" -c "\dt"
```

**Option C: Using the provided script**
```bash
# Run the migration helper script
npm run db:migrate
# or
node scripts/migrate-db.js
```

### Step 2: Verify Database Schema

After migration, verify these tables exist:
- `users`
- `user_passwords`
- `password_resets`
- `email_verifications`
- `user_sessions`
- `products`
- `categories`
- `analytics`
- `affiliate_ids`

### Step 3: Verify Environment Variables

Ensure these are in your `.env` file:
```env
DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require
VITE_NEON_DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require
```

---

## 2. Cloudflare R2 Configuration ⏳

### Step 1: Set Environment Variables

Add these to your `.env` file:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
R2_BUCKET_NAME=your_bucket_name_here
R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com/your-bucket-name
# OR if you have a custom domain:
# R2_PUBLIC_URL=https://cdn.yourdomain.com
```

**Note:** If you don't have R2 access keys yet:
1. Go to Cloudflare Dashboard → R2 → Manage R2 API Tokens
2. Create API Token with Read & Write permissions
3. Copy Access Key ID and Secret Access Key

### Step 2: Configure Custom Domain (Optional but Recommended)

1. Go to Cloudflare Dashboard → R2 → Your Bucket → Settings
2. Under "Custom Domains", click "Connect Domain"
3. Enter your subdomain (e.g., `cdn.yourdomain.com`)
4. Cloudflare will automatically configure DNS records
5. Update `R2_PUBLIC_URL` in `.env` to use your custom domain

### Step 3: Test R2 Connection

Once environment variables are set, test the connection:
```bash
npm run test:r2
```

---

## 3. Email Service Configuration (Emailit) ⏳

### Step 1: Get Emailit Credentials

When you receive SMTP credentials from Emailit, they should include:
- SMTP Host
- SMTP Port
- SMTP Username (usually your API key)
- SMTP Password
- From Email address

### Step 2: Set Environment Variables

Add these to your `.env` file:

```env
# Emailit Configuration (SMTP)
EMAILIT_API_KEY=your_emailit_api_key_here
EMAILIT_FROM_EMAIL=notifications@yourdomain.com
EMAILIT_FROM_NAME=Your App Name
EMAILIT_SMTP_HOST=smtp.emailit.com
EMAILIT_SMTP_PORT=587
EMAILIT_SMTP_USER=your_smtp_username
EMAILIT_SMTP_PASSWORD=your_smtp_password

# Application URL for email links
VITE_PRODUCTION_URL=https://yourdomain.com
```

**Note:** The current EmailService.ts uses API-based sending. If Emailit only provides SMTP:
- You may need to update the EmailService to use SMTP
- Or check if Emailit has an API endpoint you can use

### Step 3: Configure DNS Records (Required for Email Deliverability)

Add these DNS records to your domain:

**SPF Record:**
```
Type: TXT
Name: @
Value: v=spf1 include:emailit.com ~all
```

**DKIM Record:**
```
Type: TXT
Name: emailit._domainkey
Value: [Provided by Emailit dashboard]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### Step 4: Test Email Sending

```bash
npm run test:email
```

---

## 4. Complete Environment Variables Checklist

Create/update your `.env` file with ALL of these variables:

```env
# ============================================
# DATABASE (NeonDB)
# ============================================
DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require
VITE_NEON_DATABASE_URL=postgresql://user:password@hostname.neon.tech/database?sslmode=require

# ============================================
# CLOUDFLARE R2 (Storage)
# ============================================
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com/your-bucket-name

# ============================================
# EMAIL SERVICE (Emailit)
# ============================================
EMAILIT_API_KEY=your_emailit_api_key
EMAILIT_FROM_EMAIL=notifications@yourdomain.com
EMAILIT_FROM_NAME=Your App Name
VITE_PRODUCTION_URL=https://yourdomain.com

# ============================================
# APPLICATION SETTINGS
# ============================================
VITE_APP_NAME=Your App Name
VITE_APP_URL=https://yourdomain.com
VITE_DOMAIN=yourdomain.com
VITE_ENV=production

# ============================================
# OPENAI (Optional - for AI features)
# ============================================
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# ============================================
# FEATURE FLAGS
# ============================================
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ADVANCED_FEATURES=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true

# ============================================
# SECURITY
# ============================================
# Generate with: openssl rand -base64 32
VITE_JWT_SECRET=your-secure-jwt-secret-here-minimum-32-characters
```

---

## 5. Pre-Deployment Testing

Before deploying to production, test locally:

### Test Database Connection
```bash
npm run test:db
```

### Test Email Service
```bash
npm run test:email
```

### Test R2 Storage
```bash
npm run test:r2
```

### Build for Production
```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` and test:
- [ ] User registration
- [ ] User login
- [ ] Password reset email
- [ ] Product creation
- [ ] Image upload (if implemented)

---

## 6. Deployment Platform Configuration

### If Deploying to Vercel:

1. **Set Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add ALL variables from your `.env` file
   - Make sure to set them for "Production" environment

2. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### If Deploying to Netlify:

1. **Set Environment Variables:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Add ALL variables from your `.env` file

2. **Create netlify.toml:**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

### If Deploying to Your Own Server:

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy `dist` folder to your server

3. Serve with nginx/apache

4. Set environment variables in your server environment

---

## 7. Post-Deployment Verification

After deployment, verify:

### Database
- [ ] Can create new users
- [ ] Can query products
- [ ] Analytics are being tracked

### Email Service
- [ ] Registration emails are sent
- [ ] Password reset emails are sent
- [ ] Emails are not going to spam
- [ ] Unsubscribe links work

### Storage (R2)
- [ ] Can upload images (if implemented)
- [ ] Images are accessible via public URL
- [ ] Images load correctly on the frontend

### Application
- [ ] Homepage loads correctly
- [ ] User can register
- [ ] User can login
- [ ] Products can be created
- [ ] Products display correctly
- [ ] Mobile responsive design works

---

## 8. What's Still Needed (Future)

### Payment Integration (Later)
- Payment gateway credentials (Stripe, PayPal, Razorpay, etc.)
- Webhook endpoints configuration
- Payment success/failure handling

### Monitoring (Recommended)
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (Vercel Analytics, Google Analytics)
- [ ] Database monitoring (Neon dashboard)

### Additional Features
- [ ] Image upload functionality (currently R2 is configured but upload UI may not be implemented)
- [ ] Custom domain setup for R2
- [ ] SSL certificate verification
- [ ] CDN configuration

---

## 9. Quick Reference Commands

```bash
# Run database migration
npm run db:migrate

# Test database connection
npm run test:db

# Test email service
npm run test:email

# Test R2 storage
npm run test:r2

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

---

## 10. Support & Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check SSL is enabled (`?sslmode=require`)
- Ensure IP is not blocked (Neon allows all by default)
- Test connection: `psql "YOUR_DATABASE_URL" -c "SELECT 1"`

### Email Not Sending
- Verify EMAILIT_API_KEY is correct
- Check DNS records (SPF, DKIM, DMARC) are configured
- Verify domain is verified in Emailit dashboard
- Check email service logs

### R2 Upload Issues
- Verify all R2 environment variables are set
- Check R2 bucket permissions
- Verify R2 API tokens are valid
- Check CORS settings if accessing from frontend

### Build Issues
- Clear cache: `rm -rf node_modules dist .vite`
- Reinstall: `npm install`
- Check Node.js version (requires 18+)
- Review build logs for specific errors

---

## Next Steps

1. ✅ Run database migration (Step 1)
2. ⏳ Configure R2 environment variables (Step 2)
3. ⏳ Configure Emailit environment variables (Step 3) - when credentials are provided
4. ⏳ Test all integrations locally
5. ⏳ Deploy to production
6. ⏳ Verify post-deployment checklist (Step 7)

**Estimated Time:** 2-4 hours (depending on DNS propagation for email)

---

**Last Updated:** {{ current_date }}
**Status:** Ready for deployment after completing pending items

