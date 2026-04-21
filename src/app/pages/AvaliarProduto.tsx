import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';
import StarRating from '../components/StarRating';

interface AvaliacaoData {
  id: string;
  emailCliente: string;
  emailVendedor: string;
  avaPrestador: number;
  avaConsumidor: number;
  createdAt: string;
  Produto: {
    nomeProduto: string;
    categoria: string;
    foto: string | null;
  };
}

export default function AvaliarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avaliacao, setAvaliacao] = useState<AvaliacaoData | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchAvaliacao();
    }
  }, [id, user]);

  async function fetchAvaliacao() {
    try {
      const { data, error } = await supabase
        .from('Avaliacao')
        .select(`
          *,
          Produto:produtoId (
            nomeProduto,
            categoria,
            foto
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setAvaliacao(data);
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!avaliacao || rating === 0) return;

    setSubmitting(true);
    try {
      const isCliente = avaliacao.emailCliente === user?.email;
      const updateField = isCliente ? 'avaPrestador' : 'avaConsumidor';

      const { error } = await supabase
        .from('Avaliacao')
        .update({ [updateField]: rating })
        .eq('id', id);

      if (error) throw error;

      alert('Avaliação enviada com sucesso!');
      navigate('/produtos-contratados');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Faça login para avaliar</h2>
        </div>
      </div>
    );
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

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Avaliação não encontrada</h2>
        </div>
      </div>
    );
  }

  const isCliente = avaliacao.emailCliente === user.email;
  const jaAvaliado = isCliente ? avaliacao.avaPrestador > 0 : avaliacao.avaConsumidor > 0;

  if (jaAvaliado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Você já avaliou este produto</h2>
          <button
            onClick={() => navigate('/produtos-contratados')}
            className="text-blue-600 hover:underline"
          >
            Voltar para Meus Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {avaliacao.Produto?.foto && (
            <div className="h-64 overflow-hidden">
              <img
                src={avaliacao.Produto.foto}
                alt={avaliacao.Produto.nomeProduto}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-3 rounded-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Avaliar Produto</h1>
                <p className="text-gray-600">
                  Como foi sua experiência com este produto?
                </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-xl text-gray-800 mb-2">
                {avaliacao.Produto?.nomeProduto}
              </h3>
              <p className="text-blue-600 font-semibold mb-2">
                {avaliacao.Produto?.categoria}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Data:</span>{' '}
                {new Date(avaliacao.createdAt).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Você é o:</span>{' '}
                {isCliente ? 'Comprador' : 'Vendedor'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <label className="block text-gray-700 font-medium mb-4 text-lg">
                  Avalie o {isCliente ? 'vendedor' : 'comprador'}
                </label>
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    onRatingChange={setRating}
                    size="large"
                  />
                </div>
                <p className="text-gray-500 mt-2">
                  {rating === 0 && 'Clique nas estrelas para avaliar'}
                  {rating > 0 && `Você deu ${rating} estrela${rating > 1 ? 's' : ''}`}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {submitting ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}