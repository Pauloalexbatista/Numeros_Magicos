import type { Metadata } from 'next';
import LoginPage from './login/page';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://numerosmagicos.com',
  },
};

export default function Home() {
  // Renderiza a página de entrada diretamente na raiz (/) com HTTP 200 OK
  // em vez de redirecionar (307) para /login, permitindo a indexação correta pelo Google.
  return <LoginPage />;
}
