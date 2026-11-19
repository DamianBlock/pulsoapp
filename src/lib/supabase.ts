import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
// Sin valores por defecto: así nadie escribe en la base de producción por no haber creado su .env.
if (!url || !key)
  throw new Error(
    'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY. Copiá .env.example a .env y completalo con los datos de tu proyecto de Supabase de desarrollo.',
  )
export const supabase = createClient(url, key)
export async function upload(file: File, userId: string) {
  if (file.size > 20 * 1024 * 1024) throw new Error('El archivo supera los 20 MB.')
  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${userId}/${crypto.randomUUID()}/${name}`
  const { error } = await supabase.storage.from('pulso-files').upload(path, file, { upsert: false })
  if (error) throw error
  return path
}
export async function fileUrl(path: string, seconds = 3600) {
  const { data, error } = await supabase.storage.from('pulso-files').createSignedUrl(path, seconds)
  if (error) throw error
  return data.signedUrl
}
