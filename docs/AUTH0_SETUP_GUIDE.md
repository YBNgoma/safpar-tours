# Auth0 Setup Guide for Safpar Tours

## 🔐 Complete Authentication Setup with NextAuth.js and Auth0

### Step 1: Get Your Auth0 Credentials

From your Auth0 Dashboard (where you currently are):

1. **Domain**: Look at the top of your dashboard - it should show something like:
   - `dev-abc123.us.auth0.com` 
   - `safpar-tours.auth0.com`
   - Copy this entire domain

2. **Client ID**: In the Application settings, you'll see a field called "Client ID"
   - This is a long alphanumeric string
   - Copy this value

3. **Client Secret**: In the same settings area, you'll see "Client Secret"
   - Click "Show" to reveal the secret
   - Copy this value (keep it secure!)

### Step 2: Configure Auth0 Application Settings

In your Auth0 dashboard, fill in these URLs:

**Callback URLs:**
```
http://localhost:3000/api/auth/callback/auth0
```

**Logout URLs:**
```
http://localhost:3000
```

**Allowed Web Origins:**
```
http://localhost:3000
```

**For Production (when you deploy to Amplify):**
Add these additional URLs:
```
# Callback URLs (add to existing)
https://your-amplify-domain.amplifyapp.com/api/auth/callback/auth0

# Logout URLs (add to existing)
https://your-amplify-domain.amplifyapp.com

# Allowed Web Origins (add to existing)  
https://your-amplify-domain.amplifyapp.com
```

Click **"Save"** after entering these values.

### Step 3: Update Your Environment Variables

Open your `.env.local` file and replace the placeholder values:

```bash
# Replace these with your actual Auth0 values:
AUTH0_ISSUER=https://YOUR_AUTH0_DOMAIN
AUTH0_CLIENT_ID=YOUR_CLIENT_ID  
AUTH0_CLIENT_SECRET=YOUR_CLIENT_SECRET
```

**Example:**
```bash
AUTH0_ISSUER=https://dev-abc123.us.auth0.com
AUTH0_CLIENT_ID=abcdefghijklmnopqrstuvwxyz123456
AUTH0_CLIENT_SECRET=your-very-long-secret-string-here
```

### Step 4: Test the Authentication

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Visit your homepage:**
   ```bash
   http://localhost:3000
   ```

3. **Test the login:**
   - Click the "Sign In" button in the header
   - You should be redirected to Auth0's login page
   - Create a new account or sign in
   - You should be redirected back to your site, now logged in

### Step 5: Test Admin Access

1. **Visit the admin dashboard:**
   ```bash
   http://localhost:3000/admin/dashboard
   ```

2. **Admin Access Control:**
   - By default, any logged-in user can access the admin
   - To restrict admin access, modify the logic in `src/components/auth/ProtectedRoute.tsx`
   - Currently it checks if email contains "admin" or equals "admin@safpar.com"

### Step 6: Customization Options

#### A. Customize User Access Control

Edit `src/components/auth/ProtectedRoute.tsx` to change admin logic:

```typescript
// Example: Check for specific email addresses
const adminEmails = [
  'admin@safpar.com', 
  'manager@safpar.com',
  'owner@safpar.com'
];
const isAdmin = adminEmails.includes(userEmail || '');

// Example: Check Auth0 user metadata (requires Auth0 setup)
const isAdmin = session.user?.role === 'admin';
```

#### B. Add User Roles in Auth0

1. Go to Auth0 Dashboard > User Management > Roles
2. Create roles like "admin", "manager", "customer" 
3. Assign roles to users
4. Update your NextAuth callback to include roles

#### C. Style the Auth Components

The auth components use Tailwind CSS and can be customized:
- `src/components/auth/LoginButton.tsx` - Login/logout button
- `src/components/auth/ProtectedRoute.tsx` - Protected route wrapper

### Step 7: Production Deployment

When deploying to AWS Amplify:

1. **Add Environment Variables in Amplify Console:**
   ```
   AUTH0_ISSUER=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   NEXTAUTH_URL=https://your-amplify-domain.amplifyapp.com
   NEXTAUTH_SECRET=your-production-secret-here
   ```

2. **Generate Production Secret:**
   ```bash
   openssl rand -base64 32
   ```

3. **Update Auth0 URLs:**
   - Add production URLs to Callback URLs, Logout URLs, and Web Origins
   - Replace `localhost:3000` with your Amplify domain

## 🎯 Features Included

### ✅ Authentication System
- **NextAuth.js Integration**: Secure authentication with JWT
- **Auth0 Provider**: Social login and user management  
- **Session Management**: Automatic session refresh
- **Secure Callbacks**: Protected redirect handling

### ✅ UI Components  
- **Login/Logout Button**: Responsive design with user info
- **Protected Routes**: Admin-only page protection
- **Loading States**: Smooth user experience
- **Error Handling**: Auth error management

### ✅ Admin Features
- **Admin Dashboard**: Management interface
- **Role-based Access**: Configurable user permissions
- **User Info Display**: Profile information in header

## 🚀 Ready to Use!

Your authentication system is now ready. Here's what you can do:

1. **Sign up/Sign in** - Users can authenticate via Auth0
2. **Access Admin Panel** - Protected admin dashboard at `/admin/dashboard`  
3. **API Protection** - Secure your booking API endpoints
4. **User Management** - Leverage Auth0's user management tools

The system is production-ready and can be deployed to AWS Amplify immediately after updating your Auth0 credentials!