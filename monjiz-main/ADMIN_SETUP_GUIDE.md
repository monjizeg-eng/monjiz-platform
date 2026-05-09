# Admin Dashboard Setup Guide

## Overview
You now have a complete Super Admin Dashboard system for managing the Monjiz platform. This guide explains how to set it up and use it.

---

## Setup Instructions

### The Easy Way: Use the Admin Account

An admin account has been pre-configured for you. Simply use these credentials to sign up or sign in:

**Email:** `admin@admin.com`
**Password:** `admin1234`

#### Step 1: Sign In or Sign Up
1. Go to `/login` or `/signup`
2. Enter email: `admin@admin.com`
3. Enter password: `admin1234`
4. Click Sign In/Sign Up

#### Step 2: Access Admin Panel
1. Once logged in, go to `/dashboard`
2. You'll see "Admin Access Granted" message
3. Click "Go to Admin Panel" button
4. Or directly visit `/admin`

**That's it!** You now have full admin access. ✅

---

### Alternative: Manual Setup (For Additional Admins)

If you want to grant admin access to another account:

#### Option A: Using the Dashboard
1. Log in with the admin account
2. Go to `/dashboard`
3. See the admin access section
4. Instructions shown there

#### Option B: Manual Supabase Setup
1. Go to Supabase dashboard
2. Navigate to `user_roles` table
3. Insert a new row with:
   - `user_id`: The user's ID (from auth.users)
   - `role`: `admin`

---

## Features

### 1. Dashboard Overview
The admin panel shows statistics:
- **Total Freelancers**: All freelancers on the platform
- **Active**: Approved freelancers visible on marketplace
- **Pending Review**: New freelancers awaiting approval
- **Banned**: Deactivated/problematic freelancers

### 2. Freelancer Management Table
View all freelancers in a clean table with columns:
- Name
- Email
- Specialty
- Status (color-coded)
- Joined Date
- Action Buttons

### 3. Filter by Status
Click filter buttons to view:
- **Pending**: Newly signed-up freelancers needing approval
- **Active**: Currently visible on the marketplace
- **Banned**: Suspended profiles
- **All**: Every freelancer

### 4. Edit Freelancer Profile
Click the "Edit" button to modify any freelancer's details:
- Name
- Email
- WhatsApp
- Specialty
- Bio
- Portfolio links (Portfolio, LinkedIn, Behance, GitHub)
- Status

**Changes are saved immediately to Supabase.**

### 5. Verify/Activate Profiles
To activate a pending freelancer:
1. Click "Edit" on the profile
2. Change Status from "Pending" to "Active"
3. Click "Save Changes"
4. The freelancer now appears on the marketplace

### 6. Ban a Freelancer
To temporarily suspend a freelancer:
1. Click the "Ban" button
2. Confirm the action
3. Their profile is hidden from the marketplace

To reactivate, edit and change status back to "Active"

### 7. Delete a Freelancer
Click "Delete" to permanently remove a profile:
1. Confirm the deletion
2. The profile and all associated data is removed
3. **This action cannot be undone**

---

## Database Schema

### User Roles System
```sql
user_roles table:
- id: UUID (unique role assignment)
- user_id: UUID (reference to auth.users)
- role: app_role enum ('admin', 'moderator', 'user')
- created_at: timestamp
```

### Security
- Admin role is checked using the `has_role()` function
- All queries use Row-Level Security (RLS) policies
- Only authenticated admins can access this data
- All admin actions are logged by Supabase audit logs

### Freelancer Statuses
- `pending`: Default status for new signups (not visible to customers)
- `active`: Approved and visible on marketplace
- `banned`: Temporarily suspended (hidden from marketplace)

---

## Workflow Examples

### Approving a New Freelancer
1. Visit `/admin`
2. Filter by "Pending Review"
3. Click "Edit" on the freelancer
4. Review their details (name, bio, portfolio)
5. Change Status to "Active"
6. Click "Save Changes"
7. They now appear on `/marketplace`

### Removing a Bad Actor
1. Visit `/admin`
2. Find the freelancer in the table
3. Click "Ban" for temporary suspension OR "Delete" for permanent removal
4. Confirm the action
5. They're removed from the marketplace

### Updating Freelancer Information
1. Click "Edit" on any freelancer
2. Update their details as needed
3. Save changes
4. Changes are immediately visible on their public profile

---

## Access Control

### Who Can Access the Admin Panel?
- Only users with the `admin` role in `user_roles` table
- If not authorized, you'll see an "Access Denied" message
- Use the dashboard setup helper to grant yourself admin access

### What Can Admins Do?
- View all freelancer profiles
- Edit any freelancer's information
- Activate/deactivate profiles
- Ban freelancers
- Delete freelancer accounts
- View client requests

---

## Tech Stack

### Components
- **FreelancerManagementTable**: Main table UI with filtering
- **FreelancerEditModal**: Edit form for freelancer details
- **AdminSetupHelper**: One-click admin role assignment

### Backend
- Supabase RLS policies for security
- `has_role()` function for admin verification
- `user_roles` table for role management
- PostgreSQL CHECK constraints for status values

### Routes
- `/admin`: Protected admin panel (requires admin role)
- `/dashboard`: User dashboard (includes admin setup helper)

---

## Troubleshooting

### "Access Denied" Message
- You don't have the admin role yet
- Use the admin setup helper at `/dashboard`
- Or manually add yourself via Supabase dashboard

### Changes Not Saving
- Make sure you have admin role
- Check browser console for error messages
- Verify network connection

### Can't See Freelancers
- Ensure you have admin role
- Try refreshing the page
- Check Supabase RLS policies are enabled

---

## Security Notes

1. **Never share your admin login credentials**
2. **Admin role should only be given to trusted accounts**
3. **All admin actions are logged in Supabase audit logs**
4. **Use strong passwords for your authentication**
5. **Deleted profiles cannot be recovered**

---

## Future Enhancements

Potential features for future versions:
- Admin activity logs
- Bulk actions (activate/ban multiple)
- Freelancer messaging from admin panel
- Revenue/payment management
- Platform analytics dashboard
- Role-based access (moderators, reviewers)
- Email notifications for new signups

---

## Support

For issues or questions:
1. Check the Supabase dashboard for errors
2. Review browser console for client-side errors
3. Verify RLS policies are enabled in Supabase
4. Ensure migrations have been applied
