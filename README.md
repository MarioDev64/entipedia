# Entipedia MVP

Modern SaaS dashboard for managing projects, clients, and files built with Next.js 16, React 19, and PostgreSQL.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui, Radix UI
- **Icons:** Lucide React
- **Theme:** next-themes (Dark/Light mode)

### Backend & Database
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Drizzle ORM
- **API:** Next.js Server Actions
- **File Storage:** Vercel Blob

### State Management & Data Fetching
- **Server State:** TanStack Query (React Query) v5
- **Form Handling:** React Hook Form
- **Validation:** Zod

### UI/UX Features
- **Drag & Drop:** @dnd-kit
- **Notifications:** Sonner (toast)
- **Date Handling:** date-fns
- **Responsive Design:** Mobile-first approach
- **Accessibility:** ARIA compliant components

---

## ✨ Features

### 📋 Projects (Kanban Board)
- ✅ Drag & drop between columns (New → In Progress → In Review → Completed)
- ✅ Reorder within columns
- ✅ Create, edit, delete projects
- ✅ Priority levels (Low, Medium, High)
- ✅ Real-time updates with optimistic UI
- ✅ Responsive grid layout

### 👥 Clients Management
- ✅ Interactive table with inline editing
- ✅ Pagination (10 clients per page)
- ✅ Client types (Person/Company)
- ✅ Value tracking in DOP (Dominican Peso)
- ✅ Date range management
- ✅ Full CRUD operations
- ✅ Currency formatting

### 📁 Files Management
- ✅ Upload files via button or drag & drop
- ✅ Support for PDF, Word, Excel, Images (JPG, PNG, WEBP)
- ✅ File size limit: 10MB
- ✅ Download files
- ✅ Cloud storage with Vercel Blob
- ✅ File metadata management
- ✅ Visual file type indicators

