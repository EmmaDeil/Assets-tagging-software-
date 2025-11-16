# Authentication System Setup

## ✅ Completed Implementation

A complete JWT-based authentication system has been integrated into your Asset Management application.

## 🎯 Features

### Backend (Node.js/Express/MongoDB)
- ✅ **User Model** with password hashing (bcryptjs)
- ✅ **JWT Authentication** with token generation and verification
- ✅ **Authentication Routes**:
  - `POST /api/auth/register` - Create new user account
  - `POST /api/auth/login` - Login and get JWT token
  - `GET /api/auth/me` - Get current user data (protected)
  - `POST /api/auth/logout` - Logout user
  - `PUT /api/auth/update-password` - Change password (protected)
  - `POST /api/auth/forgot-password` - Request password reset
  - `PUT /api/auth/reset-password/:token` - Reset password with token
- ✅ **Middleware Protection** - `protect` and `authorize` middleware for securing routes
- ✅ **Role-Based Access Control** - Administrator, Manager, User roles
- ✅ **Permission System** - Granular permissions for different actions

### Frontend (React)
- ✅ **Login Page** - Beautiful responsive login form with your design
- ✅ **Signup Page** - User registration with validation
- ✅ **AuthContext** - Global authentication state management
- ✅ **ProtectedRoute** - Automatic redirect to login for unauthenticated users
- ✅ **Route Guards** - Role and permission-based access control
- ✅ **Auto-persist** - JWT token stored in localStorage

## 📦 Installed Dependencies

### Backend
```bash
npm install bcryptjs jsonwebtoken
```

### Frontend
```bash
npm install react-router-dom
```

## 🚀 How to Use

### 1. Start the Backend Server
```bash
cd server
node server.js
```
Server will run on `http://localhost:5000`

### 2. Start the Frontend
```bash
npm run dev
```
App will run on `http://localhost:5173`

### 3. Test the Authentication

#### Register a New User
1. Navigate to `http://localhost:5173/signup`
2. Fill in:
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Department: "IT" (optional)
   - Password: minimum 6 characters
3. Click "Sign Up"
4. You'll be automatically logged in and redirected to the dashboard

#### Login with Existing User
1. Navigate to `http://localhost:5173/login`
2. Enter email and password
3. Click "Log In"
4. Redirected to dashboard upon success

#### Test Protected Routes
- Try accessing `http://localhost:5173` without logging in
- You'll be redirected to `/login`
- After login, you can access all protected pages

### 4. Create Your First Admin User

**Option 1: Using the API directly**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@assetflow.com",
    "password": "admin123",
    "role": "Administrator"
  }'
```

**Option 2: Modify signup form temporarily**
In `Signup.jsx`, you can temporarily change line 12 to:
```javascript
role: 'Administrator', // Change from 'User' to 'Administrator'
```

## 🔒 Security Features

1. **Password Hashing** - Passwords hashed with bcrypt (10 salt rounds)
2. **JWT Tokens** - Secure token-based authentication
3. **Token Expiration** - Tokens expire after 7 days (configurable)
4. **Password Reset** - Secure token-based password reset flow
5. **Protected Routes** - Backend routes protected with middleware
6. **Role Validation** - Server-side role and permission checking
7. **Active User Check** - Inactive users cannot login

## 🎨 Customization

### Change Token Expiration
Edit `server/.env`:
```env
JWT_EXPIRE=30d  # Change to 30 days
```

### Change JWT Secret (IMPORTANT for production)
Edit `server/.env`:
```env
JWT_SECRET=your-very-secure-random-secret-key-here
```
**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Customize User Roles
Edit `server/models/User.js`, line 31:
```javascript
enum: ['Administrator', 'Manager', 'User', 'YourCustomRole'],
```

### Modify Login/Signup Styling
- Edit `src/components/Login.jsx` for login page styling
- Edit `src/components/Signup.jsx` for signup page styling
- All styles use Tailwind CSS classes

## 📝 API Endpoints

### Public Endpoints (No authentication required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Protected Endpoints (Requires JWT token)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/update-password` - Update password

### Using Protected Endpoints
Include JWT token in Authorization header:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 🔧 Protecting Your Existing Routes

### Backend (Example: Protect equipment routes)
Edit `server/routes/equipment.js`:
```javascript
const { protect, authorize, checkPermission } = require('../middleware/auth');

// Protect all routes (require authentication)
router.use(protect);

// Specific route with role check
router.delete('/:id', authorize('Administrator', 'Manager'), async (req, res) => {
  // Only Administrators and Managers can delete
});

// Specific route with permission check
router.post('/', checkPermission('createAssets'), async (req, res) => {
  // Only users with 'createAssets' permission can create
});
```

### Frontend (Example: Protect a component)
```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/settings" 
  element={
    <ProtectedRoute requiredRole="Administrator">
      <Settings />
    </ProtectedRoute>
  } 
/>
```

## 🐛 Troubleshooting

### "User not found" error
- Make sure MongoDB is connected
- Check `server/.env` has correct `MONGODB_URI`

### "Invalid or expired token"
- Token might have expired (default 7 days)
- Clear browser localStorage and login again
- Check JWT_SECRET matches between token creation and verification

### Cannot access protected routes
- Verify token is being sent in Authorization header
- Check `AuthContext.jsx` is correctly setting axios defaults
- Inspect Network tab to see if Authorization header is present

### Redirect loop between login and dashboard
- Check `ProtectedRoute.jsx` loading state
- Verify `/api/auth/me` endpoint is working
- Clear browser cache and localStorage

## 📚 Next Steps

1. **Add Password Strength Validation** - Implement stronger password requirements
2. **Email Verification** - Add email verification on signup
3. **Two-Factor Authentication** - Implement 2FA for additional security
4. **Session Management** - Track active sessions and allow logout from all devices
5. **Audit Logging** - Log all authentication events
6. **Rate Limiting** - Add rate limiting to prevent brute force attacks

## 🎉 Testing Checklist

- [ ] Register a new user
- [ ] Login with registered user
- [ ] Access protected dashboard
- [ ] Logout and verify redirect to login
- [ ] Try accessing dashboard without login (should redirect)
- [ ] Test "Forgot Password" flow (generate token)
- [ ] Test password reset with token
- [ ] Change password from user profile
- [ ] Verify token persistence after browser refresh
- [ ] Test with different user roles (User, Manager, Administrator)

## 📞 Support

If you encounter any issues:
1. Check server console for error messages
2. Check browser console for frontend errors
3. Verify all dependencies are installed (`npm install`)
4. Ensure MongoDB connection is working
5. Check that ports 5000 (backend) and 5173 (frontend) are available

---

**Created:** November 16, 2025  
**Status:** ✅ Complete and Ready for Testing
