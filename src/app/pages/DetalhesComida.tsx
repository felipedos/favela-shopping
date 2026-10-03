import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Food } from '../../types';
import Cabecalho from '../components/Cabecalho';
import Chat from '../components/chat/Chat';
import PrivateImage from '../components/PrivateImage';
import DetalheAnuncioDemonstrativo from '../components/DetalheAnuncioDemonstrativo';
import LayoutDetalheAnuncio, { type DadosDetalheAnuncio } from '../components/LayoutDetalheAnuncio';
import { ANUNCIOS_DEMONSTRATIVOS } from '../../mocks/dadosAnunciosDemonstrativos';

export default function DetalhesComida() {
  const { id } = useParams();
  const { user } = useAuth();
  const mockComida = ANUNCIOS_DEMONSTRATIVOS.find(
    (advertisement) => advertisement.categoryId === 'alimentacao' && advertisement.detailId === id,
  );
  const [comida, setComida] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatAberto, setChatAberto] = useState(false);

  useEffect(() => {
    if (mockComida) {
      setComida(null);
      setLoading(false);
    } else if (id) {
      setComida(null);
      setLoading(true);
      fetchComida();
    }
  }, [id, mockComida]);

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

  function abrirChat() {
    if (!user) {
      return;
    }

    setChatAberto(true);
  }

  if (mockComida) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <DetalheAnuncioDemonstrativo advertisement={mockComida} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!comida) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Comida não encontrada</h2>
          <Link to="/comidas" className="text-primary hover:underline mt-4 inline-block">
            Voltar para Comidas
          </Link>
        </div>
      </div>
    );
  }

  const detailItem: DadosDetalheAnuncio = {
    categoryId: 'alimentacao',
    detailId: comida.id,
    title: comida.nomeFood || 'Comida',
    description: comida.descricao,
    price: comida.valor,
    imageElement: comida.foto ? (
      <PrivateImage path={comida.foto} alt={comida.nomeFood || ''} className="h-full w-full object-cover" />
    ) : undefined,
    sellerName: comida.nome,
    location: comida.bairro,
    subcategory: comida.categoria,
  };

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <LayoutDetalheAnuncio item={detailItem} onContact={abrirChat}>
        {user && chatAberto && (
          <Chat
            prestadorId={comida.id_usuario}
            tipoAnuncio="comida"
            anuncioId={comida.id}
            nomeDestinatario={comida.nomeFood || comida.nome || 'Vendedor'}
            abertoInicialmente={true}
            onFechar={() => setChatAberto(false)}
          />
        )}
      </LayoutDetalheAnuncio>
    </div>
  );
}