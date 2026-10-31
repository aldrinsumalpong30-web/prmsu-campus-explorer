// Project configuration.
//
// The anon key is PUBLIC by design: Row Level Security (see supabase/schema.sql)
// controls what visitors can read, and only admins can write.
// NEVER put the service_role key in this project.
export const CONFIG = {
  // Project root only: no trailing slash and no /rest/v1
  SUPABASE_URL: 'https://cujlkqzdqdtkplfemyzu.supabase.co',
  SUPABASE_ANON_KEY:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1amxrcXpkcWR0a3BsZmVteXp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNjg3MTMsImV4cCI6MjEwODk0NDcxM30.Dzr8EkW8QMhygA6KS9JxA3rKtdW8kXX7ITOSZ4us0So',

  // PLACEHOLDER campus center. Replace with verified coordinates.
  MAP_LAT: 15.0,
  MAP_LNG: 120.0,
  MAP_ZOOM: 16,

  // Supabase Storage bucket created by supabase/schema.sql
  STORAGE_BUCKET: 'department-images',
};
