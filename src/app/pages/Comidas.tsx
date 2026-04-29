import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Food, CATEGORIAS_COMIDA } from '../../types';
import { Search, Filter, UtensilsCrossed } from 'lucide-react';
import SobreModal from '../components/SobreModal';
import ContatoModal from '../components/ContatoModal';
import Header from '../components/Header';

export default function Comidas() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [comidas, setComidas] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bairroFilter, setBairroFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showSobre, setShowSobre] = useState(false);
  const [showContato, setShowContato] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    loadComidas();
  }, [searchTerm, bairroFilter, categoriaFilter]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('Food')
      .select('categoria');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    // Remove duplicadas
    const unique = [...new Set(data.map(item => item.categoria).filter(Boolean))];
    setCategorias(unique);
  };

  const loadComidas = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('Food')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchTerm) {
        query = query.ilike('nomeFood', `%${searchTerm}%`);
      }

      if (bairroFilter) {
        query = query.ilike('bairro', `%${bairroFilter}%`);
      }

      if (categoriaFilter) {
        query = query.ilike('categoria', categoriaFilter.toLowerCase());
      }

      const { data, error } = await query;

      if (error) throw error;
      setComidas(data || []);
    } catch (error) {
      console.error('Erro ao carregar comidas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Header showFullMenu={true} />

        <div className="container mx-auto px-4 py-8">

          {/* 🔥 HEADER MANTIDO */}
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <UtensilsCrossed className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Comidas</h1>
            </div>
            <p className="text-orange-100 text-lg">
              Descubra delícias e sabores da sua comunidade
            </p>
          </div>

          {/* FILTROS (PADRÃO SERVIÇOS) */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-orange-600" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              {/* Busca */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    placeholder="Nome da comida..."
                  />
                </div>
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairroFilter}
                  onChange={(e) => setBairroFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Filtrar por bairro..."
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria
                </label>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* LISTAGEM */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando comidas...</p>
            </div>
          ) : comidas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma comida encontrada</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comidas.map((comida) => (
                <div
                  key={comida.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
                >
                  {comida.foto && (
                    <img
                      src={comida.foto}
                      alt={comida.nomeFood || ''}
                      className="w-full h-48 object-cover"
                    />
                  )}

                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">
                      {comida.nomeFood}
                    </h3>

                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Vendedor:</strong> {comida.nome}
                    </p>

                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Bairro:</strong> {comida.bairro}
                    </p>

                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Categoria:</strong> {comida.categoria}
                    </p>

                    <Link
                      to={`/comidas/${comida.id}`}
                      className="block w-full text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
                    >
                      Ver detalhes
                    </Link>

                    {comida.valor && (
                      <p className="text-green-600 font-bold mt-2 text-center">
                        R$ {Number(comida.valor).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <SobreModal open={showSobre} onClose={() => setShowSobre(false)} />
      <ContatoModal open={showContato} onClose={() => setShowContato(false)} />
    </>
  );
}