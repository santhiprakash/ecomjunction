# Neon DB Migration Summary

## Overview

eComJunction has been updated to use **Neon DB** (serverless PostgreSQL) instead of Supabase, with a **custom JWT-based authentication system**.

---

## Why Neon DB?

### Advantages Over Supabase

1. **Cost Effective**
   - Neon DB Pro: $19/month
   - Supabase Pro: $25/month
   - **Savings: $6/month (24% cheaper)**

2. **Serverless PostgreSQL**
   - Automatic scaling based on load
   - Auto-suspend after inactivity (cost optimization)
   - Pay only for what you use

3. **Database Branching**
   - Create instant database branches for development/staging
   - Test migrations safely before production
   - No need for separate database instances

4. **Better PostgreSQL Compatibility**
   - Pure PostgreSQL (no custom extensions)
   - Standard PostgreSQL tools work out of the box
   - Easier migration to other PostgreSQL providers if needed

5. **Connection Pooling**
   - Built-in PgBouncer support
   - Better performance for serverless applications
   - Handles connection limits automatically

6. **No Vendor Lock-in**
   - Standard PostgreSQL database
   - Custom authentication (not tied to Supabase Auth)
   - Easy to migrate if needed

---

## Architecture Changes

### Database Layer

**Before (Supabase):**
```
Application → Supabase Client → Supabase API → PostgreSQL
```

**After (Neon DB):**
```
Application → Neon Serverless Driver → PostgreSQL (Neon)
```

### Authentication Layer

**Before (Supabase):**
```
Application → Supabase Auth → Built-in Auth System
```

**After (Custom JWT):**
```
Application → Custom Auth Service → JWT Tokens → PostgreSQL (Neon)
```

---

## New Database Tables

### Authentication Tables

1. **user_passwords**
   - Stores bcrypt hashed passwords
   - Separated from users table for security
   - One-to-one relationship with users

2. **password_resets**
   - Tracks password reset tokens
   - Token expiration management
   - Prevents token reuse

3. **email_verifications**
   - Email verification tokens
   - Expiration tracking
   - Verification status

4. **user_sessions**
   - Active JWT sessions
   - Session expiration
   - IP address and user agent tracking
   - Last used timestamp

---

## Authentication Flow

### Registration
```
1. User submits email + password
2. Password hashed with bcrypt (10 rounds)
3. User record created in users table
4. Password hash stored in user_passwords table
5. Verification email sent with token
6. JWT token generated and returned
7. Session stored in user_sessions table
```

### Login
```
1. User submits email + password
2. User fetched from database
3. Password verified with bcrypt.compare()
4. JWT token generated (7-day expiration)
5. Session stored in user_sessions table
6. Token returned to client
```

### Token Verification
```
1. Client sends JWT token in Authorization header
2. Server verifies token signature
3. Check token expiration
4. Fetch user from database
5. Update session last_used_at
6. Return user data
```

### Password Reset
```
1. User requests password reset
2. Reset token generated (1-hour expiration)
3. Token stored in password_resets table
4. Reset email sent with token
5. User submits new password with token
6. Token verified and marked as used
7. Password hash updated
```

---

## Environment Variables

### Required Variables

```env
# Neon Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
DATABASE_POOLED_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true

# JWT Authentication
VITE_JWT_SECRET=your-secret-key-here

# API Keys
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Generating JWT Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

---

## Migration Steps

### 1. Set Up Neon DB (Week 1)

- [ ] Create Neon DB account at [neon.tech](https://neon.tech)
- [ ] Create production project
- [ ] Get connection strings (DATABASE_URL, DATABASE_POOLED_URL)
- [ ] Create staging branch for testing
- [ ] Run migration: `migrations/001_initial_schema_neon.sql`
- [ ] Verify tables created successfully

### 2. Implement JWT Authentication (Week 1)

- [ ] Install dependencies: `@neondatabase/serverless`, `jsonwebtoken`, `bcryptjs`
- [ ] Create `src/lib/neon.ts` (database client)
- [ ] Create `src/lib/auth.ts` (authentication service)
- [ ] Implement registration with password hashing
- [ ] Implement login with JWT generation
- [ ] Implement token verification
- [ ] Add session management
- [ ] Test authentication flows

### 3. Create API Layer (Week 1-2)

- [ ] Create API routes for authentication
- [ ] Add middleware for token verification
- [ ] Implement protected routes
- [ ] Add error handling
- [ ] Test API endpoints

### 4. Migrate Data (Week 2)

- [ ] Create migration script for localStorage → Neon DB
- [ ] Test with sample data
- [ ] Implement rollback mechanism
- [ ] Run production migration
- [ ] Verify data integrity

### 5. Update Application Code (Week 2)

- [ ] Update ProductContext to use Neon DB
- [ ] Replace localStorage calls with API calls
- [ ] Update AuthContext for JWT authentication
- [ ] Add loading states
- [ ] Add error handling
- [ ] Update tests

---

## Code Examples

### Database Client (`src/lib/neon.ts`)

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_POOLED_URL);

export const db = {
  query: async (text: string, params?: any[]) => {
    return await sql(text, params);
  },
  
  queryOne: async (text: string, params?: any[]) => {
    const result = await sql(text, params);
    return result[0] || null;
  }
};
```

