import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mrjcfouzvlojyibszhzi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamNmb3V6dmxvanlpYnN6aHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0MTg4MjYsImV4cCI6MjA0Njk5NDgyNn0.kMF0kXIMglZU5fAasLMRGngMifBcWOGkdoupEtxbmAM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);