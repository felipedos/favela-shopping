import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

const root = createRoot(
  document.getElementById('root')!
);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// ==========================================
// SERVICE WORKER / PWA
// ==========================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration =
        await navigator.serviceWorker.register(
          '/service-worker.js'
        );

      console.log(
        '[PWA] Service Worker registrado:',
        registration.scope
      );

      // Verifica imediatamente se existe uma atualização
      await registration.update();

      console.log(
        '[PWA] Verificação de atualização concluída.'
      );

      // Verifica novamente quando o usuário
      // retorna para a aplicação
      document.addEventListener(
        'visibilitychange',
        async () => {
          if (
            document.visibilityState === 'visible'
          ) {
            try {
              await registration.update();

              console.log(
                '[PWA] Verificação de atualização realizada.'
              );
            } catch (error) {
              console.error(
                '[PWA] Erro ao verificar atualização:',
                error
              );
            }
          }
        }
      );

      // Detecta quando uma nova versão do
      // Service Worker assume o controle.
      let hadController =
        Boolean(navigator.serviceWorker.controller);

      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => {
          if (!hadController) {
            hadController = true;
            return;
          }

          console.log(
            '[PWA] Nova versão ativada. Atualizando aplicação...'
          );

          window.location.reload();
        }
      );

    } catch (error) {
      console.error(
        '[PWA] Erro ao registrar Service Worker:',
        error
      );
    }
  });
}