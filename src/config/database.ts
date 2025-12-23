import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('ERROR: Variabel lingkungan Supabase (URL/KEY) tidak ditemukan.');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);