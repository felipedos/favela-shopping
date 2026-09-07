import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  User,
  X,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

import SobreModal from './SobreModal';
import ContatoModal from './ContatoModal';

interface HeaderProps {
  showFullMenu?: boolean;
}

type MenuAberto =
  | 'servicos'
  | 'produtos'
  | 'comidas'
  | null;

export default function Header({
  showFullMenu = false,
}: HeaderProps) {
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

  const [menuAberto, setMenuAberto] =
    useState<MenuAberto>(null);

  const [menuMobileAberto, setMenuMobileAberto] =
    useState(false);

  const handleLogout = async () => {
    setMenuMobileAberto(false);
    setMenuAberto(null);

    await signOut();

    navigate('/');
  };

  const alternarMenu = (
    menu: MenuAberto
  ) => {
    setMenuAberto(
      menuAberto === menu
        ? null
        : menu
    );
  };

  const fecharMenus = () => {
    setMenuAberto(null);
    setMenuMobileAberto(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg relative z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link
            to="/"
            onClick={fecharMenus}
            className="text-2xl font-bold whitespace-nowrap"
          >
            Favela Shopping
          </Link>

          {/* =====================================
              MENU DESKTOP
          ====================================== */}
          <nav className="hidden md:flex items-center gap-5">

            {showFullMenu && (
              <>
                {/* SERVIÇOS */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      alternarMenu('servicos')
                    }
                    className="flex items-center gap-1 hover:text-white/80 transition"
                  >
                    Serviços
                    <ChevronDown size={16} />
                  </button>

                  {menuAberto ===
                    'servicos' && (
                    <div className="absolute top-full left-0 mt-3 w-56 bg-white text-gray-800 rounded-lg shadow-xl border overflow-hidden">

                      <Link
                        to="/servicos"
                        onClick={fecharMenus}
                        className="block px-4 py-3 hover:bg-purple-50"
                      >
                        Ver Serviços
                      </Link>

                      {user && (
                        <>
                          <Link
                            to="/servicos-contratados"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Meus Serviços
                          </Link>

                          <Link
                            to="/cadastrar-servico"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Cadastrar Serviço
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* PRODUTOS */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      alternarMenu('produtos')
                    }
                    className="flex items-center gap-1 hover:text-white/80 transition"
                  >
                    Produtos
                    <ChevronDown size={16} />
                  </button>

                  {menuAberto ===
                    'produtos' && (
                    <div className="absolute top-full left-0 mt-3 w-56 bg-white text-gray-800 rounded-lg shadow-xl border overflow-hidden">

                      <Link
                        to="/produtos"
                        onClick={fecharMenus}
                        className="block px-4 py-3 hover:bg-purple-50"
                      >
                        Ver Produtos
                      </Link>

                      {user && (
                        <>
                          <Link
                            to="/produtos-contratados"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Meus Produtos
                          </Link>

                          <Link
                            to="/cadastrar-produto"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Cadastrar Produto
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* COMIDAS */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      alternarMenu('comidas')
                    }
                    className="flex items-center gap-1 hover:text-white/80 transition"
                  >
                    Comidas
                    <ChevronDown size={16} />
                  </button>

                  {menuAberto ===
                    'comidas' && (
                    <div className="absolute top-full left-0 mt-3 w-56 bg-white text-gray-800 rounded-lg shadow-xl border overflow-hidden">

                      <Link
                        to="/comidas"
                        onClick={fecharMenus}
                        className="block px-4 py-3 hover:bg-purple-50"
                      >
                        Ver Comidas
                      </Link>

                      {user && (
                        <>
                          <Link
                            to="/comidas-contratadas"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Minhas Comidas
                          </Link>

                          <Link
                            to="/cadastrar-comida"
                            onClick={fecharMenus}
                            className="block px-4 py-3 hover:bg-purple-50"
                          >
                            Cadastrar Comida
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* CONVERSAS */}
                {user && (
                  <Link
                    to="/conversas"
                    onClick={fecharMenus}
                    className="flex items-center gap-1 hover:text-white/80 transition"
                  >
                    <MessageCircle size={17} />
                    Conversas
                  </Link>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() =>
                setShowSobre(true)
              }
              className="hover:text-white/80 transition"
            >
              Sobre Nós
            </button>

            <button
              type="button"
              onClick={() =>
                setShowContato(true)
              }
              className="hover:text-white/80 transition"
            >
              Contatos
            </button>

            {/* USUÁRIO */}
            <div className="flex items-center gap-2 border-l border-white/30 pl-4">

              {user &&
              profile?.self ? (
                <img
                  src={profile.self}
                  alt={
                    profile.nome ||
                    'Usuário'
                  }
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={22} />
                </div>
              )}

              {user && (
                <Link
                  to="/editar-perfil"
                  className="font-medium hover:text-white/80 max-w-32 truncate"
                >
                  {profile?.nome ||
                    'Meu Perfil'}
                </Link>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
                >
                  <LogOut size={17} />
                  Sair
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition"
                >
                  <LogIn size={17} />
                  Login
                </Link>
              )}
            </div>
          </nav>

          {/* =====================================
              BOTÃO HAMBÚRGUER MOBILE
          ====================================== */}
          <button
            type="button"
            onClick={() =>
              setMenuMobileAberto(true)
            }
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition"
            aria-label="Abrir menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* =====================================
          FUNDO ESCURO MOBILE
      ====================================== */}
      {menuMobileAberto && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
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
          md:hidden
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-5 flex items-center justify-between">
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
                <img
                  src={profile.self}
                  alt={
                    profile.nome ||
                    'Usuário'
                  }
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
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

                <div className="pl-3 border-l-2 border-purple-200 space-y-1">

                  <Link
                    to="/servicos"
                    onClick={fecharMenus}
                    className="block py-2 text-gray-600 hover:text-purple-600"
                  >
                    Ver Serviços
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/servicos-contratados"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-purple-600"
                      >
                        Meus Serviços
                      </Link>

                      <Link
                        to="/cadastrar-servico"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-purple-600"
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
                        to="/produtos-contratados"
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

                <div className="pl-3 border-l-2 border-orange-200 space-y-1">

                  <Link
                    to="/comidas"
                    onClick={fecharMenus}
                    className="block py-2 text-gray-600 hover:text-orange-600"
                  >
                    Ver Comidas
                  </Link>

                  {user && (
                    <>
                      <Link
                        to="/comidas-contratadas"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-orange-600"
                      >
                        Minhas Comidas
                      </Link>

                      <Link
                        to="/cadastrar-comida"
                        onClick={fecharMenus}
                        className="block py-2 text-gray-600 hover:text-orange-600"
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
                  className="flex items-center gap-3 py-3 px-3 mb-3 rounded-lg bg-purple-50 text-purple-700 font-semibold"
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
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-semibold"
              >
                <LogOut size={19} />
                Sair
              </button>
            ) : (
              <Link
                to="/login"
                onClick={fecharMenus}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg font-semibold"
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