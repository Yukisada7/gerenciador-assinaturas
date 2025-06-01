1. Estrutura de Arquivos
bash
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Rotas de autenticação
│   ├── dashboard/        # Painel de assinaturas
│   └── api/              # Endpoints para notificações
├── components/           # Componentes reutilizáveis
│   ├── ui/               # Componentes de UI (Shadcn-like)
│   └── subscriptions/    # Componentes específicos
├── lib/                  # Lógica compartilhada
│   ├── supabase.ts       # Cliente Supabase
│   └── notifications.ts  # Lógica de e-mail/SMS
└── types/                # Tipos globais
2. Convenções de Nomeação
Pastas: kebab-case (ex: components/subscription-card).

Componentes: PascalCase com exports nomeados (ex: export function SubscriptionList()).

Variáveis: Descritivas com verbos auxiliares (ex: isLoadingSubscriptions, hasNotificationError).

⚙️ TypeScript & Next.js
1. Tipagem
Prefira interface para props de componentes:

ts
interface Subscription {
  id: string;
  service_name: string;
  monthly_cost: number;
  billing_day: number;
}
Evite enums: Use objetos as const:

ts
const CATEGORIES = {
  STREAMING: 'streaming',
  SOFTWARE: 'software',
} as const;
2. Next.js App Router
Server Components: Use para data fetching (Supabase).

Route Handlers: Para APIs de notificações (ex: app/api/notifications/route.ts).

Suspense: Wrap client components com fallback:

tsx
<Suspense fallback={<Spinner />}>
  <SubscriptionList />
</Suspense>
🎨 UI & Estilização
1. Tailwind CSS
Mobile-first: Classes como md: para responsividade.

Componentes reutilizáveis:

tsx
// components/ui/Button.tsx
export function Button({ children }: { children: React.ReactNode }) {
  return (
    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
      {children}
    </button>
  );
}
2. Bibliotecas de UI
Radix UI: Para acessibilidade (ex: <Dialog.Root>).

Shadcn-like: Componentes primitivos personalizáveis.

🚦 Performance
1. Otimizações
Minimize use client:

Use apenas para interatividade (ex: formulários).

Evite em data fetching ou lógica pesada.

Dynamic Imports:

tsx
const DynamicChart = dynamic(() => import('@/components/Chart'), { ssr: false });
2. Web Vitals
LCP: Priorize carregamento de assinaturas acima do fold.

CLS: Evite saltos de layout com size em imagens.

🔌 Integrações
1. Supabase
Client singleton:

ts
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
2. Notificações
Resend (e-mail):

ts
// lib/notifications.ts
import { Resend } from 'resend';
export async function sendEmail(to: string, subject: string, html: string) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  await resend.emails.send({ from: 'notifications@seusite.com', to, subject, html });
}
📌 Regras de Negócio
Notificações: Disparar 24h antes do billing_day.

Autenticação: NextAuth.js com provedor de e-mail + Supabase.

Dados: Sempre validar permissões do usuário no Supabase (RLS).

💡 Exemplo Prático
tsx
// app/dashboard/page.tsx
import { supabase } from '@/lib/supabase';

export default async function Dashboard() {
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .order('billing_day', { ascending: true });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Suas Assinaturas</h1>
      <SubscriptionList subscriptions={subscriptions} />
    </div>
  );
}