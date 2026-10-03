import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Pencil,
  Plus,
  UtensilsCrossed,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import Cabecalho from '../components/Cabecalho';
import PrivateImage from '../components/PrivateImage';

interface Comida {
  id: number;
  nomeFood: string | null;
  categoria: string | null;
  descricao: string | null;
  valor: number | null;
  foto: string | null;
}

export default function MinhasComidas() {
  const navigate = useNavigate();

  const {
    user,
    userProfile,
    loading: authLoading,
  } = useAuth();

  const [comidas, setComidas] = useState<Comida[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregarComidas() {
      if (authLoading) {
        return;
      }

      if (!user) {
        navigate('/login-cadastro');
        return;
      }

      if (!userProfile) {
        setErro('Não foi possível identificar seu perfil.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        const { data, error } = await supabase
          .from('Food')
          .select(`
            id,
            nomeFood,
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

        setComidas(data || []);
      } catch (error) {
        console.error(
          'Erro ao carregar comidas do vendedor:',
          error
        );

        setErro(
          'Não foi possível carregar seus anúncios de comida.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarComidas();
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <Cabecalho showFullMenu />

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-gray-600">
            Carregando suas comidas...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Cabecalho showFullMenu />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate('/comidas')}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Comidas
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-3 rounded-lg">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Minhas Comidas
              </h1>

              <p className="text-gray-600">
                Gerencie seus anúncios e cardápios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/cadastrar-comida')}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-5 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Cadastrar nova comida
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {erro}
          </div>
        )}

        {!erro && comidas.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <UtensilsCrossed className="w-12 h-12 text-orange-500 mx-auto mb-4" />

            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Você ainda não possui anúncios de comida
            </h2>

            <p className="text-gray-600 mb-6">
              Cadastre sua primeira comida para começar.
            </p>

            <button
              type="button"
              onClick={() => navigate('/cadastrar-comida')}
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-orange-700"
            >
              <Plus className="w-5 h-5" />
              Cadastrar comida
            </button>
          </div>
        )}

        {!erro && comidas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {comidas.map((comida) => (
              <div
                key={comida.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
              >
                <div className="h-52 bg-gray-100">
                  {comida.foto ? (
                    <PrivateImage
                      path={comida.foto}
                      alt={comida.nomeFood || 'Comida'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-400">
                      <UtensilsCrossed className="w-14 h-14" />
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {comida.nomeFood || 'Comida sem nome'}
                    </h2>

                    {comida.categoria && (
                      <p className="text-sm text-orange-600 font-medium mt-1">
                        {comida.categoria}
                      </p>
                    )}

                    {comida.descricao && (
                      <p className="text-gray-600 mt-3 line-clamp-3">
                        {comida.descricao}
                      </p>
                    )}

                    <p className="text-lg font-bold text-gray-800 mt-4">
                      {formatarValor(comida.valor)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/editar-comida/${comida.id}`)
                      }
                      className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar anúncio
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/catalogo/comida/${comida.id}`)
                      }
                      className="flex items-center justify-center gap-2 bg-orange-50 text-orange-700 px-4 py-3 rounded-lg font-semibold hover:bg-orange-100 transition"
                    >
                      <BookOpen className="w-4 h-4" />
                      Cardápio
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