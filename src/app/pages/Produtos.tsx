import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Produto, CATEGORIAS_PRODUTO } from '../../types';
import Header from '../components/Header';

export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBairro, setSelectedBairro] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [bairros, setBairros] = useState<string[]>([]);

  useEffect(() => {
    fetchProdutos();
    fetchBairros();
  }, []);

  async function fetchProdutos() {
    try {
      const { data, error } = await supabase
        .from('Produto')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(10);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBairros() {
    try {
      const { data, error } = await supabase
        .from('Produto')
        .select('bairro')
        .not('bairro', 'is', null);

      if (error) throw error;
      const uniqueBairros = [...new Set(data?.map(item => item.bairro))].filter(Boolean);
      setBairros(uniqueBairros as string[]);
    } catch (error) {
      console.error('Erro ao buscar bairros:', error);
    }
  }

  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nomeProduto?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBairro = !selectedBairro || produto.bairro === selectedBairro;
    const matchesCategoria = !selectedCategoria || produto.categoria === selectedCategoria;
    return matchesSearch && matchesBairro && matchesCategoria;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-sky-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Produtos</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Encontre produtos de qualidade na sua comunidade
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todos os bairros</option>
                {bairros.map(bairro => (
                  <option key={bairro} value={bairro}>{bairro}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">Todas as categorias</option>
                {CATEGORIAS_PRODUTO.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Carregando produtos...</p>
          </div>
        ) : filteredProdutos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProdutos.map(produto => (
              <Link
                key={produto.id}
                to={`/produtos/${produto.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {produto.foto && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={produto.foto}
                      alt={produto.nomeProduto}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-800 mb-2 line-clamp-1">
                    {produto.nomeProduto}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Vendedor:</span> {produto.nome}
                  </p>
                  <p className="text-gray-600 mb-1">
                    <span className="font-medium">Bairro:</span> {produto.bairro}
                  </p>
                  <p className="text-blue-600 font-semibold">
                    {produto.categoria}
                  </p>
                  {produto.valor && (
                    <p className="text-green-600 font-bold text-lg mt-2">
                      R$ {Number(produto.valor).toFixed(2)}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}