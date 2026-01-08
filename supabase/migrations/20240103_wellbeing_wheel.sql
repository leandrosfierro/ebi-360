-- Migration: Wellbeing Wheel Bs360

-- 1. wellbeing_checkins table
CREATE TABLE IF NOT EXISTS wellbeing_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Scores per domain
    scores JSONB NOT NULL, -- { financiero: 1-10, fisico: 1-10, ... }
    
    -- Summary metrics
    average_score NUMERIC(3, 1) NOT NULL,
    min_domain TEXT NOT NULL,
    min_score INT NOT NULL,
    max_domain TEXT NOT NULL,
    max_score INT NOT NULL,
    
    -- Optional note
    note TEXT,
    
    -- AI Feedback
    ai_feedback JSONB, -- { summary, priorities: [], actions: [], ... }
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Update profiles with streak and badges
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wheel_streak_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS wheel_last_checkin_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wheel_badges JSONB DEFAULT '[]'::jsonb;

-- 3. RLS Policies
ALTER TABLE wellbeing_checkins ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own check-ins
CREATE POLICY "Users can manage their own check-ins"
    ON wellbeing_checkins FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wellbeing_checkins_user_date ON wellbeing_checkins (user_id, created_at DESC);
