import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.log('Erro ao registrar Service Worker:', error);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA instalado');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-2xl p-4 z-50">
      <button
        onClick={() => setShowInstallPrompt(false)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X size={20} />
      </button>

      <div className="flex items-start gap-3">
        <div className="bg-white/20 p-2 rounded-lg">
          <Download size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Instalar Favela Shopping</h3>
          <p className="text-sm text-white/90 mb-3">
            Instale nosso app na sua tela inicial para acesso rápido!
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