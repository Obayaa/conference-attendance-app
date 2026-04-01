# 📋 Attendance System

A modern, real-time attendance tracking application built for large-scale events and conferences. Designed to handle 20,000+ attendees across multiple registration desks with seamless synchronization.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green.svg)

---

## 🎯 Overview

The Attendance System is a production-ready web application that streamlines the attendance marking process for large events. Built with React and powered by Supabase, it provides real-time synchronization across multiple devices, intelligent search capabilities, and comprehensive analytics.

### Key Features

- ✅ **Smart Autocomplete Search** - Find attendees by Customer ID, Name, or Phone with "starts with" matching
- ✅ **Real-time Synchronization** - All registration desks see updates instantly
- ✅ **Duplicate Prevention** - Automatic blocking of duplicate attendance entries
- ✅ **Proxy Support** - Mark attendance on behalf of another person
- ✅ **Admin Dashboard** - Live statistics, analytics, and export capabilities
- ✅ **Secure Authentication** - URL-based admin access with Supabase Auth
- ✅ **Scalable Architecture** - Handles 20,000+ members with fast performance
- ✅ **Mobile Responsive** - Works seamlessly on tablets and mobile devices

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**

- React 18.x
- React Router DOM (for routing)
- Tailwind CSS (for styling)
- Lucide React (for icons)

**Backend:**

- Supabase (PostgreSQL database)
- Supabase Authentication
- Supabase Real-time subscriptions

**Deployment:**

- Netlify / Vercel (recommended)
- Any static hosting platform

### Database Schema

#### Members Table

```sql
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  branch TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Attendance Table

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custid TEXT NOT NULL REFERENCES members(custid),
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  attended_at TIMESTAMPTZ DEFAULT NOW(),
  proxy BOOLEAN DEFAULT FALSE,
  proxy_name TEXT,
  UNIQUE(custid)
);
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Supabase account (free tier works)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd attendance-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the database migration scripts (see `/docs/database-setup.sql`)
   - Create an admin user in Authentication → Users

4. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-anon-key-here
   ```

5. **Import member data**
   - Prepare your member list as CSV (columns: custid, name, phone, branch, gender)
   - Import via Supabase Table Editor → members → Insert → Import from CSV

6. **Start development server**

   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:5173`

---

## 📱 Usage Guide

### For Registration Staff

1. **Access the attendance page**
   - Navigate to the main URL (e.g., `https://conference-attendance-app.vercel.app`)
   - The attendance marking interface loads by default

2. **Mark attendance**
   - Start typing in the search box (Customer ID, Name, or Phone)
   - Autocomplete dropdown appears with matching members
   - Click on the correct person or use arrow keys + Enter
   - Confirm details in the popup
   - Check "Attending as proxy" if applicable and enter proxy name
   - Click "Confirm Attendance"

3. **Keyboard shortcuts**
   - ↑ / ↓ - Navigate dropdown results
   - Enter - Select highlighted member
   - Esc - Close dropdown

### For Administrators

1. **Access admin panel**
   - Navigate to `https://conference-attendance-app.vercel.app/admin`
   - Enter your Supabase admin credentials
   - Admin button appears in header after login

2. **View dashboard**
   - Live statistics (Total Registered, Total Attended, Attendance Rate, Proxies)
   - Gender breakdown with percentage bars
   - Branch breakdown with percentage bars
   - Real-time attendee list

3. **Export data**
   - Click "Export CSV" to download attendance records
   - File includes: Time, Name, Customer ID, Phone, Branch, Gender, Proxy info

4. **Clear attendance** (use with caution)
   - Click "Clear All Attendance" button
   - Confirm the action
   - All attendance records are permanently deleted

---

## 🔐 Security Features

### Authentication

- Admin access protected by Supabase Authentication
- URL-based admin access (`/admin` route)
- Session persistence across page refreshes
- Automatic logout on session expiry

### Data Protection

- Row Level Security (RLS) policies enabled
- Authenticated users only can modify data
- SQL injection prevention via Supabase client
- Environment variables for sensitive credentials

### Best Practices Implemented

