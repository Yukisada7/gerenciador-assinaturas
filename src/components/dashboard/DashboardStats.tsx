import { supabase } from '@/lib/supabase';

interface Subscription {
  monthly_cost: number;
}

async function getSubscriptionStats() {
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('monthly_cost');

  if (!subscriptions) return { total: 0, count: 0, average: 0 };

  const total = subscriptions.reduce((acc: number, sub: Subscription) => acc + (sub.monthly_cost || 0), 0);
  const count = subscriptions.length;
  const average = count > 0 ? total / count : 0;

  return {
    total: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total),
    count,
    average: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(average),
  };
}

export async function DashboardStats() {
  const stats = await getSubscriptionStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600">Total Mensal</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-800">{stats.total}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600">Número de Assinaturas</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-800">{stats.count}</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-600">Média por Assinatura</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-800">{stats.average}</p>
      </div>
    </div>
  );
} 