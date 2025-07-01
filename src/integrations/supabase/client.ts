
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vqsxjmlihqldosdsflxx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxc3hqbWxpaHFsZG9zZHNmbHh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDY2NTksImV4cCI6MjA2NDcyMjY1OX0.gNCJuPeJQ8S61A39m6x9mCXheEt9UPe3rDul6VgJKSo";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
