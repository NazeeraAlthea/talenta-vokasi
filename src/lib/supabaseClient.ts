import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Perhatikan bahwa kita tidak menulis key-nya di sini!
// Next.js akan secara otomatis mengambilnya dari file .env.local
const supabase = createPagesBrowserClient()

export default supabase