### 🎨 UI/UX
- ✅ Dark/Light mode toggle (system preference supported)
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Adaptive navigation (sidebar for desktop, bottom nav for mobile)
- ✅ Toast notifications (success, error, loading states)
- ✅ Loading skeletons
- ✅ Confirmation dialogs
- ✅ Form validation with error messages
- ✅ Optimistic updates for instant feedback

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn**
- **Git** ([Download](https://git-scm.com/))
- **Vercel account** ([Sign up - Free](https://vercel.com/signup))
- **Neon account** ([Sign up - Free](https://neon.tech))

---

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/entipedia.git
cd entipedia
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Neon PostgreSQL Database

#### 3.1 Create Neon Account and Project

1. Go to [Neon](https://neon.tech) and sign up (free tier)
2. Click **"Create a project"**
3. Configure:
   - **Project name:** entipedia
   - **Region:** US East (Ohio) - us-east-2 (recommended)
   - **Postgres version:** 16 (latest)
4. Click **"Create project"**

#### 3.2 Get Database Connection String

1. In your Neon dashboard, click on your project
2. Go to **"Connection Details"**
3. Copy the connection string:
```
postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

#### 3.3 Configure Environment Variables

Create `.env.local` file in the root directory:
```bash
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

#### 3.4 Push Database Schema
```bash
# Generate migration files
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push
```

✅ Your database is now ready with all tables!

#### 3.5 Verify Database (Optional)
```bash
# Open Drizzle Studio to inspect your tables
npm run db:studio
```

Open [http://localhost:4983](http://localhost:4983) to see your database tables.

---

### 4. Setup Vercel Blob Storage

#### 4.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 4.2 Login to Vercel
```bash
vercel login
```

Follow the prompts to authenticate.

#### 4.3 Link Project to Vercel
```bash
vercel link
```

Follow the prompts:
- **Setup and deploy?** No (we'll do this later)
- **Which scope?** Select your account
- **Link to existing project?** No
- **Project name?** entipedia (or your preferred name)

#### 4.4 Create Blob Store
```bash
vercel blob create entipedia-files
```

This creates a blob store and automatically adds `BLOB_READ_WRITE_TOKEN` to your Vercel project.

#### 4.5 Pull Environment Variables
```bash
vercel env pull .env.local
```

This downloads the `BLOB_READ_WRITE_TOKEN` to your `.env.local` file.

Your `.env.local` should now have:
```bash
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxxxxxxxxxx"
```

✅ Vercel Blob is now configured!

---

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the Entipedia dashboard! 🎉

---

## 📁 Project Structure
```
entipedia/
├── src/
│   ├── app/
│   │   ├── projects/
│   │   │   └── page.tsx              # Projects Kanban board
│   │   ├── clients/
│   │   │   └── page.tsx              # Clients table
│   │   ├── files/
│   │   │   └── page.tsx              # Files management
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home redirect
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── skeletons/                # Loading skeletons
│   │   ├── Header.tsx
│   │   ├── MobileHeader.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── MainContent.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Providers.tsx             # React Query & Theme providers
│   │   ├── ProjectsBoard.tsx         # Kanban board with drag & drop
│   │   ├── ProjectCard.tsx           # Draggable project card
│   │   ├── NewProjectDialog.tsx
│   │   ├── EditProjectDialog.tsx
│   │   ├── DeleteProjectDialog.tsx
│   │   ├── NewClientDialog.tsx
│   │   ├── DeleteClientDialog.tsx
│   │   ├── UploadFileDialog.tsx
│   │   ├── FileItem.tsx
│   │   └── DeleteFileDialog.tsx
│   ├── contexts/
│   │   └── SidebarContext.tsx        # Sidebar state management
│   ├── hooks/
│   │   ├── useProjects.ts            # TanStack Query hooks for projects
│   │   ├── useClients.ts             # TanStack Query hooks for clients
│   │   ├── useFiles.ts               # TanStack Query hooks for files
│   │   ├── use-mobile.tsx            # Mobile detection hook
│   │   ├── use-orientation.tsx       # Orientation detection hook
│   │   └── use-toast.ts              # Toast notifications hook
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── projects.ts           # Server actions for projects
│   │   │   ├── clients.ts            # Server actions for clients
│   │   │   └── files.ts              # Server actions for files
│   │   ├── db/
│   │   │   ├── drizzle.ts            # Database connection
│   │   │   └── schema.ts             # Database schema
│   │   ├── validations/
│   │   │   ├── project.ts            # Zod schemas for projects
│   │   │   ├── client.ts             # Zod schemas for clients
│   │   │   └── file.ts               # Zod schemas for files
│   │   ├── queryClient.ts            # TanStack Query configuration
│   │   └── utils.ts                  # Utility functions (cn)
│   └── types/
│       └── index.ts                  # TypeScript types
├── drizzle/
│   └── migrations/                   # Database migrations
├── public/
│   └── logo.webp                     # App logo
├── .env.local                        # Environment variables (not in git)
├── .env.example                      # Example environment variables
├── drizzle.config.ts                 # Drizzle configuration
├── envConfig.ts                      # Environment loader for Drizzle
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind configuration
└── package.json                      # Dependencies
```

---

## 🗃️ Database Schema

### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `status`: "new" | "in_progress" | "in_review" | "completed"
- `priority`: "low" | "medium" | "high"
- `order`: Position within column for drag & drop

### Clients Table
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value_dop DECIMAL(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `type`: "person" | "company"
- `value_dop`: Value in Dominican Peso (DOP)

### Files Table
```sql
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `file_type`: MIME type (e.g., "application/pdf", "image/png")
- `file_url`: Vercel Blob URL

---

## 🚀 Deployment to Production

### Option 1: Deploy via Vercel CLI (Recommended)

#### Step 1: Ensure Environment Variables
Make sure your `.env.local` has:
```bash
DATABASE_URL="postgresql://..."
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

#### Step 2: Deploy to Production
```bash
vercel --prod
```

Follow the prompts and your app will be deployed! 🚀

### Option 2: Deploy via GitHub Integration

#### Step 1: Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/entipedia.git
git push -u origin main
```

#### Step 2: Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** .next

#### Step 3: Add Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production, Preview, Development |
| `BLOB_READ_WRITE_TOKEN` | Automatically added by Vercel Blob | All |

#### Step 4: Deploy
Click **"Deploy"** and wait for the build to complete.

✅ Your app is now live!

---

## 🔧 Available Scripts

```bash
# Development
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint

# Prettier
npm run format        # Formats code based on .prettierrc
npm run format:check  # Check if code format needs correction (dry run)

# Database
npm run db:generate   # Generate migration files from schema
npm run db:push       # Push schema changes to database (without migrations)
npm run db:migrate    # Run migrations
npm run db:studio     # Open Drizzle Studio (http://localhost:4983)
```

---

## 🧪 Testing the Application

### Test Projects (Kanban Board)
1. Go to `/projects`
2. Click **"New Project"**
3. Fill in:
   - Name: "Design new landing page"
   - Description: "Create modern landing page design"
   - Status: "New"
   - Priority: "High"
4. Save and see it appear in the "New" column
5. **Drag** the project to "In Progress" column
6. Click on the project to **edit** details
7. Click trash icon to **delete**

### Test Clients (Table Management)
1. Go to `/clients`
2. Click **"New Client"**
3. Fill in:
   - Name: "Acme Corporation"
   - Type: "Company"
   - Value: 50000.00
   - From: 2024-01-01
   - To: 2024-12-31
4. Save and see it in the table
5. Click **pencil icon** to edit inline
6. Modify values and click **save icon**
7. Click trash icon to **delete** (with confirmation)

### Test Files (Upload & Download)
1. Go to `/files`
2. Click **"Upload File"**
3. **Drag & drop** a PDF file (or click to browse)
4. Add name: "Project Proposal"
5. Add description: "Q1 2024 Project Proposal"
6. Click **"Upload File"** (max 10MB)
7. See file card with icon and metadata
8. Click **download icon** to download
9. Click trash icon to **delete** (also removes from Vercel Blob)

---

## 📝 Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string from Neon | ✅ Yes | `postgresql://user:pass@host/db` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob access token | ✅ Yes | `vercel_blob_rw_xxx` |

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** "Failed to connect to database"

**Solutions:**
1. Verify `DATABASE_URL` is correct in `.env.local`
2. Check if database is active in Neon dashboard
3. Ensure your IP is allowed (Neon allows all IPs by default)
4. Try regenerating the connection string
5. Run `npm run db:push` to ensure tables exist

### File Upload Issues

**Error:** "Failed to upload file"

**Solutions:**
1. Verify `BLOB_READ_WRITE_TOKEN` exists in `.env.local`
2. Run `vercel env pull .env.local` to refresh token
3. Ensure file size is under 10MB
4. Check file type is supported (PDF, DOC, XLS, PNG, JPG, WEBP)
5. Verify Vercel Blob store exists: `vercel blob ls`

### Build/Type Errors

**Error:** TypeScript errors during build

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json .next
npm install

# Regenerate types
npm run build
```

### Hydration Errors

**Error:** "Text content does not match server-rendered HTML"

**Solutions:**
1. Check for proper `suppressHydrationWarning` in `<html>` tag
2. Ensure client components use `"use client"` directive
3. Avoid rendering dynamic content on initial load
4. Use `useEffect` for client-only rendering

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Database credentials never exposed to client
- Server-side validation with Zod
- File uploads validated (type, size)
- CSRF protection (Next.js default)
- SQL injection prevention (Drizzle ORM)
- Server Actions for all mutations

⚠️ **For Production:**
- Add rate limiting for API routes
- Implement authentication (NextAuth.js, Clerk, etc.)
- Add CORS configuration
- Enable CSP headers
- Set up monitoring (Sentry, LogRocket)
- Configure WAF rules in Vercel

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Query (TanStack Query)](https://tanstack.com/query/latest)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [dnd-kit Documentation](https://docs.dndkit.com)

### Tutorials
- [Next.js 14 App Router Tutorial](https://nextjs.org/learn)
- [TanStack Query Tutorial](https://tanstack.com/query/latest/docs/react/overview)
- [Drizzle ORM with Neon](https://orm.drizzle.team/docs/get-started-postgresql)

---

## 🎯 Future Enhancements

- [ ] User authentication & authorization
- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced filtering & search
- [ ] File previews (PDF viewer, image gallery)
- [ ] Project templates
- [ ] Client dashboard with analytics
- [ ] Export data (CSV, PDF)
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] API endpoints for third-party integrations

---

## 👨‍💻 Author

**Mario Torres**
- Email: marioytorres@hotmail.com
- GitHub: [@MarioDev64](https://github.com/MarioDev64)
- LinkedIn: [Mario Torres](https://linkedin.com/in/your-profile)

---

## 📄 License

This project is for educational/technical assessment purposes.

MIT License - feel free to use this project as a learning resource.

---

## 🙏 Acknowledgments

- Technical challenge provided by **Entipedia**
- UI components by [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide React](https://lucide.dev)
- Drag & Drop by [dnd-kit](https://dndkit.com)

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [GitHub Issues](https://github.com/your-username/entipedia/issues)
3. Open a new issue with detailed description
4. Contact: marioytorres@hotmail.com

---

**Built with ❤️ using Next.js 16 and React 19**

🚀 **Happy coding!**