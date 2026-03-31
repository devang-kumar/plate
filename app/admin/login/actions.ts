'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession, getAdminPassword } from '@/lib/auth';

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string;
  const correctPassword = getAdminPassword();

  if (password !== correctPassword) {
    return { error: 'Incorrect password. Please try again.' };
  }

  await createSession();
  redirect('/admin');
}

export async function logoutAction() {
  await destroySession();
  redirect('/admin/login');
}
