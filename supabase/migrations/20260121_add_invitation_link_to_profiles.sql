-- Migration to add invitation_link column to profiles table
-- Date: 2026-01-21

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invitation_link TEXT;

-- Update RLS if necessary (optional as its public but good practice)
-- Usually profiles are readable by the owner or super admins.
-- This link is sensitive, so we should ensure only the user itself or admins can read it.
-- Existing policies should handle this if they are set correctly.
