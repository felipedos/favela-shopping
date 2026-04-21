import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Servico } from '../../types';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Header from '../components/Header';

export default function DetalhesServico() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [servico, setServico] = useState<Servico | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServico();
  }, [id]);

  const loadServico = async () => {
    try {
      const { data, error } = await supabase.from('Servico').select('*').eq('id', id).single();

      if (error) throw error;
      setServico(data);
    } catch (error) {
      console.error('Error loading servico:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactar = async () => {
    if (!servico) return;

    if (user && profile) {
      await supabase.from('Avaliacao').insert({
        id_servico: servico.id,
        emailCliente: profile.email,
        emailPrestador: servico.email,
        nomeCliente: profile.nome,
        nomeServico: servico.nomeServico,
        bairroCliente: profile.bairro,
        bairroServico: servico.bairro,
        Tipo: 'servico',
        created_at: new Date().toISOString(),
      });
    }

    const mensagem = encodeURIComponent(
      `Eu vim pelo aplicativo 'Favela Shopping' e gostaria de contratar seus serviços`
    );
    const whatsapp = `https://wa.me/55${servico.ddd}${servico.whatsapp}?text=${mensagem}`;
    window.open(whatsapp, '_blank');
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

  if (!servico) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Serviço não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {servico.foto && (
            <img src={servico.foto} alt={servico.nomeServico || ''} className="w-full h-96 object-cover" />
          )}

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-purple-600">{servico.nomeServico}</h1>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600">Prestador</p>
                <p className="font-semibold">{servico.nome}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Bairro</p>
                <p className="font-semibold">{servico.bairro}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Categoria</p>
                <p className="font-semibold">{servico.categoria}</p>
              </div>

              {servico.valor && (
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-semibold">R$ {servico.valor.toFixed(2)}</p>
                </div>
              )}
            </div>

            {servico.descricao && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Descrição</h2>
                <p className="text-gray-700">{servico.descricao}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                <ArrowLeft size={20} />
                Voltar
              </button>

              <button
                onClick={handleContactar}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <MessageCircle size={20} />
                Contactar via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}