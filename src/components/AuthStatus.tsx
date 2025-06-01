'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function AuthStatus() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Erro ao verificar autenticação:', error);
        }
        setUser(user);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-600">Verificando autenticação...</div>;
  }

  if (!user) {
    return (
      <div className="text-sm text-red-600">
        Não autenticado. Por favor, faça login.
      </div>
    );
  }

  return (
    <div className="text-sm text-green-600">
      Autenticado como: {user.email}
    </div>
  );
} 