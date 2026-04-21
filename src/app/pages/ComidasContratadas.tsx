import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { UtensilsCrossed, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';

interface ComidaContratada {
  id: string;
  emailCliente: string;
  emailVendedor: string;
  foodId: string;
  avaPrestador: number;
  avaConsumidor: number;
  createdAt: string;
  Food: {
    nomeFood: string;
    categoria: string;
    foto: string | null;
  };
}

export default function ComidasContratadas() {
  const { user } = useAuth();
  const [comidas, setComidas] = useState<ComidaContratada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchComidasContratadas();
    }
  }, [user]);

  async function fetchComidasContratadas() {
    try {
      const { data, error } = await supabase
        .from('Avaliacao')
        .select(`
          *,
          Food:foodId (
            nomeFood,
            categoria,
            foto
          )
        `)
        .or(`emailCliente.eq.${user?.email},emailVendedor.eq.${user?.email}`)
        .not('foodId', 'is', null)
        .order('createdAt', { ascending: false });

      if (error) throw error;
      setComidas(data || []);
    } catch (error) {
      console.error('Erro ao buscar comidas contratadas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Faça login para ver suas comidas</h2>
          <Link to="/login-cadastro" className="text-orange-600 hover:underline">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <UtensilsCrossed className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Minhas Comidas</h1>
          </div>
          <p className="text-orange-100 text-lg">
            Comidas que você pediu ou vendeu
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando comidas...</p>
          </div>
        ) : comidas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma comida ainda</h3>
            <p className="text-gray-500 mb-6">
              Explore comidas e entre em contato com vendedores
            </p>
            <Link
              to="/comidas"
              className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Explorar Comidas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comidas.map(item => {
              const isCliente = item.emailCliente === user.email;
              const isAvaliado = isCliente ? item.avaPrestador > 0 : item.avaConsumidor > 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {item.Food?.foto && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={item.Food.foto}
                        alt={item.Food.nomeFood}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">
                      {item.Food?.nomeFood}
                    </h3>
                    <p className="text-orange-600 font-semibold mb-2">
                      {item.Food?.categoria}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Função:</span>{' '}
                      {isCliente ? 'Cliente' : 'Vendedor'}
                    </p>
                    <p className="text-gray-500 text-sm mb-4">
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </p>

                    {isAvaliado ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-medium">Já avaliado</span>
                      </div>
                    ) : (
                      <Link
                        to={`/avaliar-comida/${item.id}`}
                        className="block w-full bg-orange-600 text-white text-center py-2 rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Avaliar {isCliente ? 'Vendedor' : 'Cliente'}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}