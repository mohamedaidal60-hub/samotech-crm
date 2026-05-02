import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bjjvmmetdudztqmitjmr.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zLmpQquTB3WXrAo7Tjl8kg_P7B-2pkr';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
