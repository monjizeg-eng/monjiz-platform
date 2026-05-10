# Vercel Backend Setup Guide

Your Monjiz platform has been configured to use **Vercel** as the backend server with **Supabase** as the database.

## What Changed

1. **API Routes Created** (`/api`)
   - `auth.ts` — Authentication operations
   - `freelancers.ts` — Freelancer CRUD operations
   - `projects.ts` — Project CRUD operations

2. **New Data Client** 
   - `src/integrations/data/vercel-api-client.ts` — Client library for calling API routes

3. **Configuration Updated**
   - `vercel.json` — Configured Vercel serverless functions
   - `package.json` — Added `@supabase/supabase-js` dependency
   - `.env.example` — Updated with Supabase environment variables

## Next Steps

### 1. Set Up Supabase Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these values from your [Supabase Dashboard](https://app.supabase.com):
- Go to **Project Settings** → **API**
- Copy the **URL** and **Anon Key**
- For the Service Role Key, go to **Settings** → **API** → look for "Service Role Key"

### 2. Deploy Environment Variables to Vercel

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_SERVICE_ROLE_KEY
```

Or set them in the Vercel Dashboard:
- Go to your project → **Settings** → **Environment Variables**
- Add each variable with the correct value

### 3. Update Your Components

Replace imports of local storage client:
```typescript
// OLD
import { getFreelancer, insertProject } from "@/integrations/data/monjiz-client";

// NEW
import { getFreelancerById, insertProject } from "@/integrations/data/vercel-api-client";
```

### 4. Install Dependencies

```bash
npm install
# or
bun install
```

### 5. Test Locally

```bash
npm run dev
```

The API routes will be available at `http://localhost:3000/api/`

### 6. Deploy to Vercel

```bash
git add .
git commit -m "Configure Vercel backend with Supabase"
git push origin main
```

Your project will automatically deploy to Vercel.

## API Endpoints

### Authentication
- `POST /api/auth` — Sign up, sign in, sign out, get session

### Freelancers
- `GET /api/freelancers` — List all freelancers
- `GET /api/freelancers?id=123` — Get freelancer by ID
- `GET /api/freelancers?userId=123` — Get freelancer by user ID
- `POST /api/freelancers` — Create freelancer
- `PUT /api/freelancers` — Update freelancer
- `DELETE /api/freelancers?id=123` — Delete freelancer

### Projects
- `GET /api/projects` — List all projects
- `GET /api/projects?id=123` — Get project by ID
- `GET /api/projects?freelancerId=123` — Get projects by freelancer
- `POST /api/projects` — Create project
- `PUT /api/projects` — Update project
- `DELETE /api/projects?id=123` — Delete project

## Important Notes

⚠️ **Database Tables** — Make sure your Supabase database has the correct tables:
- `freelancers` table with appropriate columns
- `projects` table with appropriate columns

These should already exist based on your Supabase migrations.

⚠️ **Service Role Key** — The service role key is sensitive. Only use it in backend code (API routes). Never expose it in frontend code.

## Troubleshooting

**API routes return 404?**
- Ensure files are in `/api` directory and are `.ts` files
- Restart dev server: `npm run dev`

**Environment variables not loading?**
- For local dev: create `.env.local` file
- For Vercel: set variables in project settings
- Restart dev server after adding env vars

**Supabase connection errors?**
- Verify `VITE_SUPABASE_URL` and keys are correct
- Ensure Supabase project is active
- Check network connectivity

## Migration from localStorage

To completely migrate from localStorage:
1. Update all component imports to use `vercel-api-client.ts`
2. Remove localStorage calls
3. Ensure error handling is in place for API calls
4. Test all CRUD operations

Good luck! 🚀