- ✅ No hardcoded credentials
- ✅ HTTPS only in production
- ✅ Secure password hashing (handled by Supabase)
- ✅ CORS protection
- ✅ Rate limiting on database operations

---

## 📊 Features Deep Dive

### Smart Search Algorithm

The search functionality prioritizes results intelligently:

1. **Customer ID matches** (highest priority)
2. **Name matches**
3. **Phone number matches**

All searches use "starts with" logic for better accuracy:

- Typing "CU" shows all Customer IDs starting with "CU"
- Typing "John" shows names starting with "John", not containing "John"
- Typing "024" shows phone numbers starting with "024"

**Performance optimizations:**

- Debounced search (300ms delay)
- Database indexes on searchable fields
- Limit 20 results per query
- Real-time updates without full page reload

### Real-time Synchronization

All connected devices receive updates instantly using Supabase Real-time:

```javascript
// Subscribe to attendance changes
const channel = supabase
  .channel("attendance-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "attendance" },
    callback,
  )
  .subscribe();
```

**Benefits:**

- Multiple registration desks stay synchronized
- Admin dashboard updates live
- No manual refresh needed
- Conflict resolution handled automatically

### Duplicate Prevention

The system prevents duplicate attendance at multiple levels:

1. **Database constraint** - `UNIQUE(custid)` on attendance table
2. **Pre-check before confirmation** - Queries database before showing confirmation
3. **User feedback** - Shows when/where person already attended
4. **Graceful error handling** - Informative messages instead of crashes

---

## 🎨 User Interface

### Design Principles

- **Clean and Minimal** - Focus on core functionality
- **Mobile-First** - Responsive design for tablets and phones
- **Accessibility** - Keyboard navigation support
- **Color-Coded** - Blue for attendance, Purple for admin
- **Real-time Feedback** - Loading states, success/error messages

### Color Palette

| Element              | Color         | Usage                            |
| -------------------- | ------------- | -------------------------------- |
| Primary (Attendance) | Indigo/Blue   | Main actions, active states      |
| Secondary (Admin)    | Purple/Indigo | Admin panel, analytics           |
| Success              | Green         | Confirmation, positive actions   |
| Error                | Red           | Warnings, errors, delete actions |
| Neutral              | Gray          | Inactive states, borders         |

### Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 📈 Performance Optimization

### Database Optimizations

- **Indexes** on frequently queried columns (custid, name, phone)
- **Connection pooling** via Supabase
- **Query optimization** with specific field selection
- **Pagination** for large datasets — ensure Supabase Max Rows (Settings → API) is set above your member count

### Frontend Optimizations

- **Debounced search** to reduce API calls
- **Lazy loading** of components
- **Memoization** of expensive computations
- **Optimistic UI updates** for better UX

### Scalability

The system is designed to handle:

- ✅ 20,000+ members in database
- ✅ 100+ concurrent users
- ✅ 10,000+ attendance records per event
- ✅ Real-time updates across all devices

**Free tier limits (Supabase):**

- 500MB database storage (~50,000 members)
- 50,000 monthly active users
- Unlimited API requests
- 2GB bandwidth

---

## 🔧 Configuration

### Environment Variables

| Variable                                | Description               | Example                   |
| --------------------------------------- | ------------------------- | ------------------------- |
| `VITE_SUPABASE_URL`                     | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase anonymous key    | `eyJhbGc...`              |

### Customization Options

**Branch Names:**
Edit in your CSV import or directly in database

**Gender Options:**
Currently supports: Male, Female
Can be extended by modifying data import

**Search Limit:**
Change in `supabase.js`:

```javascript
.limit(20) // Change this number
```

**Session Timeout:**
Configured in Supabase dashboard → Authentication → Settings

**Max Rows (Supabase Dashboard):**
Go to Settings → API → Max Rows. Default is 1000. Increase this to match your dataset size,
otherwise member fetching and stats will be silently capped.

---

## 📦 Deployment

### Build for Production

```bash
npm run build
```

Generates optimized static files in `/dist` folder.

### Deploy to Netlify

