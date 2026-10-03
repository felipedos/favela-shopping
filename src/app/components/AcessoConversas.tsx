import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { MessageCircle, X } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { contarMensagensNaoLidas } from '../../services/chatService';

export interface ResumoNotificacoesChat {
  mensagensNaoLidas: number;
}

export default function AcessoConversas() {
  const { user, loading: authLoading } = useAuth();
  const { mensagemRecebida } = useChat();
  const [menuAberto, setMenuAberto] = useState(false);
  const [loginAberto, setLoginAberto] = useState(false);
  const [resumo, setResumo] = useState<ResumoNotificacoesChat>({ mensagensNaoLidas: 0 });

  useEffect(() => {
    if (!user) {
      setResumo({ mensagensNaoLidas: 0 });
      setMenuAberto(false);
      return;
    }

    let ativo = true;

    const atualizarResumo = async () => {
      try {
        const mensagensNaoLidas = await contarMensagensNaoLidas();
        if (ativo) setResumo({ mensagensNaoLidas });
      } catch {
        if (ativo) setResumo({ mensagensNaoLidas: 0 });
      }
    };

    void atualizarResumo();
    const intervalo = window.setInterval(atualizarResumo, 60_000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [user]);

  useEffect(() => {
    if (!user || !mensagemRecebida) return;

    void contarMensagensNaoLidas()
      .then((mensagensNaoLidas) => setResumo({ mensagensNaoLidas }))
      .catch(() => setResumo({ mensagensNaoLidas: 0 }));
  }, [mensagemRecebida, user]);

  const abrirAcesso = () => {
    if (authLoading) return;
    if (!user) {
      setLoginAberto(true);
      return;
    }

    setMenuAberto((aberto) => !aberto);
    if (!menuAberto) {
      void contarMensagensNaoLidas()
        .then((mensagensNaoLidas) => setResumo({ mensagensNaoLidas }))
        .catch(() => setResumo({ mensagensNaoLidas: 0 }));
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={abrirAcesso}
        aria-label={
          resumo.mensagensNaoLidas > 0
            ? `Conversas, ${resumo.mensagensNaoLidas} mensagens não lidas`
            : 'Conversas'
        }
        aria-expanded={user ? menuAberto : loginAberto}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-text-main transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <MessageCircle size={21} strokeWidth={1.8} />
        {user && resumo.mensagensNaoLidas > 0 && (
          <span className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-surface bg-red-600 px-1 text-[9px] font-bold leading-none text-white">
            {resumo.mensagensNaoLidas > 99 ? '99+' : resumo.mensagensNaoLidas}
          </span>
        )}
      </button>

      {user && menuAberto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 shadow-hover">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-text-main">Suas conversas</h2>
              <p className="mt-1 text-sm text-text-muted">
                {resumo.mensagensNaoLidas > 0
                  ? `Você tem ${resumo.mensagensNaoLidas} mensagem${resumo.mensagensNaoLidas === 1 ? '' : 's'} não lida${resumo.mensagensNaoLidas === 1 ? '' : 's'}.`
                  : 'Nenhuma mensagem nova.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar conversas"
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={17} />
            </button>
          </div>
          <Link
            to="/conversas"
            onClick={() => setMenuAberto(false)}
            className="mt-4 flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Abrir conversas
          </Link>
        </div>
      )}

      {loginAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLoginAberto(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="conversas-login-titulo"
            className="relative w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-hover sm:p-7"
          >
            <button
              type="button"
              onClick={() => setLoginAberto(false)}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-background hover:text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X size={19} />
            </button>
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-background text-primary">
              <MessageCircle size={22} strokeWidth={1.8} />
            </span>
            <h2 id="conversas-login-titulo" className="pr-8 text-lg font-bold text-text-main">
              Entre para continuar
            </h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Faça login para acessar suas conversas e falar com os vendedores
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLoginAberto(false)}
                className="min-h-10 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-text-main transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Agora não
              </button>
              <Link
                to="/login"
                onClick={() => setLoginAberto(false)}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
              >
                Fazer login
              </Link>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}