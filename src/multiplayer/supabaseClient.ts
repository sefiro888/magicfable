import { createClient } from '@supabase/supabase-js'

/**
 * URL y clave "publicable" (anon) del proyecto de Supabase. A diferencia de
 * la llave secreta, esta está pensada por diseño para vivir en el bundle del
 * navegador (Supabase la protege con Row Level Security, no con secretismo),
 * así que se guarda aquí en vez de en variables de entorno de CI: así el
 * despliegue en GitHub Pages no necesita secretos adicionales.
 */
const SUPABASE_URL = 'https://xdtwomgdegrbswxygqwy.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_bim10G61dr6E-TdOkPnJCQ_VG371UVm'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
