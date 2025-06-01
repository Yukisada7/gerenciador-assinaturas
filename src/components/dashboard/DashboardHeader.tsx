'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { AuthStatus } from '@/components/AuthStatus';

export function DashboardHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center bg-white p-6 rounded-lg shadow">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Gerencie suas assinaturas e receba notificações de cobranças
        </p>
        <div className="mt-2">
          <AuthStatus />
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/profile">
            Perfil
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/notifications">
            Notificações
          </Link>
        </Button>
        <Button>
          <Link href="/dashboard/new-subscription">
            Nova Assinatura
          </Link>
        </Button>
        <Button variant="ghost" onClick={handleSignOut} className="text-gray-700 hover:text-gray-900">
          Sair
        </Button>
      </div>
    </header>
  );
} 