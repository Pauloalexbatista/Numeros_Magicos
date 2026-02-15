import { redirect } from 'next/navigation';

export default function Home() {
  // Check if user has accepted responsibility terms
  // Since we can't access localStorage on server, we redirect to login
  // The login page will handle the localStorage check and redirect back if already accepted
  redirect('/login');
}
