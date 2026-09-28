import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Save,
  UtensilsCrossed,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIAS_COMIDA } from '../../types';

import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';

export default function EditarComida() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    user,
    userProfile,
    loading: authLoading,
  } = useAuth();

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState<string | null>(null);

  const [foto, setFoto] = useState('');

  const [formData, setFormData] =
    useState({
      nomeFood: '',
      categoria: '',
      descricao: '',
      valor: '',
    });

  const idComida = Number(id);

  const idValido =
    Number.isInteger(idComida) &&
    idComida > 0;

  useEffect(() => {
    async function carregarComida() {
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

      if (!idValido) {
        setErro('Comida inválida.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        /*
         * Primeiro buscamos o ID do usuário da
         * tabela public.User.
         *
         * O catálogo já utiliza id_usuario para
         * identificar o proprietário do anúncio.
         */
        const {
          data: usuarioApp,
          error: usuarioError,
        } = await supabase
          .from('User')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (usuarioError) {
          throw usuarioError;
        }

        if (!usuarioApp) {
          setErro(
            'Usuário não encontrado.'
          );

          return;
        }

        /*
         * Carregamos somente o anúncio solicitado.
         */
        const {
          data: comida,
          error: comidaError,
        } = await supabase
          .from('Food')
          .select(
            `
              id,
              id_usuario,
              nomeFood,
              categoria,
              descricao,
              valor,
              foto
            `
          )
          .eq('id', idComida)
          .maybeSingle();

        if (comidaError) {
          throw comidaError;
        }

        if (!comida) {
          setErro(
            'Comida não encontrada.'
          );

          return;
        }

        /*
         * Proteção adicional no Front-end.
         *
         * A segurança definitiva também deve
         * existir no RLS do Supabase.
         */
        if (
          Number(comida.id_usuario) !==
          Number(usuarioApp.id)
        ) {
          setErro(
            'Você não tem permissão para editar esta comida.'
          );

          return;
        }

        setFormData({
          nomeFood:
            comida.nomeFood || '',

          categoria:
            comida.categoria || '',

          descricao:
            comida.descricao || '',

          valor:
            comida.valor !== null &&
            comida.valor !== undefined
              ? String(comida.valor)
              : '',
        });

        setFoto(comida.foto || '');
      } catch (error) {
        console.error(
          'Erro ao carregar comida:',
          error
        );

        setErro(
          'Não foi possível carregar os dados da comida.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarComida();
  }, [
    authLoading,
    user,
    userProfile,
    idComida,
    idValido,
    navigate,
  ]);

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !user ||
      !userProfile ||
      !idValido
    ) {
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      const valorNumerico =
        formData.valor.trim()
          ? Number(
              formData.valor.replace(
                ',',
                '.'
              )
            )
          : null;

      if (
        valorNumerico !== null &&
        (!Number.isFinite(
          valorNumerico
        ) ||
          valorNumerico < 0)
      ) {
        setErro(
          'Informe um valor válido.'
        );

        return;
      }

      const { error } = await supabase
        .from('Food')
        .update({
          nomeFood:
            formData.nomeFood.trim(),

          categoria:
            formData.categoria,

          descricao:
            formData.descricao.trim(),

          valor: valorNumerico,

          foto: foto || null,
        })
        .eq('id', idComida);

      if (error) {
        throw error;
      }

      alert(
        'Comida atualizada com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar comida:',
        error
      );

      setErro(
        'Não foi possível atualizar a comida.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (authLoading || carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
        <Header />

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-gray-600">
            Carregando comida...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />

          Voltar
        </button>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {erro}
          </div>
        )}

        {!erro && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-3 rounded-lg">
                  <UtensilsCrossed className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Editar Comida
                  </h1>

                  <p className="text-gray-600">
                    Atualize os dados do seu
                    anúncio
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Foto da Comida
                  </label>

                  <ImageUpload
                    bucket="food"
                    onUpload={setFoto}
                    currentImage={foto}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nome da Comida *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.nomeFood
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeFood:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Feijoada Completa"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Categoria *
                  </label>

                  <select
                    required
                    value={
                      formData.categoria
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoria:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">
                      Selecione uma
                      categoria
                    </option>

                    {CATEGORIAS_COMIDA.map(
                      (cat) => (
                        <option
                          key={cat}
                          value={cat}
                        >
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Descrição
                  </label>

                  <textarea
                    value={
                      formData.descricao
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descricao:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={5}
                    placeholder="Descreva sua comida, ingredientes, porções, horários de entrega..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Valor (R$)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valor:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />

                  {salvando
                    ? 'Salvando...'
                    : 'Salvar alterações'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-orange-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    Cardápio
                  </h2>

                  <p className="text-gray-600 mt-1">
                    Cadastre categorias,
                    opções, pratos e outros
                    itens oferecidos neste
                    anúncio.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/catalogo/comida/${idComida}`
                      )
                    }
                    className="mt-4 bg-orange-50 text-orange-700 hover:bg-orange-100 px-5 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Gerenciar cardápio
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}