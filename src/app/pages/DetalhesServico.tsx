import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Servico } from '../../types';
import Cabecalho from '../components/Cabecalho';
import Chat from '../components/chat/Chat';
import PrivateImage from '../components/PrivateImage';
import { ANUNCIOS_DEMONSTRATIVOS, type Anuncio } from '../../mocks/dadosAnunciosDemonstrativos';
import DetalheAnuncioDemonstrativo from '../components/DetalheAnuncioDemonstrativo';
import LayoutDetalheAnuncio, { type DadosDetalheAnuncio } from '../components/LayoutDetalheAnuncio';

type AnuncioDemonstrativoServico = Extract<Anuncio, { categoryId: 'servicos' }>;

export default function DetalhesServico() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [servico, setServico] = useState<Servico | null>(null);
  const [mockServico, setMockServico] = useState<AnuncioDemonstrativoServico | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatAberto, setChatAberto] = useState(false);

  useEffect(() => {
    const mockMatch = ANUNCIOS_DEMONSTRATIVOS.find(
      (advertisement): advertisement is AnuncioDemonstrativoServico =>
        advertisement.categoryId === 'servicos' && advertisement.detailId === id,
    );

    if (mockMatch) {
      setMockServico(mockMatch);
      setServico(null);
      setLoading(false);
      return;
    }

    setMockServico(null);
    setLoading(true);
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

  const handleAbrirChat = () => {
    if (!user) {
      return;
    }

    setChatAberto(true);
  };

  if (mockServico) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <DetalheAnuncioDemonstrativo advertisement={mockServico} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!servico) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Serviço não encontrado</p>
        </div>
      </div>
    );
  }

  const detailItem: DadosDetalheAnuncio = {
    categoryId: 'servicos',
    detailId: servico.id,
    title: servico.nomeServico || servico.nome || 'Serviço',
    description: servico.descricao,
    price: servico.valor,
    imageElement: servico.foto ? (
      <PrivateImage path={servico.foto} alt={servico.nomeServico || ''} className="h-full w-full object-cover" />
    ) : undefined,
    imageIsAvatar: Boolean(servico.foto),
    sellerName: servico.nome,
    location: servico.bairro,
    subcategory: servico.categoria,
    startTime: servico.inico,
    endTime: servico.fim,
  };

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <LayoutDetalheAnuncio item={detailItem} onContact={handleAbrirChat}>
        {user && chatAberto && (
          <Chat
            prestadorId={servico.id_usuario}
            tipoAnuncio="servico"
            anuncioId={servico.id}
            nomeDestinatario={servico.nomeServico || servico.nome || 'Prestador'}
            abertoInicialmente={true}
            onFechar={() => setChatAberto(false)}
          />
        )}
      </LayoutDetalheAnuncio>
    </div>
  );
}