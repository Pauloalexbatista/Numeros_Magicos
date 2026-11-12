import { redirect } from 'next/navigation';

export default function Home() {
  // A raiz (/) abre sempre a porta de entrada (/login) onde o utilizador vê o resumo
  // dos jogos e clica no botão de aceitação de responsabilidade para entrar.
  redirect('/login');
}
