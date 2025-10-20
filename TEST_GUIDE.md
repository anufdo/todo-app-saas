# Quick Test Guide

## Server Running
Your development server is running at: http://localhost:3000

## Test Cases

### 1. Test Admin User Login & Admin Panel

1. **Navigate to:** http://localhost:3000/auth/signin
2. **Sign in with admin credentials:**
   - Email: `admin@example.com`
   - Password: `admin123!`
3. **Expected Result:**
   - Should redirect to: http://localhost:3000/app/tasks?tenant=demo
   - You should see the 🛡️ Admin link in the top navigation
4. **Click the Admin link**
   - Should navigate to: http://localhost:3000/admin
   - You should see the tenant management interface
   - You should see the "Demo Workspace" tenant with statistics
5. **Test Admin Features:**
   - Try changing the plan (dropdown)
   - Try changing the status (dropdown)
   - Changes should persist and refresh the page

### 2. Test Regular User (No Admin Access)

1. **Sign out** (if logged in)
2. **Navigate to:** http://localhost:3000/auth/signin
3. **Sign in with regular user credentials:**
   - Email: `demo@example.com`
   - Password: `password123`
4. **Expected Result:**
   - Should redirect to: http://localhost:3000/app/tasks?tenant=demo
   - You should NOT see the 🛡️ Admin link
5. **Try accessing admin panel directly:**
   - Navigate to: http://localhost:3000/admin
   - Should redirect back to /app/tasks (access denied)

### 3. Test Onboarding (No Repeated Onboarding Issue)

#### For Existing User:
1. **Sign out**
2. **Sign in again as demo@example.com**
3. **Expected:** Should go directly to tasks page, NOT onboarding

#### For New User:
1. **Navigate to:** http://localhost:3000/auth/signup
2. **Create a new account:**
   - Name: Test User
   - Email: test@example.com
   - Password: test123
3. **After signup, sign in with those credentials**
4. **Expected:**
   - Should redirect to onboarding page
   - Create a new workspace (e.g., "test-workspace")
   - After creating workspace, should redirect to tasks
5. **Sign out and sign in again**
6. **Expected:**
   - Should go directly to YOUR workspace, NOT onboarding

### 4. Test Task Creation with Admin

1. **Sign in as admin**
2. **Go to tasks page**
3. **Create a new task**
4. **Expected:**
   - Should work normally
   - Should see your task in the list

## What Was Fixed

### ✅ Admin Role Recognition
- Admin users now have their role properly stored in session
- Admin link only shows for admin/owner users
- Admin panel is protected and only accessible to admin/owner

### ✅ No More Repeated Onboarding
- Sign-in logic now checks if user has a tenant
- If tenant exists → redirect to workspace
- If no tenant → redirect to onboarding
- Onboarding only shows once when creating workspace

### ✅ Admin Panel Created
- Full tenant management interface at /admin
- View all tenants with statistics
- Change plans (Free, Premium, Premium Plus)
- Change status (Active, Suspended, Deleted)
- Delete tenants (owner only)

## URLs to Test

- Home: http://localhost:3000
- Sign In: http://localhost:3000/auth/signin
- Sign Up: http://localhost:3000/auth/signup
- Onboarding: http://localhost:3000/onboarding
- Tasks: http://localhost:3000/app/tasks?tenant=demo
- Settings: http://localhost:3000/app/settings?tenant=demo
- Admin Panel: http://localhost:3000/admin

## Test Credentials

### Admin User
- Email: admin@example.com
- Password: admin123!
- Role: admin
- Access: Full admin panel access

### Regular User
- Email: demo@example.com
- Password: password123
- Role: owner (of demo tenant)
- Access: No admin panel access (even though owner, only admin role gets access)

Note: To give demo user admin access, you would need to update their membership role in the database to 'admin'.

## Verification Checklist

- [ ] Admin can sign in and see admin link
- [ ] Admin can access /admin panel
- [ ] Admin can view tenant statistics
- [ ] Admin can change tenant plans
- [ ] Admin can change tenant status
- [ ] Regular user cannot see admin link
- [ ] Regular user is redirected away from /admin
- [ ] Existing users skip onboarding on login
- [ ] New users see onboarding after first login
- [ ] After creating workspace, subsequent logins skip onboarding
- [ ] All pages load without errors
- [ ] Build completes successfully (npm run build)

All checks should pass! ✅
