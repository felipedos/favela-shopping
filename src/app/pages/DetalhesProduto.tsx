import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, MessageCircle, MapPin, Package, Tag, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Produto } from '../../types';
import Header from '../components/Header';

export default function DetalhesProduto() {
  const { id } = useParams();
  const { user } = useAuth();
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduto();
    }
  }, [id]);

  async function fetchProduto() {
    try {
      const { data, error } = await supabase
        .from('Produto')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduto(data);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWhatsAppClick() {
    if (!produto || !user) return;

    try {
      await supabase.from('Avaliacao').insert({
        emailCliente: user.email,
        emailVendedor: produto.email,
        produtoId: produto.id,
        avaPrestador: 0,
        avaConsumidor: 0,
      });

      const mensagem = encodeURIComponent(
        `Eu vim pelo aplicativo 'Favela Shopping' e gostaria de comprar seu produto: ${produto.nomeProduto}`
      );
      const whatsapp = `https://wa.me/55${produto.ddd}${produto.whatsapp}?text=${mensagem}`;
      window.open(whatsapp, '_blank');
    } catch (error) {
      console.error('Erro ao registrar contato:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Produto não encontrado</h2>
          <Link to="/produtos" className="text-blue-600 hover:underline mt-4 inline-block">
            Voltar para Produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Produtos
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {produto.foto && (
            <div className="h-96 overflow-hidden">
              <img
                src={produto.foto}
                alt={produto.nomeProduto}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{produto.nomeProduto}</h1>
                <div className="flex items-center gap-2 text-blue-600 font-semibold">
                  <Tag className="w-5 h-5" />
                  {produto.categoria}
                </div>
              </div>
              {produto.valor && (
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-1">Valor</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {Number(produto.valor).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {produto.descricao && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Descrição
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {produto.descricao}
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Vendedor</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Nome:</span> {produto.nome}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Bairro:</span> {produto.bairro}
                </p>
                {produto.cep && (
                  <p className="text-gray-700">
                    <span className="font-medium">CEP:</span> {produto.cep}
                  </p>
                )}
              </div>
            </div>

            {user ? (
              <button
                onClick={handleWhatsAppClick}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
                Entrar em Contato pelo WhatsApp
              </button>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-yellow-800 mb-3">
                  Faça login para entrar em contato com o vendedor
                </p>
                <Link
                  to="/login-cadastro"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Fazer Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}