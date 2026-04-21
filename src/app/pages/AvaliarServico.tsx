import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Avaliacao } from '../../types';
import Header from '../components/Header';
import StarRating from '../components/StarRating';
import { ArrowLeft } from 'lucide-react';

export default function AvaliarServico() {
  const { id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvaliacao();
  }, [id]);

  const loadAvaliacao = async () => {
    try {
      const { data, error } = await supabase.from('Avaliacao').select('*').eq('id', id).single();

      if (error) throw error;
      setAvaliacao(data);

      const isCliente = data.emailCliente === profile?.email;
      setRating(isCliente ? (data.avaPrestador || 0) : (data.avaConsumidor || 0));
    } catch (error) {
      console.error('Error loading avaliacao:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!avaliacao) return;

    setSaving(true);
    try {
      const isCliente = avaliacao.emailCliente === profile?.email;
      const updateData = isCliente
        ? { avaPrestador: rating }
        : { avaConsumidor: rating };

      const { error } = await supabase.from('Avaliacao').update(updateData).eq('id', id);

      if (error) throw error;

      alert('Avaliação salva com sucesso!');
      navigate(-1);
    } catch (error) {
      alert('Erro ao salvar avaliação');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!avaliacao) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Avaliação não encontrada</p>
        </div>
      </div>
    );
  }

  const isCliente = avaliacao.emailCliente === profile?.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-purple-600">Avaliar Serviço</h1>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Serviço</p>
              <p className="text-lg font-semibold">{avaliacao.nomeServico}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">{isCliente ? 'Prestador' : 'Cliente'}</p>
              <p className="text-lg font-semibold">
                {isCliente ? avaliacao.nomeServico : avaliacao.nomeCliente}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Bairro</p>
              <p className="text-lg font-semibold">
                {isCliente ? avaliacao.bairroServico : avaliacao.bairroCliente}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Data do contato</p>
              <p className="text-lg font-semibold">
                {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="pt-4">
              <p className="text-sm text-gray-600 mb-2">Sua avaliação</p>
              <StarRating rating={rating} onRatingChange={setRating} />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || rating === 0}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Avaliação'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}