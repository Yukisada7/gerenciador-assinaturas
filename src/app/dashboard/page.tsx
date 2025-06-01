'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { Modal } from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';

interface Subscription {
  id: string;
  service_name: string;
  monthly_cost: number;
  billing_day: number;
  category: string;
  color?: string;
}

interface SubscriptionStats {
  total: number;
  count: number;
  average: number;
}

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    count: 0,
    average: 0
  });

  // Estados para o modal de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    service_name: '',
    monthly_cost: '',
    billing_day: '',
    category: '',
    color: '#3b82f6',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Estados para o modal de exclusão
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Estados para o modal de nova assinatura
  const [newSubscriptionModalOpen, setNewSubscriptionModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    service_name: '',
    monthly_cost: '',
    billing_day: '',
    category: '',
    color: '#3b82f6',
  });
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  async function loadSubscriptions() {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      if (subscriptionsError) throw subscriptionsError;

      setSubscriptions(data || []);
      
      // Calcular estatísticas
      if (data && data.length > 0) {
        const total = data.reduce((sum, sub) => sum + sub.monthly_cost, 0);
        setStats({
          total,
          count: data.length,
          average: total / data.length
        });
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
      setError('Erro ao carregar assinaturas. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Funções para o modal de nova assinatura
  function openNewSubscriptionModal() {
    setNewForm({
      service_name: '',
      monthly_cost: '',
      billing_day: '',
      category: '',
      color: '#3b82f6',
    });
    setNewError(null);
    setNewSubscriptionModalOpen(true);
  }

  function closeNewSubscriptionModal() {
    setNewSubscriptionModalOpen(false);
    setNewError(null);
  }

  async function handleNewSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNewLoading(true);
    setNewError(null);

    try {
      // Validação básica
      if (!newForm.service_name) throw new Error('Nome do serviço é obrigatório');
      if (!newForm.monthly_cost) throw new Error('Valor mensal é obrigatório');
      if (!newForm.billing_day) throw new Error('Dia da cobrança é obrigatório');
      if (!newForm.category) throw new Error('Categoria é obrigatória');

      const billingDay = Number(newForm.billing_day);
      const monthlyCost = Number(newForm.monthly_cost);

      if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
        throw new Error('Dia da cobrança deve ser entre 1 e 31');
      }
      if (isNaN(monthlyCost) || monthlyCost <= 0) {
        throw new Error('Valor mensal deve ser maior que zero');
      }

      // Obter usuário atual
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Usuário não autenticado');

      // Criar assinatura
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([
          {
            user_id: user.id,
            service_name: newForm.service_name,
            monthly_cost: monthlyCost,
            billing_day: billingDay,
            category: newForm.category,
            color: newForm.color,
          },
        ]);

      if (insertError) throw insertError;

      closeNewSubscriptionModal();
      loadSubscriptions();
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      setNewError(error instanceof Error ? error.message : 'Erro ao criar assinatura');
    } finally {
      setNewLoading(false);
    }
  }

  // Funções para o modal de edição
  function openEditModal(subscription: Subscription) {
    setEditingSubscription(subscription);
    setEditForm({
      service_name: subscription.service_name,
      monthly_cost: String(subscription.monthly_cost),
      billing_day: String(subscription.billing_day),
      category: subscription.category,
      color: subscription.color || '#3b82f6',
    });
    setEditError(null);
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditingSubscription(null);
    setEditError(null);
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingSubscription) return;
    setEditLoading(true);
    setEditError(null);
    try {
      // Validação básica
      if (!editForm.service_name) throw new Error('Nome do serviço é obrigatório');
      if (!editForm.monthly_cost) throw new Error('Valor mensal é obrigatório');
      if (!editForm.billing_day) throw new Error('Dia da cobrança é obrigatório');
      if (!editForm.category) throw new Error('Categoria é obrigatória');
      const billingDay = Number(editForm.billing_day);
      const monthlyCost = Number(editForm.monthly_cost);
      if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
        throw new Error('Dia da cobrança deve ser entre 1 e 31');
      }
      if (isNaN(monthlyCost) || monthlyCost <= 0) {
        throw new Error('Valor mensal deve ser maior que zero');
      }
      // Atualizar assinatura
      const updateData: any = {
        service_name: editForm.service_name,
        monthly_cost: monthlyCost,
        billing_day: billingDay,
        category: editForm.category,
        color: editForm.color || '#3b82f6',
        updated_at: new Date().toISOString(),
      };
      // Remover campos indefinidos
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
      });
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', editingSubscription.id);
      if (updateError) throw updateError;
      closeEditModal();
      loadSubscriptions();
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Erro ao editar assinatura');
    } finally {
      setEditLoading(false);
    }
  }

  // Funções para o modal de exclusão
  function openDeleteModal(subscription: Subscription) {
    setDeletingSubscription(subscription);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setDeleteModalOpen(false);
    setDeletingSubscription(null);
    setDeleteError(null);
  }

  async function handleDelete() {
    if (!deletingSubscription) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', deletingSubscription.id);
      if (deleteError) throw deleteError;
      closeDeleteModal();
      loadSubscriptions();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Erro ao excluir assinatura');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    localStorage.clear();
    document.cookie = '';
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4 mb-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel de Assinaturas</h1>
            <p className="text-gray-500 mt-1">Gerencie todas as suas assinaturas em um só lugar</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button
              onClick={openNewSubscriptionModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow transition-colors"
            >
              Nova Assinatura
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 px-4 py-2 rounded-md border border-gray-300 flex items-center gap-2 transition-colors"
              title="Sair da conta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m-6-3h12m0 0l-3-3m3 3l-3 3" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {subscriptions.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-medium text-gray-700 mb-1">Total Mensal</h3>
                <p className="text-2xl font-bold text-blue-500">R$ {stats.total.toFixed(2)}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-medium text-gray-700 mb-1">Assinaturas</h3>
                <p className="text-2xl font-bold text-blue-500">{stats.count}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-base font-medium text-gray-700 mb-1">Média por Assinatura</h3>
                <p className="text-2xl font-bold text-blue-500">R$ {stats.average.toFixed(2)}</p>
              </div>
            </div>
          </section>
        )}

        {/* Divisória visual */}
        {subscriptions.length > 0 && (
          <div className="w-full h-0.5 bg-gray-200 rounded mb-10" />
        )}

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Assinaturas Recentes</h2>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                Você ainda não tem nenhuma assinatura cadastrada.
              </p>
              <button
                onClick={openNewSubscriptionModal}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Cadastrar primeira assinatura
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className={"bg-white rounded-xl shadow-sm p-6 border-2 hover:shadow-md transition-shadow relative"}
                  style={{ borderColor: subscription.color || '#e5e7eb' }}
                >
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => openEditModal(subscription)} className="text-blue-500 hover:text-blue-700" title="Editar">
                      <FiEdit className="w-5 h-5" />
                    </button>
                    <button onClick={() => openDeleteModal(subscription)} className="text-red-500 hover:text-red-700" title="Excluir">
                      <FiTrash className="w-5 h-5" />
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {subscription.service_name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-1">
                    Categoria: {subscription.category}
                  </p>
                  <p className="text-gray-700 font-medium mb-1">
                    Valor: <span className="text-blue-500 font-bold">R$ {subscription.monthly_cost.toFixed(2)}</span>
                  </p>
                  <p className="text-gray-700 text-sm">
                    Dia de cobrança: {subscription.billing_day}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de nova assinatura */}
      <Modal isOpen={newSubscriptionModalOpen} onClose={closeNewSubscriptionModal} title="Nova Assinatura">
        <form onSubmit={handleNewSubmit} className="space-y-6">
          {newError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {newError}
            </div>
          )}
          <div>
            <label htmlFor="new_service_name" className="block text-sm font-medium text-gray-800">
              Nome do Serviço
            </label>
            <input
              type="text"
              id="new_service_name"
              value={newForm.service_name}
              onChange={e => setNewForm(f => ({ ...f, service_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="new_monthly_cost" className="block text-sm font-medium text-gray-800">
              Valor Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="new_monthly_cost"
              value={newForm.monthly_cost}
              onChange={e => setNewForm(f => ({ ...f, monthly_cost: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="new_billing_day" className="block text-sm font-medium text-gray-800">
              Dia da Cobrança
            </label>
            <input
              type="number"
              min="1"
              max="31"
              id="new_billing_day"
              value={newForm.billing_day}
              onChange={e => setNewForm(f => ({ ...f, billing_day: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="new_category" className="block text-sm font-medium text-gray-800">
              Categoria
            </label>
            <select
              id="new_category"
              value={newForm.category}
              onChange={e => setNewForm(f => ({ ...f, category: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Streaming">Streaming</option>
              <option value="Software">Software</option>
              <option value="Games">Games</option>
              <option value="Música">Música</option>
              <option value="Educação">Educação</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label htmlFor="new_color" className="block text-sm font-medium text-gray-800">
              Cor da Borda
            </label>
            <input
              type="color"
              id="new_color"
              value={newForm.color}
              onChange={e => setNewForm(f => ({ ...f, color: e.target.value }))}
              className="mt-1 block w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
              title="Escolha a cor da borda do card"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={closeNewSubscriptionModal}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={newLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {newLoading ? 'Criando...' : 'Criar Assinatura'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de edição */}
      <Modal isOpen={editModalOpen} onClose={closeEditModal} title="Editar Assinatura">
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {editError}
            </div>
          )}
          <div>
            <label htmlFor="edit_service_name" className="block text-sm font-medium text-gray-800">
              Nome do Serviço
            </label>
            <input
              type="text"
              id="edit_service_name"
              value={editForm.service_name}
              onChange={e => setEditForm(f => ({ ...f, service_name: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="edit_monthly_cost" className="block text-sm font-medium text-gray-800">
              Valor Mensal (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              id="edit_monthly_cost"
              value={editForm.monthly_cost}
              onChange={e => setEditForm(f => ({ ...f, monthly_cost: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="edit_billing_day" className="block text-sm font-medium text-gray-800">
              Dia da Cobrança
            </label>
            <input
              type="number"
              min="1"
              max="31"
              id="edit_billing_day"
              value={editForm.billing_day}
              onChange={e => setEditForm(f => ({ ...f, billing_day: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            />
          </div>
          <div>
            <label htmlFor="edit_category" className="block text-sm font-medium text-gray-800">
              Categoria
            </label>
            <select
              id="edit_category"
              value={editForm.category}
              onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              required
            >
              <option value="">Selecione uma categoria</option>
              <option value="Streaming">Streaming</option>
              <option value="Software">Software</option>
              <option value="Games">Games</option>
              <option value="Música">Música</option>
              <option value="Educação">Educação</option>
              <option value="Outros">Outros</option>
            </select>
          </div>
          <div>
            <label htmlFor="edit_color" className="block text-sm font-medium text-gray-800">
              Cor da Borda
            </label>
            <input
              type="color"
              id="edit_color"
              value={editForm.color}
              onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))}
              className="mt-1 block w-12 h-8 p-0 border-0 bg-transparent cursor-pointer"
              title="Escolha a cor da borda do card"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={closeEditModal}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={editLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {editLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de exclusão */}
      <Modal isOpen={deleteModalOpen} onClose={closeDeleteModal} title="Confirmar Exclusão">
        <div className="space-y-6">
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {deleteError}
            </div>
          )}
          <p className="text-gray-800">
            Tem certeza que deseja apagar a assinatura <span className="font-semibold">{deletingSubscription?.service_name}</span>?
            <br />Essa ação não pode ser desfeita.
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {deleteLoading ? 'Apagando...' : 'Apagar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 