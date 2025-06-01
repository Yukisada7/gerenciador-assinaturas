'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Subscription {
  id: string;
  service_name: string;
  monthly_cost: number;
  billing_day: number;
  category: string;
  next_billing_date?: string;
}

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      setError(null);

      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('billing_day', { ascending: true });

      if (error) throw error;

      setSubscriptions(subscriptions || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      setError('Erro ao carregar assinaturas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubscriptions();

    // Inscrever para atualizações em tempo real
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions'
        },
        () => {
          loadSubscriptions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="animate-pulse text-gray-600">Carregando assinaturas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadSubscriptions}
          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">Você ainda não tem nenhuma assinatura cadastrada.</p>
        <Link
          href="/dashboard/new-subscription"
          className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
        >
          Adicionar primeira assinatura
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Serviço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Valor Mensal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Dia de Cobrança
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Próxima Cobrança
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription: Subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {subscription.service_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {subscription.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                    .format(subscription.monthly_cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Dia {subscription.billing_day}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {subscription.next_billing_date ? (
                    new Date(subscription.next_billing_date).toLocaleDateString('pt-BR')
                  ) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 