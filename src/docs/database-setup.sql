-- Members table
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custid TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  branch TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance table
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

-- Create indexes for fast searching
CREATE INDEX idx_members_custid ON members(custid);
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_attendance_custid ON attendance(custid);
CREATE INDEX idx_attendance_attended_at ON attendance(attended_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your security needs)
CREATE POLICY "Enable read access for all users" ON members FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON attendance FOR DELETE USING (true);


-- Only authenticated users can mark attendance
CREATE POLICY "Authenticated users can insert attendance" 
ON attendance FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Only authenticated users can view admin stats
CREATE POLICY "Authenticated users can read all" 
ON members FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can read attendance" 
ON attendance FOR SELECT 
TO authenticated 
USING (true);

-- Only authenticated users can delete attendance
CREATE POLICY "Authenticated users can delete attendance" 
ON attendance FOR DELETE 
TO authenticated 
USING (true);