1. **Connect repository**
   - Push code to GitHub
   - Connect to Netlify

2. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment variables**
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

4. **Deploy**
   - Netlify auto-deploys on git push
   - Get production URL: `https://your-app.netlify.app`

### Deploy to Vercel

Similar process:

- Build command: `npm run build`
- Output directory: `dist`
- Add environment variables

### Multi-PC Setup

For events with multiple registration desks:

1. **Deploy to cloud** (Netlify/Vercel)
2. **Share URL** with all registration staff
3. **Bookmark `/admin`** for admin users
4. All PCs access same URL - real-time sync automatic!

**No local installation needed** - works from any browser.

---

## 🐛 Troubleshooting

### Common Issues

**Issue: "Failed to resolve import @supabase/supabase-js"**

```bash
# Solution:
npm install @supabase/supabase-js
```

**Issue: Search not working**

- ✅ Check members are imported in Supabase
- ✅ Verify API keys in `.env`
- ✅ Check browser console for errors

**Issue: Duplicate attendance not blocked**

- ✅ Verify UNIQUE constraint on attendance table
- ✅ Check Row Level Security policies

**Issue: Real-time updates not working**

- ✅ Verify internet connection
- ✅ Check Supabase Real-time is enabled
- ✅ Refresh the page

**Issue: Admin login fails**

- ✅ Verify admin user exists in Supabase Auth
- ✅ Check email/password are correct
- ✅ Ensure user is confirmed (not pending)

**Issue: Member count stuck at 1000**

- ✅ Go to Supabase Dashboard → Settings → API → Max Rows → increase to 5000 or higher
- ✅ This is a server-side hard cap that overrides all query limits

---

## 📚 API Reference

### Supabase Functions

Located in `src/utils/supabase.js`

#### `searchMembers(query)`

Search for members by customer ID, name, or phone.

**Parameters:**

- `query` (string) - Search term

**Returns:**

- Array of matching member objects

**Example:**

```javascript
const results = await searchMembers("John");
```

#### `markAttendance(member, isProxy, proxyName)`

Mark attendance for a member.

**Parameters:**

- `member` (object) - Member object
- `isProxy` (boolean) - Whether attending as proxy
- `proxyName` (string) - Name of proxy person

**Returns:**

- `{ success: boolean, data?: object, message?: string }`

#### `getAttendance()`

Fetch all attendance records.

**Returns:**

- Array of attendance records

#### `getAttendanceStats()`

Get aggregated statistics.

**Returns:**

- Object with stats (totalMembers, totalAttended, etc.)

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

### Code Style

- Use functional components
- Follow ESLint rules
- Use Tailwind utility classes
- Add comments for complex logic

### Testing Checklist

Before deploying:

- ✅ Test search with various inputs
- ✅ Test duplicate prevention
- ✅ Test proxy attendance
- ✅ Test admin login/logout
- ✅ Test CSV export
- ✅ Test on mobile devices
- ✅ Test with multiple users simultaneously

---

## 📝 Future Enhancements

Planned features for future versions:

- [ ] **SMS Notifications** - Send confirmation texts
- [ ] **QR Code Check-in** - Scan member badges
- [ ] **Mobile App** - Native iOS/Android apps
- [ ] **Advanced Analytics** - Charts, trends, insights
- [ ] **Bulk Import** - Upload Excel files directly in app
- [ ] **Custom Fields** - Add organization-specific data
- [ ] **Attendance History** - Track across multiple events
- [ ] **Role-Based Access** - Different admin permission levels
- [ ] **Offline Mode** - Work without internet, sync later
- [ ] **Print Badges** - Generate printable name tags

---

## 🙏 Acknowledgments

Built with:

- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

---

## 📊 Project Stats

- **Total Lines of Code:** ~2,500
- **Components:** 3 pages, 1 utility module
- **Database Tables:** 2 (members, attendance)
- **API Endpoints:** 8 Supabase functions
- **Supported Browsers:** Chrome, Firefox, Safari, Edge (latest versions)

---

**Version 1.0.0** | Last Updated: January 2026
