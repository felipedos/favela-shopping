import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  BookOpen,
  Package,
  Save,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIAS_PRODUTO } from '../../types';

import Cabecalho from '../components/Cabecalho';
import ImageUpload from '../components/ImageUpload';

export default function EditarProduto() {
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
      nomeProduto: '',
      categoria: '',
      descricao: '',
      valor: '',
    });

  const idProduto = Number(id);

  const idValido =
    Number.isInteger(idProduto) &&
    idProduto > 0;

  useEffect(() => {
    async function carregarProduto() {
      // Aguarda o AuthContext restaurar
      // a sessão e carregar o perfil.
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
        setErro('Produto inválido.');
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);
        setErro(null);

        /*
         * Carrega somente o produto
         * solicitado pela URL.
         */
        const {
          data: produto,
          error: produtoError,
        } = await supabase
          .from('Produto')
          .select(`
            id,
            id_usuario,
            nomeProduto,
            categoria,
            descricao,
            valor,
            foto
          `)
          .eq('id', idProduto)
          .maybeSingle();

        if (produtoError) {
          throw produtoError;
        }

        if (!produto) {
          setErro(
            'Produto não encontrado.'
          );

          return;
        }

        /*
         * Proteção adicional no Front-end.
         *
         * Somente o proprietário do anúncio
         * pode abrir o formulário de edição.
         *
         * A proteção definitiva também deve
         * existir no RLS do Supabase.
         */
        if (
          Number(produto.id_usuario) !==
          Number(userProfile.id)
        ) {
          setErro(
            'Você não tem permissão para editar este produto.'
          );

          return;
        }

        setFormData({
          nomeProduto:
            produto.nomeProduto || '',

          categoria:
            produto.categoria || '',

          descricao:
            produto.descricao || '',

          valor:
            produto.valor !== null &&
            produto.valor !== undefined
              ? String(produto.valor)
              : '',
        });

        setFoto(produto.foto || '');
      } catch (error) {
        console.error(
          'Erro ao carregar produto:',
          error
        );

        setErro(
          'Não foi possível carregar os dados do produto.'
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [
    authLoading,
    user,
    userProfile,
    idProduto,
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
        (
          !Number.isFinite(
            valorNumerico
          ) ||
          valorNumerico < 0
        )
      ) {
        setErro(
          'Informe um valor válido.'
        );

        return;
      }

      const { error } = await supabase
        .from('Produto')
        .update({
          nomeProduto:
            formData.nomeProduto.trim(),

          categoria:
            formData.categoria,

          descricao:
            formData.descricao.trim(),

          valor: valorNumerico,

          foto: foto || null,
        })
        .eq('id', idProduto);

      if (error) {
        throw error;
      }

      alert(
        'Produto atualizado com sucesso!'
      );
    } catch (error) {
      console.error(
        'Erro ao atualizar produto:',
        error
      );

      setErro(
        'Não foi possível atualizar o produto.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (authLoading || carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
        <Cabecalho />

        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-gray-600">
            Carregando produto...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Cabecalho />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
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
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-3 rounded-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Editar Produto
                  </h1>

                  <p className="text-gray-600">
                    Atualize os dados do seu anúncio
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Foto do Produto
                  </label>

                  <ImageUpload
                    bucket="produto"
                    onUpload={setFoto}
                    currentImage={foto}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nome do Produto *
                  </label>

                  <input
                    type="text"
                    required
                    value={
                      formData.nomeProduto
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nomeProduto:
                          e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Cesta de produtos orgânicos"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">
                      Selecione uma categoria
                    </option>

                    {CATEGORIAS_PRODUTO.map(
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={5}
                    placeholder="Descreva seu produto, condições, detalhes importantes..."
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <button
                  type="submit"
                  disabled={salvando}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
                <div className="bg-blue-100 p-3 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">
                    Catálogo
                  </h2>

                  <p className="text-gray-600 mt-1">
                    Cadastre categorias, opções,
                    variações e itens oferecidos
                    neste anúncio.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/catalogo/produto/${idProduto}`
                      )
                    }
                    className="mt-4 bg-blue-50 text-blue-700 hover:bg-blue-100 px-5 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Gerenciar catálogo
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