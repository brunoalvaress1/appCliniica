// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ⚠️ SUBSTITUA pelas suas credenciais do Supabase!
// Vá no Supabase → Settings → API
const supabaseUrl = 'https://ifgwkktvkljcbgpoobod.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZ3dra3R2a2xqY2JncG9vYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMDQyMDAsImV4cCI6MjA5Njg4MDIwMH0.qLK40iSZKD_fe-t_XhZz4By2BAj_ibMrvN59Im28aKE'

export const supabase = createClient(supabaseUrl, supabaseKey)