# Conference Attendance System - Project Structure

## 📁 File Organization

```
conference-attendance/
├── public/
│   └── data/
│       └── members.csv              # Sample member data (replace with your actual data)
├── src/
│   ├── components/
│   │   └── LoginScreen.jsx          # Admin login component
│   ├── pages/
│   │   ├── AttendancePage.jsx       # Attendance marking page
│   │   └── AdminPage.jsx            # Admin dashboard page
│   ├── utils/
│   │   ├── storage.js               # Shared storage functions
│   │   ├── csv.js                   # CSV import/export utilities
│   │   └── data.js                  # Sample member data
│   ├── App.jsx                      # Main app component
│   └── main.jsx                     # Entry point
└── README.md
```

## 🔑 Key Features

### 1. **Shared Storage** (utils/storage.js)
- Uses `window.storage` API with `shared: true`
- All devices see the same real-time data
- No localStorage issues with multiple systems

### 2. **Admin Authentication** (components/LoginScreen.jsx)
- Password: `admin123` (change this in production!)
- Protects admin dashboard from unauthorized access

### 3. **Attendance Page** (pages/AttendancePage.jsx)
- Search by Customer ID or Phone Number
- Mark attendance with proxy support
- Real-time attendance list

### 4. **Admin Dashboard** (pages/AdminPage.jsx)
- Live metrics (auto-refreshes every 5 seconds)
- Gender and branch breakdowns
- CSV export functionality
- Clear all attendance option

## 🚀 Setup Instructions

### Step 1: Install Dependencies
```bash
npm install lucide-react
```

### Step 2: Configure Your Member Data

**Option A: Use Sample Data (Quick Start)**
- The app uses `SAMPLE_MEMBERS` from `utils/data.js` by default
- Just start coding and testing!

**Option B: Load from CSV File**
1. Place your `members.csv` in `public/data/`
2. Update `pages/AttendancePage.jsx` and `pages/AdminPage.jsx`:

```javascript
// Replace this line:
import { SAMPLE_MEMBERS } from '../utils/data';

// With this:
import { loadMembersFromCSV } from '../utils/csv';

// Then in the component:
const [members, setMembers] = useState([]);

useEffect(() => {
  loadMembersFromCSV('/data/members.csv')
    .then(setMembers)
    .catch(err => console.error('Failed to load members:', err));
}, []);
```

### Step 3: Change Admin Password
In `components/LoginScreen.jsx`, update:
```javascript
const ADMIN_PASSWORD = "your-secure-password-here";
```

### Step 4: Run Your App
```bash
npm run dev
```

## 📊 CSV Format

Your `members.csv` should have these columns:
```csv
name,branch,custid,phone,gender
John Doe,Accra Central,CU-1001,0244123456,Male
Jane Smith,Kumasi Branch,CU-1002,0244123457,Female
```

**Required Fields:**
- `name` - Member's full name
- `branch` - Branch/location name
- `custid` - Customer ID (must be unique)
- `phone` - Phone number (used for search)
- `gender` - Gender (for analytics)

## 🎯 How It Works

### Attendance Flow:
1. User enters Customer ID or Phone in search box
2. System searches member database
3. Click "Mark Attendance" on the member card
4. Check "proxy" if attending on behalf of someone
5. Enter proxy person's name if applicable
6. Click "Confirm Attendance"
7. Attendance is saved to shared storage

### Admin Flow:
1. Click "Admin" in navigation
2. Enter password (default: `admin123`)
3. View real-time metrics and breakdowns
4. Export attendance data as CSV
5. Clear all attendance if needed

## 🔒 Security Notes

**For Production:**
1. **Change the admin password** from `admin123` to something secure
2. Consider implementing proper authentication (JWT, OAuth)
3. Add role-based access control if needed
4. Validate all user inputs
5. Add rate limiting for login attempts

## 💾 Data Persistence

- **Attendance data** is stored in shared storage
- **All devices** connected to the app see the same data
- **Auto-refresh**: Admin page refreshes every 5 seconds
- **No data loss**: Data persists across sessions and devices

## 🎨 Customization

### Change Colors:
Update Tailwind classes in components:
- Primary: `indigo-600` → your color
- Secondary: `purple-600` → your color
- Success: `green-600` → your color

### Add Fields:
1. Update CSV format
2. Update `utils/data.js` sample data
3. Update UI in `AttendancePage.jsx` and `AdminPage.jsx`
4. Update export in `utils/csv.js`

## 🐛 Troubleshooting

**Problem: Members not loading**
- Check CSV file path is correct
- Verify CSV format matches expected columns
- Check browser console for errors

**Problem: Attendance not saving**
- Check browser console for storage errors
- Verify `window.storage` API is available
- Try clearing browser cache

**Problem: Admin login not working**
- Verify password is correct (default: `admin123`)
- Check `components/LoginScreen.jsx` for password constant

## 📝 License

Free to use for your conference or organization!