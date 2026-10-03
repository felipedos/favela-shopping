import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  ChevronDown,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Search,
  User,
  X,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ANUNCIOS_DEMONSTRATIVOS } from '../../mocks/dadosAnunciosDemonstrativos';

import SobreModal from './SobreModal';
import ContatoModal from './ContatoModal';
import PrivateImage from './PrivateImage';

interface PropriedadesCabecalho {
  showFullMenu?: boolean;
}

const opcoesComunidade = [
  ...new Set(
    ANUNCIOS_DEMONSTRATIVOS.map((advertisement) => advertisement.metadata.location)
      .filter((location): location is string => Boolean(location)),
  ),
];

export default function Cabecalho({
  showFullMenu = false,
}: PropriedadesCabecalho) {
  const {
    user,
    profile,
    signOut,
  } = useAuth();

  const navigate = useNavigate();

  const [showSobre, setShowSobre] =
    useState(false);

  const [showContato, setShowContato] =
    useState(false);

  const [menuMobileAberto, setMenuMobileAberto] =
    useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('Sua Comunidade');
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);

  const sair = async () => {
    setMenuMobileAberto(false);

    await signOut();

    navigate('/');
  };

  const fecharMenus = () => {
    setMenuMobileAberto(false);
  };

  const buscarAnuncios = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term || searching) return;

    setSearching(true);
    setSearchMessage('');

    const buscarCorrespondencia = async (table: string, column: string, route: string) => {
      let query = supabase.from(table).select('id').ilike(column, `%${term}%`);
      if (deliveryLocation !== 'Sua Comunidade') {
        query = query.ilike('bairro', deliveryLocation);
      }
      const { data, error } = await query.limit(1);
      if (error) throw error;
      const match = data?.[0] as { id: string | number } | undefined;
      return match ? `${route}/${match.id}` : null;
    };

    try {
      const routes = await Promise.all([
        buscarCorrespondencia('Produto', 'nomeProduto', '/produtos'),
        buscarCorrespondencia('Servico', 'nomeServico', '/servicos'),
        buscarCorrespondencia('Food', 'nomeFood', '/comidas'),
      ]);
      const destination = routes.find(Boolean);
      if (destination) {
        navigate(destination);
      } else {
        setSearchMessage('Nenhum anúncio encontrado.');
      }
    } catch {
      setSearchMessage('Não foi possível buscar agora.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <header className="site-header relative z-40 mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-1 px-4 bg-surface/90 text-primary shadow-premium backdrop-blur-md sm:gap-3 md:px-6 lg:gap-5 lg:px-8">
          <Link
            to="/"
            onClick={fecharMenus}
            className="flex shrink-0 items-center"
          >
            <img
              src="/icone-logo.svg"
              alt="Favela Shop"
              className="h-6 w-auto sm:h-10"
            />
          </Link>

          <div className="relative block shrink-0">
            <button
              type="button"
              onClick={() => setLocationMenuOpen((open) => !open)}
              aria-expanded={locationMenuOpen}
              aria-label={`Entregar em: ${deliveryLocation}`}
              className="flex h-9 w-9 items-center justify-center rounded-xl p-0 text-left transition-all duration-300 ease-out hover:bg-background sm:h-auto sm:w-auto sm:gap-2 sm:px-2 sm:py-2"
            >
              <MapPin size={19} className="shrink-0 text-primary" />
              <span className="hidden lg:block">
                <span className="block text-[11px] leading-tight text-text-muted">Entregar em:</span>
                <span className="block max-w-32 truncate text-sm font-bold text-text-main">{deliveryLocation}</span>
              </span>
              <span className="hidden text-sm font-semibold text-text-main md:block lg:hidden">Local</span>
              <ChevronDown size={15} className="hidden text-text-muted sm:block" />
            </button>
            {locationMenuOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-surface p-2 shadow-hover">
                <p className="px-3 py-2 text-xs font-bold uppercase text-text-muted">Escolha a comunidade</p>
                {['Sua Comunidade', ...opcoesComunidade].map((location) => (
                  <button
                    key={location}
                    type="button"
                    onClick={() => {
                      setDeliveryLocation(location);
                      setLocationMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-text-main transition-all duration-300 ease-out hover:bg-background"
                  >
                    {location}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={buscarAnuncios} className="relative flex min-w-12 max-w-md flex-1 items-center rounded-full border border-border/40 bg-background px-2 py-2 transition-all duration-300 ease-out focus-within:border-primary sm:min-w-0 sm:px-4">
            <Search size={18} className="hidden shrink-0 text-text-muted sm:block" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setSearchMessage('');
              }}
              aria-label="Buscar produtos, serviços ou comida"
              placeholder="Buscar na comunidade"
              className="w-full min-w-0 border-0 bg-transparent px-1 py-0 text-sm text-text-main outline-none placeholder:text-text-muted focus:border-0 focus:ring-0 sm:px-3"
            />
            <button type="submit" aria-label="Buscar" disabled={searching} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-muted transition-all duration-300 ease-out hover:bg-white hover:text-primary disabled:opacity-50 sm:h-8 sm:w-8">
              <Search size={16} />
            </button>
            {searchMessage && <span role="status" className="absolute left-3 top-full z-40 mt-2 whitespace-nowrap rounded-lg bg-surface px-3 py-2 text-xs text-text-muted shadow-premium">{searchMessage}</span>}
            {searching && <span className="sr-only" role="status">Buscando anúncios</span>}
          </form>

          <div className="flex shrink-0 items-center gap-2">
            {user && (
              <Link to="/editar-perfil" className="hidden items-center gap-2 text-sm font-semibold text-text-main transition-all duration-300 ease-out hover:text-primary lg:flex">
                {profile?.self ? (
                  <PrivateImage path={profile.self} alt={profile.nome || 'Usuário'} className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-premium" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background"><User size={18} /></span>
                )}
                <span className="max-w-28 truncate">{profile?.nome || 'Meu Perfil'}</span>
              </Link>
            )}
            {user ? (
              <button type="button" onClick={sair} className="hidden items-center gap-2 rounded-button bg-background px-3 py-2 text-sm font-semibold text-text-main transition-all duration-300 ease-out hover:bg-border xl:flex">
                <LogOut size={16} /> Sair
              </button>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-button bg-secondary px-3 py-2 text-sm font-bold text-white transition-all duration-300 ease-out hover:bg-secondary-hover sm:px-4">
                <LogIn size={17} />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setMenuMobileAberto(true)
            }
            className="p-2 rounded-lg hover:bg-background transition-all duration-300 ease-out xl:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>
      </header>

      {/* =====================================
          FUNDO ESCURO MOBILE
      ====================================== */}
      {menuMobileAberto && (
        <div
          className="fixed inset-0 bg-black/40 z-40 xl:hidden"
          onClick={() =>
            setMenuMobileAberto(false)
          }
        />
      )}

      {/* =====================================
          MENU GAVETA MOBILE
      ====================================== */}
      <aside
        className={`
          fixed
          top-0
          right-0
          h-full
          w-[85%]
          max-w-sm
          bg-white
          shadow-2xl
          z-50
          xl:hidden
          transform
          transition-transform
          duration-300
          overflow-y-auto
          ${
            menuMobileAberto
              ? 'translate-x-0'
              : 'translate-x-full'
          }
        `}
      >
        {/* CABEÇALHO DA GAVETA */}
        <div className="bg-background text-primary p-5 flex items-center justify-between border-b border-border">
          <span className="font-bold text-xl">
            Favela Shopping
          </span>

          <button
            type="button"
            onClick={() =>
              setMenuMobileAberto(false)
            }
            className="p-1"
            aria-label="Fechar menu"
          >
            <X size={26} />
          </button>
        </div>

        {/* USUÁRIO MOBILE */}
        {user && (
          <div className="p-4 border-b bg-gray-50">
            <Link
              to="/editar-perfil"
              onClick={fecharMenus}
              className="flex items-center gap-3"
            >
              {profile?.self ? (
                <PrivateImage
                  path={profile.self}
                  alt={
                    profile.nome ||
                    'Usuário'
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                  <User size={25} />
                </div>
              )}

              <div>
                <div className="font-semibold text-gray-800">
                  {profile?.nome ||
                    'Meu Perfil'}
                </div>

                <div className="text-xs text-gray-500">
                  Editar perfil
                </div>
              </div>
            </Link>
          </div>
        )}

        <nav className="p-4">

          {showFullMenu && (
            <>
              {/* SERVIÇOS MOBILE */}
              <div className="mb-5">
                <div className="font-bold text-gray-800 mb-2">
                  Serviços
                </div>

                <div className="pl-3 border-l-2 border-primary/25 space-y-1">

                  <Link
                    to="/servicos"
                    onClick={fecharMenus}
                    className="block py-2 text-slate-600 hover:text-primary"
                  >
                    Ver Serviços
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/servicos-contratados"
                        onClick={fecharMenus}
                        className="block py-2 text-slate-600 hover:text-primary"
                      >
                        Meus Serviços
                      </Link>

                      <Link
                        to="/cadastrar-servico"
                        onClick={fecharMenus}
                        className="block py-2 text-slate-600 hover:text-primary"
                      >
                        Cadastrar Serviço
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* PRODUTOS MOBILE */}
              <div className="mb-5">
                <div className="font-bold text-gray-800 mb-2">
                  Produtos
                </div>

                <div className="pl-3 border-l-2 border-blue-200 space-y-1">

                  <Link
                    to="/produtos"
                    onClick={fecharMenus}
                    className="block py-2 text-gray-600 hover:text-blue-600"
                  >
                    Ver Produtos
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/editar-produto"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-blue-600"
                      >
                        Meus Produtos
                      </Link>

                      <Link
                        to="/cadastrar-produto"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-blue-600"
                      >
                        Cadastrar Produto
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* COMIDAS MOBILE */}
              <div className="mb-5">
                <div className="font-bold text-gray-800 mb-2">
                  Comidas
                </div>

                <div className="pl-3 border-l-2 border-primary/25 space-y-1">

                  <Link
                    to="/comidas"
                    onClick={fecharMenus}
                    className="block py-2 text-slate-600 hover:text-primary"
                  >
                    Ver Comidas
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/editar-comida"
                        onClick={fecharMenus}
                        className="block py-2 text-slate-600 hover:text-primary"
                      >
                        Minhas Comidas
                      </Link>

                      <Link
                        to="/cadastrar-comida"
                        onClick={fecharMenus}
                        className="block py-2 text-slate-600 hover:text-primary"
                      >
                        Cadastrar Comida
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* CONVERSAS MOBILE */}
              {user && (
                <Link
                  to="/conversas"
                  onClick={fecharMenus}
                    className="flex items-center gap-3 py-3 px-3 mb-3 rounded-lg bg-blue-50 text-primary font-semibold"
                >
                  <MessageCircle size={20} />
                  Conversas
                </Link>
              )}
            </>
          )}

          <div className="border-t pt-3 space-y-1">

            <button
              type="button"
              onClick={() => {
                setMenuMobileAberto(
                  false
                );

                setShowSobre(true);
              }}
              className="w-full text-left py-3 text-gray-700"
            >
              Sobre Nós
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuMobileAberto(
                  false
                );

                setShowContato(true);
              }}
              className="w-full text-left py-3 text-gray-700"
            >
              Contatos
            </button>
          </div>

          <div className="border-t mt-3 pt-4">

            {user ? (
              <button
                type="button"
                onClick={sair}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold"
              >
                <LogOut size={19} />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                onClick={fecharMenus}
                className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover text-white py-3 rounded-lg font-semibold transition-colors"
              >
                <LogIn size={19} />
                Fazer Login
              </Link>
            )}
          </div>
        </nav>
      </aside>

      <SobreModal
        open={showSobre}
        onClose={() =>
          setShowSobre(false)
        }
      />

      <ContatoModal
        open={showContato}
        onClose={() =>
          setShowContato(false)
        }
      />
    </>
  );
}