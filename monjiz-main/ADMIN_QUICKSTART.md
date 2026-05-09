# 🚀 Admin Access - Quick Start

## Sign In with Admin Credentials

```
Email:    admin@admin.com
Password: admin1234
```

## Steps to Access Admin Panel

### 1. Sign Up or Sign In
- Visit `/signup` or `/login`
- Enter: `admin@admin.com`
- Enter password: `admin1234`
- Click "Sign In" or "Sign Up"

### 2. Go to Dashboard
- After signing in, you'll be at `/dashboard`
- You'll see "✓ Admin Access Granted" message

### 3. Access Admin Panel
- Click "Go to Admin Panel" button
- Or visit: `/admin`

---

## Admin Panel Features

Once logged in as admin, you can:

✅ **View All Freelancers** - Complete table view
✅ **Filter by Status** - Pending, Active, Banned, All
✅ **Edit Profiles** - Update name, bio, specialty, status
✅ **Approve Signups** - Activate pending freelancers  
✅ **Ban Freelancers** - Hide from marketplace
✅ **Delete Profiles** - Permanently remove accounts
✅ **View Statistics** - Dashboard with counts

---

## Quick Tasks

### Approve a New Freelancer
1. Filter: "Pending Review"
2. Click "Edit" on freelancer
3. Change Status: "Active"
4. Click "Save Changes"
✅ Done! They now appear on the marketplace

### Ban a Freelancer
1. Click "Ban" button
2. Confirm
✅ Done! They're hidden from marketplace

### Delete a Profile
1. Click "Delete" button
2. Confirm twice
✅ Done! Profile permanently removed

---

## URLs

| Page | URL |
|------|-----|
| Admin Panel | `/admin` |
| Dashboard | `/dashboard` |
| Sign In | `/login` |
| Sign Up | `/signup` |
| Marketplace | `/marketplace` |

---

## How It Works

- **Auto-Admin Setup**: When you sign up with `admin@admin.com`, the system automatically grants you admin privileges
- **Database Trigger**: A SQL trigger runs when your account is created
- **Instant Access**: No waiting, admin access granted immediately
- **Role Storage**: Your admin role is stored in the `user_roles` table

---

## Troubleshooting

### "Access Denied" at /admin?
- Make sure you're signed in as `admin@admin.com`
- Try refreshing the page
- Check the dashboard - you should see admin status

### Forgot Password?
- Visit `/login`
- Use password reset if available, OR
- You can manually change it in Supabase auth dashboard

### Want Multiple Admins?
- Sign up other users normally
- Go to Supabase dashboard
- Add them to `user_roles` table with role='admin'

---

**Setup Time:** < 1 minute ⚡
**Status:** Ready to Use ✅
