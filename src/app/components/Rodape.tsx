import { Link } from "react-router";

export default function Rodape() {
  return (
    <footer className="site-footer mt-auto">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center transition-all duration-300 ease-out hover:opacity-75">
            <img src="/icone-logo.svg" alt="Favela Shopping" className="h-10 w-auto" />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-text-muted">
            Conectando pessoas, negócios e oportunidades nas comunidades do Rio de Janeiro.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-text-main">Explore</h2>
          <div className="flex flex-col items-start gap-2 text-sm text-text-muted">
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/servicos">Serviços</Link>
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/produtos">Produtos</Link>
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/comidas">Alimentação</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold text-text-main">Sua conta</h2>
          <div className="flex flex-col items-start gap-2 text-sm text-text-muted">
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/login">Entrar ou cadastrar</Link>
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/cadastrar-servico">Anunciar serviço</Link>
            <Link className="transition-all duration-300 ease-out hover:text-primary" to="/cadastrar-produto">Anunciar produto</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border px-5 py-4 text-center text-xs text-text-muted sm:px-8">
        © {new Date().getFullYear()} Favela Shopping
      </div>
    </footer>
  );
}