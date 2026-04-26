import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Servico, CATEGORIAS_SERVICO } from '../../types';
import {  Wrench, LogOut, Search, Filter } from 'lucide-react';
import SobreModal from '../components/SobreModal';
import ContatoModal from '../components/ContatoModal';
import Header from '../components/Header';

export default function Servicos() {
  const { user, signOut, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bairroFilter, setBairroFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showSobre, setShowSobre] = useState(false);
  const [showContato, setShowContato] = useState(false);

  useEffect(() => {
    loadServicos();
  }, [searchTerm, bairroFilter, categoriaFilter]);

  const loadServicos = async () => {
    setLoading(true);
    try {
      let query = supabase.from('Servico').select('*').order('created_at', { ascending: false }).limit(10);

      if (searchTerm) {
        query = query.ilike('nomeServico', `%${searchTerm}%`);
      }

      if (bairroFilter) {
        query = query.eq('bairro', bairroFilter);
      }

      if (categoriaFilter) {
        query = query.eq('categoria', categoriaFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServicos(data || []);
    } catch (error) {
      console.error('Error loading servicos:', error);
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

            <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
                <Wrench className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Serviços</h1>
            </div>
            <p className="text-green-100 text-lg">
                Encontre profissionais e serviços na sua comunidade
            </p>
            </div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-purple-600" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nome do serviço..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairroFilter}
                  onChange={(e) => setBairroFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Filtrar por bairro..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {CATEGORIAS_SERVICO.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando serviços...</p>
            </div>
          ) : servicos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicos.map((servico) => (
                <div key={servico.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                  {servico.foto && (
                    <img src={servico.foto} alt={servico.nomeServico || ''} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-2">{servico.nomeServico}</h3>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Prestador:</strong> {servico.nome}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Bairro:</strong> {servico.bairro}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Categoria:</strong> {servico.categoria}
                    </p>
                    <Link
                      to={`/servicos/${servico.id}`}
                      className="block w-full text-center bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Contactar
                    </Link>
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