# Auth0 Integration Guide

## Overview

Integrating Auth0 for authentication instead of custom JWT implementation provides enterprise-grade security, social logins, and easier maintenance.

---

## Why Auth0?

### Advantages Over Custom JWT

1. **Enterprise Security**
   - Industry-standard authentication
   - Regular security updates
   - Compliance certifications (SOC 2, GDPR, etc.)

2. **Social Logins**
   - Google, Facebook, Twitter, GitHub
   - No need to implement OAuth flows
   - Pre-built UI components

3. **Advanced Features**
   - Multi-factor authentication (MFA)
   - Passwordless login
   - Anomaly detection
   - Breached password detection

4. **Easier Maintenance**
   - No custom auth code to maintain
   - Automatic security patches
   - Built-in session management

5. **Better UX**
   - Universal Login page
   - Customizable branding
   - Smooth user experience

### Cost Comparison

| Plan | Price | MAU | Features |
|------|-------|-----|----------|
| Free | $0 | 7,500 | Basic auth, 2 social connections |
| Essentials | $35/mo | 500 | Unlimited social, MFA, custom domains |
| Professional | $240/mo | 500 | Advanced features, SLA |

**Recommendation:** Start with Free tier, upgrade to Essentials when needed

---

## Architecture Change

### Before (Custom JWT)
```
User → App → Custom Auth Service → Neon DB
```

### After (Auth0)
```
User → App → Auth0 → Neon DB (user sync)
```

---

## Implementation Plan

### 1. Auth0 Setup

```bash
# Create Auth0 account at auth0.com
# Create new application (Single Page Application)
# Note down:
# - Domain: your-tenant.auth0.com
# - Client ID
# - Client Secret (for backend)
```

### 2. Install Dependencies

```bash
npm install @auth0/auth0-react
npm install @auth0/auth0-spa-js
```

### 3. Environment Configuration

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://api.ecomjunction.com
VITE_AUTH0_REDIRECT_URI=http://localhost:8080/callback

