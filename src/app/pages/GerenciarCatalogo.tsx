import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';

import PrivateImage from '../components/PrivateImage';
import CategoriaForm from '../components/catalogo/CategoriaForm';
import ItemForm from '../components/catalogo/ItemForm';

import {
  buscarCategorias,
  criarCategoria,
  excluirCategoria,
  buscarItens,
  criarItem,
  excluirItem,
} from '../../services/catalogoService';

import type {
  CategoriaAnuncio,
  ItemAnuncio,
  TipoAnuncio,
} from '../../types/catalogo';

export default function GerenciarCatalogo() {
  const navigate = useNavigate();

  const { tipoAnuncio, anuncioId } = useParams<{
    tipoAnuncio: string;
    anuncioId: string;
  }>();

  const [categorias, setCategorias] = useState<CategoriaAnuncio[]>([]);
  const [itensPorCategoria, setItensPorCategoria] = useState<
    Record<number, ItemAnuncio[]>
  >({});

  const [categoriaComFormulario, setCategoriaComFormulario] =
    useState<number | null>(null);

  const [categoriasAbertas, setCategoriasAbertas] = useState<
    Record<number, boolean>
  >({});

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [anuncio, setAnuncio] = useState<{
    nome: string;
    foto: string | null;
  } | null>(null);

  const [ehProprietario, setEhProprietario] = useState(false);

  const [verificandoProprietario, setVerificandoProprietario] =
    useState(true);

  const tipoValido: TipoAnuncio | null =
    tipoAnuncio === 'produto' || tipoAnuncio === 'comida'
      ? tipoAnuncio
      : null;

  const idAnuncio = Number(anuncioId);

  const parametrosValidos =
    tipoValido !== null &&
    Number.isInteger(idAnuncio) &&
    idAnuncio > 0;

  const formatarPreco = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(valor));
  };

  const carregarItensDasCategorias = useCallback(
    async (listaCategorias: CategoriaAnuncio[]) => {
      try {
        const resultados = await Promise.all(
          listaCategorias.map(async (categoria) => {
            const itens = await buscarItens(categoria.id);

            return {
              categoriaId: categoria.id,
              itens,
            };
          })
        );

        const mapa: Record<number, ItemAnuncio[]> = {};

        resultados.forEach((resultado) => {
          mapa[resultado.categoriaId] = resultado.itens;
        });

        setItensPorCategoria(mapa);
      } catch (error) {
        console.error(
          'Erro ao carregar itens das categorias:',
          error
        );

        setErro(
          'Não foi possível carregar os itens do catálogo.'
        );
      }
    },
    []
  );

  const carregarCategorias = useCallback(async () => {
    if (!tipoValido || !parametrosValidos) {
      setErro('Anúncio inválido.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro(null);

      const dados = await buscarCategorias(
        tipoValido,
        idAnuncio
      );

      setCategorias(dados);

      await carregarItensDasCategorias(dados);
    } catch (error) {
      console.error(
        'Erro ao carregar categorias:',
        error
      );

      setErro(
        'Não foi possível carregar as categorias.'
      );
    } finally {
      setLoading(false);
    }
  }, [
    tipoValido,
    idAnuncio,
    parametrosValidos,
    carregarItensDasCategorias,
  ]);

  useEffect(() => {
    carregarCategorias();
  }, [carregarCategorias]);

  useEffect(() => {
    async function carregarAnuncioEProprietario() {
      if (!tipoValido || !parametrosValidos) {
        setVerificandoProprietario(false);
        return;
      }

      try {
        setVerificandoProprietario(true);

        const tabela =
          tipoValido === 'comida'
            ? 'Food'
            : 'Produto';

        const campoNome =
          tipoValido === 'comida'
            ? 'nomeFood'
            : 'nomeProduto';

        const { data, error } = await supabase
          .from(tabela)
          .select(`${campoNome}, foto, id_usuario`)
          .eq('id', idAnuncio)
          .single();

        if (error) {
          throw error;
        }

        setAnuncio({
          nome:
            data[campoNome] ||
            `Anúncio #${idAnuncio}`,
          foto: data.foto || null,
        });

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user?.email) {
          setEhProprietario(false);
          return;
        }

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
          setEhProprietario(false);
          return;
        }

        setEhProprietario(
          Number(data.id_usuario) ===
            Number(usuarioApp.id)
        );
      } catch (error) {
        console.error(
          'Erro ao carregar dados do anúncio:',
          error
        );

        setAnuncio(null);
        setEhProprietario(false);
      } finally {
        setVerificandoProprietario(false);
      }
    }

    carregarAnuncioEProprietario();
  }, [tipoValido, idAnuncio, parametrosValidos]);

  const handleCriarCategoria = async (
    nome: string
  ) => {
    if (
      !tipoValido ||
      !parametrosValidos ||
      !ehProprietario
    ) {
      return;
    }

    try {
      setErro(null);

      const novaCategoria = await criarCategoria({
        tipo_anuncio: tipoValido,
        anuncio_id: idAnuncio,
        nome,
        ordem: categorias.length,
        ativo: true,
      });

      setCategorias((anteriores) => [
        ...anteriores,
        novaCategoria,
      ]);

      setItensPorCategoria((anteriores) => ({
        ...anteriores,
        [novaCategoria.id]: [],
      }));
    } catch (error) {
      console.error(
        'Erro ao criar categoria:',
        error
      );

      setErro(
        'Não foi possível cadastrar a categoria.'
      );

      throw error;
    }
  };

  const handleExcluirCategoria = async (
    categoria: CategoriaAnuncio
  ) => {
    if (!ehProprietario) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir a categoria "${categoria.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro(null);

      await excluirCategoria(categoria.id);

      setCategorias((anteriores) =>
        anteriores.filter(
          (item) => item.id !== categoria.id
        )
      );

      setItensPorCategoria((anteriores) => {
        const novoMapa = { ...anteriores };
        delete novoMapa[categoria.id];
        return novoMapa;
      });

      if (categoriaComFormulario === categoria.id) {
        setCategoriaComFormulario(null);
      }
    } catch (error) {
      console.error(
        'Erro ao excluir categoria:',
        error
      );

      setErro(
        'Não foi possível excluir a categoria.'
      );
    }
  };

  const handleCriarItem = async (
    categoria: CategoriaAnuncio,
    dados: {
      nome: string;
      descricao: string | null;
      preco: number;
    }
  ) => {
    if (!ehProprietario) {
      return;
    }

    try {
      setErro(null);

      const itensAtuais =
        itensPorCategoria[categoria.id] || [];

      const novoItem = await criarItem({
        categoria_id: categoria.id,
        nome: dados.nome,
        descricao: dados.descricao,
        preco: dados.preco,
        foto: null,
        ordem: itensAtuais.length,
        ativo: true,
      });

      setItensPorCategoria((anteriores) => ({
        ...anteriores,
        [categoria.id]: [
          ...(anteriores[categoria.id] || []),
          novoItem,
        ],
      }));

      setCategoriaComFormulario(null);

      setCategoriasAbertas((anteriores) => ({
        ...anteriores,
        [categoria.id]: true,
      }));
    } catch (error) {
      console.error(
        'Erro ao criar item:',
        error
      );

      setErro(
        'Não foi possível cadastrar o item.'
      );

      throw error;
    }
  };

  const handleExcluirItem = async (
    categoriaId: number,
    item: ItemAnuncio
  ) => {
    if (!ehProprietario) {
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente excluir o item "${item.nome}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setErro(null);

      await excluirItem(item.id);

      setItensPorCategoria((anteriores) => ({
        ...anteriores,
        [categoriaId]: (
          anteriores[categoriaId] || []
        ).filter(
          (itemAtual) => itemAtual.id !== item.id
        ),
      }));
    } catch (error) {
      console.error(
        'Erro ao excluir item:',
        error
      );

      setErro(
        'Não foi possível excluir o item.'
      );
    }
  };

  const alternarCategoria = (
    categoriaId: number
  ) => {
    setCategoriasAbertas((anteriores) => ({
      ...anteriores,
      [categoriaId]:
        !anteriores[categoriaId],
    }));
  };

  const abrirFormularioItem = (
    categoriaId: number
  ) => {
    setCategoriaComFormulario(categoriaId);

    setCategoriasAbertas((anteriores) => ({
      ...anteriores,
      [categoriaId]: true,
    }));
  };

  if (!parametrosValidos) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 rounded-lg p-4">
          Anúncio inválido.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {ehProprietario
              ? 'Gerenciar catálogo'
              : 'Catálogo'}
          </h1>

          <p className="text-gray-600 mt-2">
            {ehProprietario
              ? 'Organize seu catálogo em categorias, itens e opções.'
              : 'Consulte as categorias e itens disponíveis.'}
          </p>

          {anuncio && (
            <div className="mt-5 bg-white rounded-xl shadow p-4 flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {anuncio.foto ? (
                  <PrivateImage
                    path={anuncio.foto}
                    alt={anuncio.nome}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 text-center px-2">
                    Sem imagem
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                  {tipoValido === 'comida'
                    ? 'Cardápio de comida'
                    : 'Catálogo de produtos'}
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {anuncio.nome}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Anúncio #{idAnuncio}
                </p>
              </div>
            </div>
          )}
        </div>

        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {erro}
          </div>
        )}

        {verificandoProprietario ? (
          <div className="bg-white rounded-xl shadow p-5 text-gray-500">
            Verificando permissões...
          </div>
        ) : (
          <>
            {ehProprietario && (
              <CategoriaForm
                onSalvar={handleCriarCategoria}
              />
            )}

            <div className={ehProprietario ? 'mt-8' : ''}>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Categorias
              </h2>

              {loading ? (
                <div className="bg-white rounded-xl shadow p-6 text-gray-500">
                  Carregando categorias...
                </div>
              ) : categorias.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <p className="text-gray-600">
                    Nenhuma categoria cadastrada.
                  </p>

                  {ehProprietario && (
                    <p className="text-sm text-gray-500 mt-2">
                      Crie a primeira categoria acima.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {categorias.map((categoria) => {
                    const itens =
                      itensPorCategoria[categoria.id] || [];

                    const aberta =
                      categoriasAbertas[categoria.id] ??
                      true;

                    return (
                      <div
                        key={categoria.id}
                        className="bg-white rounded-xl shadow overflow-hidden"
                      >
                        <div className="p-5 flex items-center justify-between gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              alternarCategoria(
                                categoria.id
                              )
                            }
                            className="flex-1 flex items-center gap-3 text-left"
                          >
                            {aberta ? (
                              <ChevronUp
                                size={20}
                                className="text-gray-500"
                              />
                            ) : (
                              <ChevronDown
                                size={20}
                                className="text-gray-500"
                              />
                            )}

                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {categoria.nome}
                              </h3>

                              <p className="text-sm text-gray-500 mt-1">
                                {itens.length === 0
                                  ? 'Nenhum item'
                                  : `${itens.length} ${
                                      itens.length === 1
                                        ? 'item'
                                        : 'itens'
                                    }`}
                              </p>

                              {!categoria.ativo && (
                                <span className="text-xs text-gray-500">
                                  Inativa
                                </span>
                              )}
                            </div>
                          </button>

                          {ehProprietario && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  abrirFormularioItem(
                                    categoria.id
                                  )
                                }
                                className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg"
                                title="Adicionar item"
                              >
                                <Plus size={17} />
                                <span className="hidden sm:inline">
                                  Adicionar item
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleExcluirCategoria(
                                    categoria
                                  )
                                }
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Excluir categoria"
                              >
                                <Trash2 size={19} />
                              </button>
                            </div>
                          )}
                        </div>

                        {aberta && (
                          <div className="border-t border-gray-100 px-5 pb-5">
                            {itens.length === 0 ? (
                              <p className="text-sm text-gray-500 py-5">
                                Nenhum item cadastrado nesta categoria.
                              </p>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {itens.map((item) => (
                                  <div
                                    key={item.id}
                                    className="py-4 flex items-start justify-between gap-4"
                                  >
                                    <div>
                                      <h4 className="font-medium text-gray-800">
                                        {item.nome}
                                      </h4>

                                      {item.descricao && (
                                        <p className="text-sm text-gray-500 mt-1">
                                          {item.descricao}
                                        </p>
                                      )}

                                      <p className="font-semibold text-purple-700 mt-2">
                                        {formatarPreco(
                                          item.preco
                                        )}
                                      </p>

                                      {!item.ativo && (
                                        <span className="text-xs text-gray-500">
                                          Item inativo
                                        </span>
                                      )}
                                    </div>

                                    {ehProprietario && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleExcluirItem(
                                            categoria.id,
                                            item
                                          )
                                        }
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Excluir item"
                                      >
                                        <Trash2
                                          size={18}
                                        />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {ehProprietario &&
                              categoriaComFormulario ===
                                categoria.id && (
                                <ItemForm
                                  categoriaNome={
                                    categoria.nome
                                  }
                                  onSalvar={(dados) =>
                                    handleCriarItem(
                                      categoria,
                                      dados
                                    )
                                  }
                                  onCancelar={() =>
                                    setCategoriaComFormulario(
                                      null
                                    )
                                  }
                                />
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}