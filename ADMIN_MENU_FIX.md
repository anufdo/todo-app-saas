# Admin Menu Visibility Fix

## The Issue
Admin users are not seeing the "Admin Panel" and "All Users" menu items in the navigation.

## The Solution

### Changes Made:

1. **Enhanced Admin Links in App Layout** (`src/app/app/layout.tsx`)
   - Made the "Admin Panel" link more prominent with purple background
   - Added direct "All Users" link for quick access
   - Improved role badge styling (purple for admin, blue for owner)

2. **Created Debug Page** (`src/app/debug-session/page.tsx`)
   - Visit `/debug-session` to check your current session data
   - Helps verify if your role is properly set

### Why You Might Not See the Admin Menu:

The admin menu links are controlled by this condition:
```tsx
const isAdmin = session?.user?.role === "admin";
```

**Most Common Reason:** You need to **sign out and sign back in** for the session to refresh with the correct role.

### Steps to Fix:

1. **Sign Out**: Click "Sign Out" in the top right corner

2. **Sign In as Admin**:
   - Email: `admin@example.com`
   - Password: `admin123!`

3. **Verify Session**: Visit `http://localhost:3000/debug-session` (or your-subdomain.localhost:3000/debug-session)
   - Check if `role` shows `"admin"`
   - Check if `Is Admin` shows `✅ YES`

4. **Check Navigation**: Go to `/app/tasks`
   - You should now see:
     - **🛡️ Admin Panel** button (purple background)
     - **All Users** link
     - Your role badge should show "admin" in purple

### What You Should See:

When logged in as admin, the navigation bar should display:
```
Todo SaaS | Tasks | Teams | Settings | 🛡️ Admin Panel | All Users | [Admin User] [admin] | Sign Out
```

### Admin Panel Features:

Once visible, you can access:
- **Admin Panel** (`/admin`): Manage all tenants, change plans, view usage
- **All Users** (`/admin/users`): View and manage all users across all tenants
- **My Tenant**: Quick link back to your own tenant

### If Still Not Working:

1. **Verify Database**: Check that admin user has membership with role="admin"
   ```sql
   SELECT u.email, m.role, t.subdomain 
   FROM "User" u
   JOIN "Membership" m ON u.id = m."userId"
   JOIN "Tenant" t ON m."tenantId" = t.id
   WHERE u.email = 'admin@example.com';
   ```

2. **Re-seed Database** (if needed):
   ```bash
   npx prisma db seed
   ```

3. **Check Middleware**: Ensure `/admin` routes don't redirect admins

4. **Clear Browser Cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Testing Admin Features:

1. **View All Tenants**: Navigate to `/admin`
2. **Manage Users**: Navigate to `/admin/users`
3. **Change User Roles**: Use the dropdown in the users table
4. **Delete Users**: Click the delete button (with confirmation)
5. **Switch to Tenant View**: Click "My Tenant" to use the app as a normal user

---

**Quick Debug**: Visit `/debug-session` to see your current session data and verify admin status.
