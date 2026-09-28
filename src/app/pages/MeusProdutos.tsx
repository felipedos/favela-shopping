import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Package,
  Pencil,
  Plus,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import Header from '../components/Header';
import PrivateImage from '../components/PrivateImage';

interface Produto {
  id: number;
  nomeProduto: string | null;
  categoria: string | null;
  descricao: string | null;
  valor: number | null;
  foto: string | null;
}

export default function MeusProdutos() {
  const navigate = useNavigate();

  const {
    user,
    userProfile,
    loading: authLoading,
  } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarProdutos() {
      if (authLoading) {
        return;
      }

      if (!user) {
        navigate('/login-cadastro');
        return;
      }

      if (!userProfile) {
        setErro(
          'Não foi possível identificar seu perfil.'
        );

        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        const { data, error } = await supabase
          .from('Produto')
          .select(`
            id,
            nomeProduto,
            categoria,
            descricao,
            valor,
            foto
          `)
          .eq('id_usuario', userProfile.id)
          .order('id', { ascending: false });

        if (error) {
          throw error;
        }

        setProdutos(data || []);
      } catch (error) {
        console.error(
          'Erro ao carregar produtos do vendedor:',
          error
        );

        setErro(
          'Não foi possível carregar seus anúncios de produtos.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarProdutos();
  }, [
    authLoading,
    user,
    userProfile,
    navigate,
  ]);

  function formatarValor(valor: number | null) {
    if (valor === null || valor === undefined) {
      return 'Valor não informado';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor));
  }

  if (authLoading || carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Header showFullMenu />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-gray-600">
            Carregando seus produtos...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header showFullMenu />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate('/produtos')}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Produtos
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Meus Produtos
              </h1>

              <p className="text-gray-600">
                Gerencie seus anúncios e catálogos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/cadastrar-produto')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white px-5 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-sky-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Cadastrar novo produto
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {erro}
          </div>
        )}

        {!erro && produtos.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Package className="w-12 h-12 text-blue-500 mx-auto mb-4" />

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Você ainda não possui anúncios de produtos
            </h2>

            <p className="text-gray-600 mb-6">
              Cadastre seu primeiro produto para começar.
            </p>

            <button
              type="button"
              onClick={() => navigate('/cadastrar-produto')}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Cadastrar produto
            </button>
          </div>
        )}

        {!erro && produtos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="h-52 bg-gray-100">
                  {produto.foto ? (
                    <PrivateImage
                      path={produto.foto}
                      alt={produto.nomeProduto || 'Produto'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-400">
                      <Package className="w-14 h-14" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {produto.nomeProduto || 'Produto sem nome'}
                    </h2>

                    {produto.categoria && (
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        {produto.categoria}
                      </p>
                    )}

                    {produto.descricao && (
                      <p className="text-gray-600 mt-3 line-clamp-3">
                        {produto.descricao}
                      </p>
                    )}

                    <p className="text-lg font-bold text-gray-800 mt-4">
                      {formatarValor(produto.valor)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/editar-produto/${produto.id}`)
                      }
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar anúncio
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/catalogo/produto/${produto.id}`)
                      }
                      className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg font-semibold hover:bg-blue-100 transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Catálogo
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}