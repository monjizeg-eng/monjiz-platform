# Admin System - Quick Reference

## 🚀 Quick Start: Admin Credentials

**Email:** `admin@admin.com`
**Password:** `admin1234`

Use these to sign in/sign up and automatically get admin access.

---

## Component API Documentation

### AdminSetupHelper
```tsx
import { AdminSetupHelper } from "@/components/AdminSetupHelper";

// Usage in Dashboard
<AdminSetupHelper />

// Features:
// - One-click admin role assignment
// - Automatic detection if already admin
// - Success confirmation with instructions
// - Error handling with toast notifications
```

### FreelancerManagementTable
```tsx
import { FreelancerManagementTable } from "@/components/FreelancerManagementTable";

interface Props {
  freelancers: Freelancer[];
  filter: "pending" | "active" | "banned" | "all";
  setFilter: (filter: string) => void;
  onUpdate: () => void;
}

// Usage
<FreelancerManagementTable
  freelancers={freelancers}
  filter={filter}
  setFilter={setFilter}
  onUpdate={reloadFreelancers}
/>

// Features:
// - Table view of all freelancers
// - Filter buttons by status
// - Edit/Ban/Delete action buttons
// - Color-coded status badges
// - Responsive design
```

### FreelancerEditModal
```tsx
import { FreelancerEditModal } from "@/components/FreelancerEditModal";

interface Props {
  freelancer: Freelancer;
  onClose: () => void;
  onSave: () => void;
}

// Usage
{editingFreelancer && (
  <FreelancerEditModal
    freelancer={editingFreelancer}
    onClose={() => setEditingFreelancer(null)}
    onSave={handleSave}
  />
)}

// Features:
// - Full profile editing
// - All freelancer fields editable
// - Status change capability
// - Form validation
```

### AdminQuickReference
```tsx
import { AdminQuickReference } from "@/components/AdminQuickReference";

// Usage - displays static reference
<AdminQuickReference />

// Shows:
// - Status meanings
// - Link to marketplace
// - Quick help info
```

---

## Supabase Functions & Policies

### has_role() Function
```sql
SELECT public.has_role(user_id, 'admin'::app_role)
-- Returns true if user has admin role
-- Used in all RLS policies for admin access
```

### Available Admin Operations

#### View All Freelancers
```typescript
const { data } = await supabase
  .from("freelancers")
  .select("*")
  .order("created_at", { ascending: false });
```

#### Edit Freelancer
```typescript
const { error } = await supabase
  .from("freelancers")
  .update({ name, email, bio, status, ... })
  .eq("id", freelancerId);
```

#### Change Status
```typescript
// Active → Pending
await supabase
  .from("freelancers")
  .update({ status: "pending" })
  .eq("id", freelancerId);

// Ban freelancer
await supabase
  .from("freelancers")
  .update({ status: "banned" })
  .eq("id", freelancerId);
```

#### Delete Freelancer
```typescript
const { error } = await supabase
  .from("freelancers")
  .delete()
  .eq("id", freelancerId);
// This cascades to all related records
```

#### Grant Admin Role
```typescript
const { error } = await supabase
  .from("user_roles")
  .insert({
    user_id: userId,
    role: "admin"
  });
```

---

## Routes

### Admin Panel
```
/admin
- Protected route requiring admin role
- Shows management dashboard
- Full freelancer management interface
```

### Dashboard
```
/dashboard
- User dashboard
- Includes AdminSetupHelper component
- "Admin Panel Access" section
```

---

## Data Types

### Freelancer Type
```typescript
type Freelancer = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  specialty: string;
  status: "pending" | "active" | "banned";
  created_at: string;
  bio: string | null;
  portfolio: string | null;
  linkedin: string | null;
  behance: string | null;
  github: string | null;
};
```

### Admin Role Type
```typescript
type AppRole = "admin" | "moderator" | "user";

type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};
```

---

## Common Tasks

### Approve a New Freelancer
```tsx
// 1. Find freelancer with status 'pending'
// 2. Click Edit button
// 3. Change status to 'active'
// 4. Click Save
// Result: Visible on marketplace immediately
```

### Ban a Freelancer
```tsx
// 1. Click Ban button on freelancer row
// 2. Confirm in dialog
// Result: Hidden from marketplace, can reactivate later
```

### Delete a Freelancer
```tsx
// 1. Click Delete button on freelancer row
// 2. Confirm in dialog
// 3. Confirm again in browser confirmation
// Result: Profile permanently removed (irreversible)
```

### Update Freelancer Info
```tsx
// 1. Click Edit on freelancer
// 2. Update any field (name, bio, specialty, etc.)
// 3. Click Save
// Result: Changes live immediately
```

---

## Environment Setup

### Required Supabase Configuration
1. ✅ Auth enabled (existing)
2. ✅ Database with RLS enabled (existing)
3. ✅ user_roles table (existing)
4. ✅ freelancers table (existing)
5. ✅ Admin policies deployed (NEW)

### Required Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_anon_key
```

---

## Security Checklist

- [ ] Only you have admin role initially
- [ ] Admin route requires authentication
- [ ] RLS policies enforce database security
- [ ] All actions logged by Supabase
- [ ] Confirmations prevent accidental deletes
- [ ] Input validation on all forms
- [ ] Error handling with user feedback

---

## Troubleshooting

### Can't Access `/admin`
```
Error: "Access Denied"
Solution: 
1. Go to /dashboard
2. Click "Grant Admin Access"
3. Refresh page
4. Return to /admin
```

### Changes Not Saving
```
Possible causes:
1. Not authenticated
2. No admin role
3. Network error
4. Database constraint

Solution:
1. Check console for errors
2. Verify admin role in Supabase
3. Check network tab
4. Refresh page and try again
```

### Freelancer Still Visible After Ban
```
Cause: Marketplace uses 'active' status check
Solution: 
1. Marketplace query filters by status = 'active'
2. Banned freelancers have status = 'banned'
3. Ban should hide immediately
4. Try hard refresh (Ctrl+Shift+R)
```

---

## Performance Tips

1. **Table Loading**: Loads on page visit, cached in state
2. **Real-time Updates**: Manual refresh with onUpdate()
3. **Batch Operations**: Future enhancement for multiple actions
4. **Pagination**: Can be added if table grows very large

---

## Future Enhancements

- [ ] Bulk actions (ban/approve multiple at once)
- [ ] Admin activity logs
- [ ] Search across all fields
- [ ] Advanced filtering
- [ ] Export freelancer data
- [ ] Email notifications for new signups
- [ ] Freelancer messaging system
- [ ] Platform analytics

---

## Support & Debugging

### Enable Debug Logging
```typescript
// In components/FreelancerManagementTable.tsx
console.log("Loading freelancers...", freelancers);
console.log("Filter applied:", filter);
```

### Check RLS Policies
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run: `SELECT * FROM pg_policies WHERE schemaname = 'public'`
4. Verify admin policies are enabled

### View Admin Role
```sql
SELECT * FROM public.user_roles 
WHERE role = 'admin' 
ORDER BY created_at DESC;
```

---

## API Endpoints Used

All operations use Supabase Postgrest API:

| Operation | Method | Table | Auth Required |
|-----------|--------|-------|----------------|
| List Freelancers | GET | freelancers | Admin |
| Update Freelancer | PATCH | freelancers | Admin |
| Delete Freelancer | DELETE | freelancers | Admin |
| Add Admin Role | POST | user_roles | Admin |
| Check Role | FUNCTION | has_role() | Auth |

---

**Version**: 1.0
**Last Updated**: May 9, 2026
**Status**: Production Ready ✅
