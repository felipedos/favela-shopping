import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import SobreModal from './SobreModal';
import ContatoModal from './ContatoModal';

interface HeaderProps {
  showFullMenu?: boolean;
}

export default function Header({ showFullMenu = false }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showSobre, setShowSobre] = useState(false);
  const [showContato, setShowContato] = useState(false);

  // Debug: ver se o usuário está sendo carregado
  console.log('🔍 Header DEBUG:', {
    user: user?.email || 'NÃO LOGADO',
    profile: profile?.nome || 'SEM PERFIL',
    hasUser: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between flex-wrap gap-4">
          <Link to="/" className="text-2xl font-bold">
            Favela Shopping
          </Link>

          <nav className="flex items-center gap-4 flex-wrap">
            {showFullMenu && (
              <>
                <Link to="/servicos" className="hover:underline">
                  Serviços
                </Link>
                <Link to="/produtos" className="hover:underline">
                  Produtos
                </Link>
                <Link to="/comidas" className="hover:underline">
                  Comidas
                </Link>
              </>
            )}

            <button onClick={() => setShowSobre(true)} className="hover:underline">
              Sobre Nós
            </button>
            <button onClick={() => setShowContato(true)} className="hover:underline">
              Contatos
            </button>

            <div className="flex items-center gap-2 border-l pl-4">
              {user && profile?.self ? (
                <img
                  src={profile.self}
                  alt={profile.nome || 'Usuário'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={24} />
                </div>
              )}

              {user && (
                <Link
                  to="/editar-perfil"
                  className="font-medium hover:text-white/80 transition"
                  title="Editar meu perfil"
                >
                  {profile?.nome || 'Meu Perfil'}
                </Link>
              )}

              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login-cadastro"
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                >
                  <LogIn size={18} />
                  Login
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>

      <SobreModal open={showSobre} onClose={() => setShowSobre(false)} />
      <ContatoModal open={showContato} onClose={() => setShowContato(false)} />
    </>
  );
}
