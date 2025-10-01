# Development Guide - Safpar Tours

## 🚀 Starting the Development Server

### **Recommended Method: Auto Port Cleanup**

Use this command to automatically clear port 3000 and start the dev server:

```bash
npm run dev:clean
```

This will:
- ✅ Check for processes on port 3000
- 🔪 Kill any existing processes gracefully
- 💀 Force kill stubborn processes if needed  
- 🌟 Start the Next.js development server
- 📱 Display Auth0 and admin URLs
- 🛑 Clean up properly when you stop (Ctrl+C)

### **Alternative Methods**

#### Option 1: Bash Script (Linux/macOS)
```bash
npm run dev:force
# OR directly:
./scripts/dev-clean.sh
```

#### Option 2: Quick Port Kill + Manual Start
```bash
npm run kill:3000
npm run dev
```

#### Option 3: Manual Port Cleanup
```bash
./scripts/kill-port-3000.sh
npm run dev
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Standard Next.js dev server (may fail if port busy) |
| `npm run dev:clean` | **Recommended**: Auto-cleanup + start dev server |
| `npm run dev:force` | Bash version of auto-cleanup + start |
| `npm run kill:3000` | Just kill processes on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |

## 🎯 Development URLs

After starting with `npm run dev:clean`, you'll see:

- **Main App**: http://localhost:3000
- **Auth0 Login**: Click "Sign In" button in header
- **Admin Dashboard**: http://localhost:3000/admin/dashboard
- **API Health Check**: http://localhost:3000/api/db/init

## 🔐 Auth0 Development Setup

### First Time Setup:

1. **Add your Auth0 credentials to `.env.local`:**
   ```bash
   AUTH0_ISSUER=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   ```

2. **Configure Auth0 Dashboard URLs:**
   ```
   Callback URLs: http://localhost:3000/api/auth/callback/auth0
   Logout URLs: http://localhost:3000  
   Allowed Web Origins: http://localhost:3000
   ```

3. **Start development server:**
   ```bash
   npm run dev:clean
   ```

## 🐛 Troubleshooting

### **Port 3000 is Busy**
If you get "EADDRINUSE" error:
```bash
npm run kill:3000
npm run dev:clean
```

### **Auth0 Not Working**
1. Check your `.env.local` has correct Auth0 credentials
2. Verify Auth0 dashboard URLs are configured
3. Clear browser cache and cookies
4. Restart dev server: `npm run dev:clean`

### **Database Connection Issues**
1. Check RDS instance is running
2. Verify security group allows your IP
3. Test API: http://localhost:3000/api/db/init

### **Permission Errors**
Make scripts executable:
```bash
chmod +x scripts/*.sh
chmod +x scripts/*.js
```

## 🏗️ Project Structure

```
safpar-tours/
├── scripts/
│   ├── dev-clean.js       # Node.js auto-cleanup script  
│   ├── dev-clean.sh       # Bash auto-cleanup script
│   └── kill-port-3000.sh  # Quick port killer
├── src/
│   ├── components/auth/   # Authentication components
│   ├── pages/api/auth/    # NextAuth.js endpoints
│   └── pages/admin/       # Protected admin pages
├── docs/
│   ├── AUTH0_SETUP_GUIDE.md
│   └── RDS_SETUP_VERIFICATION.md
└── .env.local            # Environment variables
```

## 📋 Development Checklist

Before starting development:

- [ ] Auth0 credentials added to `.env.local`
- [ ] RDS database running and accessible
- [ ] Port 3000 is free (or use `npm run dev:clean`)
- [ ] All dependencies installed (`npm install`)

## 🚀 Ready to Code!

Use `npm run dev:clean` and you're ready to develop with:
- ✅ Clean port 3000 every time
- ✅ Auth0 authentication working  
- ✅ Database connectivity
- ✅ Admin dashboard access
- ✅ Automatic cleanup on exit

Happy coding! 🎉