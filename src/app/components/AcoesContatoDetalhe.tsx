import { useState } from "react";
import { Link } from "react-router";
import { MessageCircle, X } from "lucide-react";

interface PropriedadesAcoesContatoDetalhe {
  isAuthenticated: boolean;
  returnTo: string;
  categoryPath: string;
  audience: "vendedor" | "prestador";
  isDemo?: boolean;
  onContact?: () => void;
}

export default function AcoesContatoDetalhe({
  isAuthenticated,
  returnTo,
  categoryPath,
  audience,
  isDemo = false,
  onContact,
}: PropriedadesAcoesContatoDetalhe) {
  const [demoNoticeOpen, setDemoNoticeOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl bg-yellow-50 p-4 text-center">
        <p className="mb-3 text-sm font-semibold text-yellow-900">
          Faça login para entrar em contato com o {audience}
        </p>
        <Link
          to="/login-cadastro"
          state={{ from: returnTo }}
          className="inline-flex items-center justify-center rounded-button bg-secondary px-6 py-3 font-bold text-white transition-all duration-300 ease-out hover:bg-secondary-hover"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (isDemo ? setDemoNoticeOpen(true) : onContact?.())}
        className="flex w-full items-center justify-center gap-2 rounded-button bg-secondary px-6 py-4 font-semibold text-white shadow-premium transition-all duration-300 ease-out hover:bg-secondary-hover hover:shadow-hover"
      >
        <MessageCircle size={21} />
        Entrar em Contato
      </button>

      {isDemo && demoNoticeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
          onClick={() => setDemoNoticeOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-contact-title"
            className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-hover"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="demo-contact-title" className="text-lg font-bold text-text-main">
                  Contato indisponível
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Este anúncio demonstrativo ainda não está conectado a um {audience} real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoNoticeOpen(false)}
                aria-label="Fechar aviso"
                className="rounded-full p-2 text-text-muted transition-all duration-300 ease-out hover:bg-background hover:text-text-main"
              >
                <X size={19} />
              </button>
            </div>
            <Link
              to={categoryPath}
              className="mt-5 inline-flex w-full items-center justify-center rounded-button bg-primary px-5 py-3 font-semibold text-white transition-all duration-300 ease-out hover:bg-primary-hover"
            >
              Ver anúncios cadastrados
            </Link>
          </section>
        </div>
      )}
    </>
  );
}