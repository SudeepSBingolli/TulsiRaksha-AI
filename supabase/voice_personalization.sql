-- Voice Personalization Table for storing user's voice preferences
-- This table allows users to optionally upload voice samples with explicit consent

CREATE TABLE IF NOT EXISTS user_voice_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Voice settings
  voice_id VARCHAR(255) DEFAULT 'EXAVITQu4vLvkujnVJL5', -- Default voice ID
  custom_voice_id VARCHAR(255), -- User's custom cloned voice ID (if available)
  voice_name VARCHAR(255), -- Named voice (e.g., "Family Voice", "Comforting Voice")
  
  -- Consent tracking
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  consent_reference VARCHAR(500), -- Reference to consent document
  
  -- Voice settings
  speech_rate FLOAT DEFAULT 1.0, -- 0.5 to 2.0 (slower to faster)
  pitch FLOAT DEFAULT 1.0, -- Voice pitch adjustment
  
  -- Sample reference (if user uploaded a sample)
  sample_file_url VARCHAR(500),
  sample_uploaded_at TIMESTAMP,
  
  -- Metadata
  voice_description TEXT, -- How user describes their preferred voice
  preferred_greeting TEXT DEFAULT 'Hi there! I am here with you. How are you feeling today?',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE user_voice_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own voice preferences
CREATE POLICY "Users can view own voice preferences" ON user_voice_preferences
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own voice preferences
CREATE POLICY "Users can update own voice preferences" ON user_voice_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own voice preferences
CREATE POLICY "Users can insert own voice preferences" ON user_voice_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_voice_preferences_user_id ON user_voice_preferences(user_id);