# Backend
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_AUDIENCE=https://api.ecomjunction.com
```

### 4. Auth0 Provider Setup

```typescript
// src/main.tsx
import { Auth0Provider } from '@auth0/auth0-react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin + '/callback',
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
```

### 5. Auth Context Update

```typescript
// src/contexts/AuthContext.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [user, setUser] = useState<User | null>(null);

  // Sync Auth0 user with Neon DB
  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      syncUserWithDatabase(auth0User);
    }
  }, [auth0IsAuthenticated, auth0User]);

  const syncUserWithDatabase = async (auth0User: any) => {
    try {
      const token = await getAccessTokenSilently();
      
      // Check if user exists in our database
      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth0_id: auth0User.sub,
          email: auth0User.email,
          name: auth0User.name,
          avatar_url: auth0User.picture,
        }),
      });

      const dbUser = await response.json();
      setUser(dbUser);
    } catch (error) {
      console.error('Failed to sync user:', error);
    }
  };

  const login = () => {
    loginWithRedirect();
  };

  const logout = () => {
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    setUser(null);
  };

  const getAccessToken = async () => {
    return await getAccessTokenSilently();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: auth0IsAuthenticated,
        isLoading: auth0IsLoading,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Database Schema Updates

```sql
-- Add Auth0 ID to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth0_id VARCHAR(255) UNIQUE;
CREATE INDEX idx_users_auth0_id ON users(auth0_id);

-- Remove custom auth tables (no longer needed)
-- Keep for migration, then drop:
-- DROP TABLE user_passwords;
-- DROP TABLE password_resets;
-- DROP TABLE email_verifications;
-- DROP TABLE user_sessions;
```

---

## Backend API Integration

### User Sync Endpoint

```typescript
// api/users/sync.ts
import { auth } from 'express-oauth2-jwt-bearer';

// Middleware to verify Auth0 token
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
});

export async function syncUser(req: Request) {
  // Token already verified by middleware
  const { auth0_id, email, name, avatar_url } = req.body;

  // Check if user exists
  let user = await db.queryOne(
    'SELECT * FROM users WHERE auth0_id = $1',
    [auth0_id]
  );

  if (!user) {
    // Create new user
    user = await db.queryOne(`
      INSERT INTO users (auth0_id, email, username, avatar_url, email_verified)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `, [auth0_id, email, name, avatar_url]);
  } else {
    // Update existing user
    user = await db.queryOne(`
      UPDATE users
      SET email = $2, username = $3, avatar_url = $4, updated_at = NOW()
      WHERE auth0_id = $1
      RETURNING *
    `, [auth0_id, email, name, avatar_url]);
  }

  return user;
}
```

### Protected Routes

```typescript
// Middleware for protected routes
export const requireAuth = checkJwt;

// Example protected route
app.get('/api/products', requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  
  // Get user from database
  const user = await db.queryOne(
    'SELECT id FROM users WHERE auth0_id = $1',
    [auth0Id]
  );

  // Get user's products
  const products = await db.query(
    'SELECT * FROM products WHERE user_id = $1',
    [user.id]
  );

  res.json(products);
});
```

---

## Social Login Configuration

### 1. Enable Social Connections in Auth0

```
Auth0 Dashboard → Authentication → Social
- Enable Google
- Enable Facebook
- Enable Twitter
- Enable GitHub
```

### 2. Configure Callback URLs

```
Auth0 Dashboard → Applications → Settings
Allowed Callback URLs:
  http://localhost:8080/callback
  https://ecomjunction.com/callback

Allowed Logout URLs:
  http://localhost:8080
  https://ecomjunction.com

Allowed Web Origins:
  http://localhost:8080
  https://ecomjunction.com
```

---

## Login Component

```typescript
// src/components/auth/LoginButton.tsx
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function LoginButton() {
  const { login, logout, isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <img
          src={user?.avatar_url}
          alt={user?.name}
          className="w-8 h-8 rounded-full"
        />
        <span>{user?.name}</span>
        <Button onClick={logout}>Logout</Button>
      </div>
    );
  }

  return <Button onClick={login}>Login</Button>;
}
```

---

## Callback Page

```typescript
// src/pages/Callback.tsx
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function CallbackPage() {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isLoading, isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2>Logging you in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  );
}
```

---

## Custom Branding

### Universal Login Page

```
Auth0 Dashboard → Branding → Universal Login
- Upload logo
- Set primary color
- Customize background
- Add custom CSS
```

### Email Templates

```
Auth0 Dashboard → Branding → Email Templates
- Welcome email
- Verification email
- Password reset email
- Blocked account email
```

---

## Advanced Features

### Multi-Factor Authentication

```typescript
// Enable MFA in Auth0 Dashboard
// Auth0 Dashboard → Security → Multi-factor Auth
// Enable: SMS, Email, or Authenticator App

// Force MFA for specific users
await managementClient.users.update(
  { id: userId },
  { user_metadata: { mfa_required: true } }
);
```

### Passwordless Login

```typescript
// Enable in Auth0 Dashboard
// Auth0 Dashboard → Authentication → Passwordless
// Enable: Email or SMS

// Use in app
loginWithRedirect({
  authorizationParams: {
    connection: 'email', // or 'sms'
  },
});
```

### Custom Claims

```typescript
// Add custom claims in Auth0 Action
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://ecomjunction.com';
  
  // Add subscription plan to token
  api.idToken.setCustomClaim(`${namespace}/plan`, event.user.user_metadata.plan);
  api.accessToken.setCustomClaim(`${namespace}/plan`, event.user.user_metadata.plan);
};
```

---

## Migration from Custom JWT

### 1. Keep Both Systems Temporarily

```typescript
// Support both Auth0 and custom JWT during migration
const token = req.headers.authorization?.split(' ')[1];

let user;
try {
  // Try Auth0 first
  user = await verifyAuth0Token(token);
} catch {
  // Fallback to custom JWT
  user = await verifyCustomJWT(token);
}
```

### 2. Migrate Users

```typescript
// Script to migrate users to Auth0
async function migrateUsersToAuth0() {
  const users = await db.query('SELECT * FROM users WHERE auth0_id IS NULL');
  
  for (const user of users) {
    try {
      // Create user in Auth0
      const auth0User = await managementClient.users.create({
        email: user.email,
        password: generateTemporaryPassword(),
        email_verified: user.email_verified,
        user_metadata: {
          migrated: true,
          original_id: user.id,
        },
      });
      
      // Update database
      await db.query(
        'UPDATE users SET auth0_id = $1 WHERE id = $2',
        [auth0User.user_id, user.id]
      );
      
      // Send password reset email
      await managementClient.tickets.changePassword({
        user_id: auth0User.user_id,
        result_url: 'https://ecomjunction.com/password-changed',
      });
      
      console.log(`Migrated user ${user.email}`);
    } catch (error) {
      console.error(`Failed to migrate ${user.email}:`, error);
    }
  }
}
```

### 3. Remove Custom Auth Code

After migration is complete:
- Remove custom JWT implementation
- Drop auth-related tables
- Remove password hashing code
- Update documentation

---

## Testing

```typescript
// tests/auth.test.ts
import { render, screen } from '@testing-library/react';
import { Auth0Provider } from '@auth0/auth0-react';

describe('Auth0 Integration', () => {
  it('should redirect to login', async () => {
    const { getByText } = render(
      <Auth0Provider
        domain="test.auth0.com"
        clientId="test-client-id"
      >
        <LoginButton />
      </Auth0Provider>
    );
    
    const loginButton = getByText('Login');
    expect(loginButton).toBeInTheDocument();
  });
});
```

---

## Security Best Practices

### 1. Token Validation

```typescript
// Always validate tokens on backend
import { auth } from 'express-oauth2-jwt-bearer';

const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});
```

### 2. Secure Token Storage

```typescript
// Use secure storage
<Auth0Provider
  cacheLocation="localstorage" // or "memory" for more security
  useRefreshTokens={true}
  useRefreshTokensFallback={true}
>
```

### 3. CORS Configuration

```typescript
// Configure CORS properly
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
```

---

## Monitoring

### Auth0 Dashboard

Monitor in Auth0 Dashboard:
- Login attempts
- Failed logins
- Active users
- Token usage
- Anomaly detection alerts

### Custom Logging

```typescript
// Log authentication events
async function logAuthEvent(event: string, userId: string) {
  await db.query(`
    INSERT INTO auth_logs (event, user_id, timestamp)
    VALUES ($1, $2, NOW())
  `, [event, userId]);
}
```

---

## Cost Optimization

### Free Tier Limits
- 7,500 MAU (Monthly Active Users)
- 2 social connections
- Unlimited logins

### Tips to Stay in Free Tier
- Clean up inactive users
- Use social logins (count as 1 connection)
- Monitor MAU in dashboard

---

## Deployment Checklist

- [ ] Create Auth0 account
- [ ] Create application
- [ ] Configure callback URLs
- [ ] Enable social connections
- [ ] Set up custom domain (optional)
- [ ] Configure branding
- [ ] Install dependencies
- [ ] Update environment variables
- [ ] Implement Auth0Provider
- [ ] Update AuthContext
- [ ] Create user sync endpoint
- [ ] Update protected routes
- [ ] Test login flow
- [ ] Test social logins
- [ ] Migrate existing users
- [ ] Remove custom auth code

---

**Status:** Ready to implement  
**Estimated Time:** 1 week  
**Cost:** Free for up to 7,500 MAU  
**Benefits:** Enterprise security, social logins, easier maintenance
