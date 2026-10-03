import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Produto } from '../../types';
import Chat from '../components/chat/Chat';
import Cabecalho from '../components/Cabecalho';
import PrivateImage from '../components/PrivateImage';
import DetalheAnuncioDemonstrativo from '../components/DetalheAnuncioDemonstrativo';
import LayoutDetalheAnuncio, { type DadosDetalheAnuncio } from '../components/LayoutDetalheAnuncio';
import { ANUNCIOS_DEMONSTRATIVOS } from '../../mocks/dadosAnunciosDemonstrativos';

export default function DetalhesProduto() {
  const { id } = useParams();
  const { user } = useAuth();
  const mockProduto = ANUNCIOS_DEMONSTRATIVOS.find(
    (advertisement) => advertisement.categoryId === 'produtos' && advertisement.detailId === id,
  );
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatAberto, setChatAberto] = useState(false);

  const abrirChat = () => {
    if (!user) {
      return;
    }

    setChatAberto(true);
  };

  useEffect(() => {
    if (mockProduto) {
      setProduto(null);
      setLoading(false);
    } else if (id) {
      setProduto(null);
      setLoading(true);
      fetchProduto();
    }
  }, [id, mockProduto]);

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

  async function abrirConversaWhatsApp() {
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

  if (mockProduto) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <DetalheAnuncioDemonstrativo advertisement={mockProduto} />
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

  if (!produto) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Produto não encontrado</h2>
          <Link to="/produtos" className="text-primary hover:underline mt-4 inline-block">
            Voltar para Produtos
          </Link>
        </div>
      </div>
    );
  }

  const detailItem: DadosDetalheAnuncio = {
    categoryId: 'produtos',
    detailId: produto.id,
    title: produto.nomeProduto || 'Produto',
    description: produto.descricao,
    price: produto.valor === null ? null : Number(produto.valor),
    imageElement: produto.foto ? (
      <PrivateImage path={produto.foto} alt={produto.nomeProduto || ''} className="h-full w-full object-cover" />
    ) : undefined,
    sellerName: produto.nome,
    location: produto.bairro,
    subcategory: produto.categoria,
  };

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho />
      <LayoutDetalheAnuncio item={detailItem} onContact={abrirChat}>
        {user && chatAberto && (
          <Chat
            prestadorId={produto.id_usuario}
            tipoAnuncio="produto"
            anuncioId={produto.id}
            nomeDestinatario={produto.nome || 'Vendedor'}
            abertoInicialmente={true}
            onFechar={() => setChatAberto(false)}
          />
        )}
      </LayoutDetalheAnuncio>
    </div>
  );
}