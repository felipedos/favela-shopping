import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, MessageCircle, MapPin, UtensilsCrossed, Tag, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Food } from '../../types';
import Header from '../components/Header';

export default function DetalhesComida() {
  const { id } = useParams();
  const { user } = useAuth();
  const [comida, setComida] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchComida();
    }
  }, [id]);

  async function fetchComida() {
    try {
      const { data, error } = await supabase
        .from('Food')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setComida(data);
    } catch (error) {
      console.error('Erro ao buscar comida:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleWhatsAppClick() {
    if (!comida || !user) return;

    try {
      await supabase.from('Avaliacao').insert({
        emailCliente: user.email,
        emailVendedor: comida.email,
        foodId: comida.id,
        avaPrestador: 0,
        avaConsumidor: 0,
      });

      const mensagem = encodeURIComponent(
        `Eu vim pelo aplicativo 'Favela Shopping' e gostaria de pedir: ${comida.nomeFood}`
      );
      const whatsapp = `https://wa.me/55${comida.ddd}${comida.whatsapp}?text=${mensagem}`;
      window.open(whatsapp, '_blank');
    } catch (error) {
      console.error('Erro ao registrar contato:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!comida) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Comida não encontrada</h2>
          <Link to="/comidas" className="text-orange-600 hover:underline mt-4 inline-block">
            Voltar para Comidas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link
          to="/comidas"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Comidas
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {comida.foto && (
            <div className="h-96 overflow-hidden">
              <img
                src={comida.foto}
                alt={comida.nomeFood}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{comida.nomeFood}</h1>
                <div className="flex items-center gap-2 text-orange-600 font-semibold">
                  <Tag className="w-5 h-5" />
                  {comida.categoria}
                </div>
              </div>
              {comida.valor && (
                <div className="text-right">
                  <p className="text-gray-600 text-sm mb-1">Valor</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {Number(comida.valor).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {comida.descricao && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Descrição
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {comida.descricao}
                </p>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Vendedor</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Nome:</span> {comida.nome}
                </p>
                <p className="text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Bairro:</span> {comida.bairro}
                </p>
                {comida.cep && (
                  <p className="text-gray-700">
                    <span className="font-medium">CEP:</span> {comida.cep}
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
                  className="inline-block bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
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