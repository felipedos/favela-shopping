import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
  }>;
}

export default function PWAInstaller() {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] = useState<BeforeInstallPromptEvent | null>(null);

  const [
    showInstallPrompt,
    setShowInstallPrompt,
  ] = useState(false);

  const [
    isStandalone,
    setIsStandalone,
  ] = useState(false);

  useEffect(() => {
    // Verifica se a aplicação já está instalada
    const standalone =
      window.matchMedia(
        '(display-mode: standalone)'
      ).matches ||
      Boolean(
        (
          window.navigator as Navigator & {
            standalone?: boolean;
          }
        ).standalone
      );

    setIsStandalone(standalone);

    // ==========================================
    // EVENTO DE INSTALAÇÃO
    // ==========================================

    const handleBeforeInstallPrompt = (
      event: Event
    ) => {
      event.preventDefault();

      const installEvent =
        event as BeforeInstallPromptEvent;

      setDeferredPrompt(installEvent);
      setShowInstallPrompt(true);

      console.log(
        '[PWA] Aplicação disponível para instalação.'
      );
    };

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    );

    // ==========================================
    // APLICAÇÃO INSTALADA
    // ==========================================

    const handleAppInstalled = () => {
      console.log(
        '[PWA] Aplicação instalada.'
      );

      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setIsStandalone(true);
    };

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      );
    };
  }, []);

  if (isStandalone) {
    return null;
  }

  if (
    !showInstallPrompt ||
    !deferredPrompt
  ) {
    return null;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();

      const { outcome } =
        await deferredPrompt.userChoice;

      console.log(
        '[PWA] Resultado da instalação:',
        outcome
      );

      setDeferredPrompt(null);
      setShowInstallPrompt(false);

    } catch (error) {
      console.error(
        '[PWA] Erro ao instalar aplicação:',
        error
      );
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xl p-4 z-50">

      <button
        onClick={() =>
          setShowInstallPrompt(false)
        }
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-3">

        <div className="bg-white/20 p-2 rounded-lg">
          <Download size={24} />
        </div>

        <div className="flex-1">

          <h3 className="font-bold mb-1">
            Instalar Favela Shopping
          </h3>

          <p className="text-sm text-white/90 mb-3">
            Instale nosso app na sua tela inicial
            para acesso rápido!
          </p>

          <button
            onClick={handleInstallClick}
            className="w-full bg-white text-purple-600 font-medium py-2 px-4 rounded-lg hover:bg-white/90 transition"
          >
            Instalar Agora
          </button>

        </div>

      </div>

    </div>
  );
}