### Authentication Service (`src/lib/auth.ts`)

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sql } from './neon';

export const auth = {
  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await sql`
      INSERT INTO users (email, email_verified)
      VALUES (${email}, false)
      RETURNING id, email
    `;
    
    const user = result[0];
    
    await sql`
      INSERT INTO user_passwords (user_id, password_hash)
      VALUES (${user.id}, ${hashedPassword})
    `;
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return { user, token };
  },
  
  async login(email: string, password: string) {
    const users = await sql`
      SELECT u.*, p.password_hash
      FROM users u
      JOIN user_passwords p ON u.id = p.user_id
      WHERE u.email = ${email}
    `;
    
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.VITE_JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return { user, token };
  }
};
```

---

## Testing Checklist

### Database Connection
- [ ] Test connection to Neon DB
- [ ] Verify all tables exist
- [ ] Test connection pooling
- [ ] Test auto-suspend and resume

### Authentication
- [ ] Test user registration
- [ ] Test password hashing
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test JWT token generation
- [ ] Test token verification
- [ ] Test token expiration
- [ ] Test session management

### Data Migration
- [ ] Test migration with sample data
- [ ] Verify data integrity
- [ ] Test rollback mechanism
- [ ] Test with large datasets

### API Layer
- [ ] Test all API endpoints
- [ ] Test authentication middleware
- [ ] Test error handling
- [ ] Test rate limiting

---

## Performance Considerations

### Connection Pooling
Always use the pooled connection URL for better performance:
```
DATABASE_POOLED_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
```

### Query Optimization
- Use indexes for frequently queried columns
- Avoid N+1 queries
- Use connection pooling
- Cache frequently accessed data

### Auto-Scaling
Neon automatically scales compute resources:
- Configure min/max vCPU in project settings
- Set auto-suspend delay (default: 5 minutes)
- Monitor usage in Neon dashboard

---

## Security Best Practices

### JWT Tokens
- Use strong secret (32+ characters)
- Set appropriate expiration (7 days recommended)
- Store securely on client (httpOnly cookies or secure storage)
- Implement token refresh mechanism

### Password Security
- Use bcrypt with 10+ rounds
- Enforce password strength requirements
- Implement rate limiting on login attempts
- Add account lockout after failed attempts

### Database Security
- Use connection pooling
- Enable SSL (sslmode=require)
- Use parameterized queries (prevent SQL injection)
- Implement proper error handling (don't expose DB errors)

---

## Monitoring and Maintenance

### Neon Dashboard
Monitor in the Neon dashboard:
- CPU and memory usage
- Active connections
- Query performance
- Storage usage

### Database Maintenance
- Regular backups (automatic in Neon)
- Monitor slow queries
- Optimize indexes
- Clean up expired tokens (run cleanup function)

### Token Cleanup
Run periodically to clean up expired tokens:
```sql
SELECT cleanup_expired_tokens();
```

---

## Cost Comparison

### Monthly Costs

| Service | Supabase | Neon DB | Savings |
|---------|----------|---------|---------|
| Database | $25 | $19 | $6 (24%) |
| Features | Auth included | Custom auth | More control |
| Scaling | Manual | Automatic | Better |
| Branching | Limited | Unlimited | Better |

### Total Infrastructure

| Item | Cost |
|------|------|
| Neon DB Pro | $19 |
| Vercel Pro | $20 |
| Cloudinary | $89 |
| Email Service | $15-50 |
| Monitoring | $26 |
| Domain/SSL | $15 |
| **Total** | **$184-234/month** |

---

## Troubleshooting

### Connection Issues
```
Error: Connection timeout
```
**Solution:** Check DATABASE_URL is correct and includes `sslmode=require`

### Authentication Errors
```
Error: Invalid token
```
**Solution:** Verify JWT_SECRET is set correctly and token hasn't expired

### Migration Failures
```
Error: Table already exists
```
**Solution:** Drop existing tables or use a fresh database

---

## Resources

- [Neon DB Documentation](https://neon.tech/docs)
- [Neon Serverless Driver](https://github.com/neondatabase/serverless)
- [JWT Best Practices](https://jwt.io/introduction)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support

For issues or questions:
1. Check the [Neon Setup Guide](./docs/neon-setup.md)
2. Review the [Neon DB Documentation](https://neon.tech/docs)
3. Create an issue in the repository
4. Contact the development team

---

**Migration Status:** Ready to begin  
**Estimated Time:** 2 weeks (Week 1-2 of development plan)  
**Risk Level:** Medium (custom authentication adds complexity)  
**Confidence:** High (well-documented, proven technologies)

---

*Last Updated: December 30, 2024*
