import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gerenciador de Assinaturas',
  description: 'Gerencie suas assinaturas em um só lugar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
