'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getAdminClient } from '@/lib/supabase-admin'

export async function login(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect('/?error=1')
  }
  const jar = await cookies()
  jar.set('admin_auth', password, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  redirect('/admin')
}

export async function logout() {
  const jar = await cookies()
  jar.delete('admin_auth')
  redirect('/')
}

export async function deleteSecret(formData: FormData) {
  const id = formData.get('id') as string
  await getAdminClient().from('secrets').delete().eq('id', id)
  revalidatePath('/admin')
}

export async function deleteWhisper(formData: FormData) {
  const id = formData.get('id') as string
  await getAdminClient().from('whispers').delete().eq('id', id)
  revalidatePath('/admin')
}
