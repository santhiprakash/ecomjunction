# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Choose a strong database password and save it securely
4. Wait for the project to be ready (usually takes 2-3 minutes)

## 2. Get Project Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL (e.g., https://your-project-ref.supabase.co)
   - Anon public key (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
   - Project Reference ID (found in the URL or Settings > General)

## 3. Environment Variables

Update your `.env.local` file with your actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace the placeholder values with your actual Supabase credentials.

## 4. Run Database Migration

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Run the migration:
```bash
supabase db push
```

## 5. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure the following:
   - Site URL: `http://localhost:5173` (for development with Vite)
   - Redirect URLs: Add `http://localhost:5173/**` for development
   - Enable email confirmations (recommended for production)
   - Configure email templates as needed

### Email Authentication Setup
1. In Authentication > Settings > Auth Providers
2. Ensure Email provider is enabled
3. Configure email templates in Authentication > Templates:
   - Confirm signup
   - Invite user
   - Magic link
   - Change email address
   - Reset password

### Additional Security Settings
1. Enable "Enable email confirmations" for production
2. Set "Minimum password length" to 8 characters
3. Consider enabling "Enable phone confirmations" if needed

## 6. Row Level Security

The migration automatically sets up Row Level Security (RLS) policies to ensure:
- Users can only access their own data
- Proper data isolation between users
- Secure API access

## 7. Test the Setup

1. Start your development server: `npm run dev`
2. Try registering a new account
3. Check the Supabase dashboard to see the user created
4. Test login/logout functionality

## Troubleshooting

### Common Issues

1. **Environment variables not loaded**: Make sure `.env.local` is in the root directory
2. **Migration fails**: Check your Supabase CLI is logged in and project is linked
3. **Auth not working**: Verify your Site URL in Supabase auth settings
4. **RLS blocking queries**: Check the RLS policies are correctly applied

### Support

- Supabase Documentation: https://supabase.com/docs
- Project Issues: Create an issue in the repository