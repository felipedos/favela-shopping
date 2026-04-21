import { Outlet } from 'react-router';
import { AuthProvider } from '../../contexts/AuthContext';
import PWAHead from '../components/PWAHead';
import PWAInstaller from '../components/PWAInstaller';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PWAHead />
      <Outlet />
      <PWAInstaller />
    </AuthProvider>
  );
}