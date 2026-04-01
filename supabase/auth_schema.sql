-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  fingerprint_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  phone VARCHAR(20),
  code VARCHAR(10) NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'email' or 'phone'
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Create user_login_logs table
CREATE TABLE IF NOT EXISTS user_login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  login_method VARCHAR(50) NOT NULL, -- 'password' or 'fingerprint'
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_phone ON verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_time ON user_login_logs(login_time);

-- Add RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_login_logs ENABLE ROW LEVEL SECURITY;

-- Policy for user_profiles - users can read their own profile
CREATE POLICY "Users can read their own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id::text);

-- Policy for verification_codes - anyone can read (for verification purposes)
CREATE POLICY "Anyone can create verification codes" ON verification_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read verification codes" ON verification_codes
  FOR SELECT USING (true);

-- Policy for user_login_logs - users can read their own logs
CREATE POLICY "Users can read their own login logs" ON user_login_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);
