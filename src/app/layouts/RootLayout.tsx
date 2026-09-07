import { Outlet } from 'react-router';

import { AuthProvider } from '../../contexts/AuthContext';
import { ChatProvider } from '../../contexts/ChatContext';

import PWAHead from '../components/PWAHead';
import PWAInstaller from '../components/PWAInstaller';
import ChatNotification from '../components/chat/ChatNotification';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ChatProvider>
        <PWAHead />

        <Outlet />

        <ChatNotification />

        <PWAInstaller />
      </ChatProvider>
    </AuthProvider>
  );
}