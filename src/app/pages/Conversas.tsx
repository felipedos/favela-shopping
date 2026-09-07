import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  MessageCircle,
  Package,
  Wrench,
  UtensilsCrossed,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import Chat from '../components/chat/Chat';
import Header from '../components/Header';

import {
  getMeuUserId,
  type Conversa,
  type Mensagem,
} from '../../services/chatService';

interface ConversaLista extends Conversa {
  nomeOutroUsuario: string;
  tituloAnuncio: string;
  ultimaMensagem: string;
  dataUltimaMensagem: string | null;
  naoLidas: number;
}

export default function Conversas() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversas, setConversas] = useState<ConversaLista[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [conversaAberta, setConversaAberta] =
    useState<ConversaLista | null>(null);

  const [meuUserId, setMeuUserId] =
    useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setCarregando(false);
      return;
    }

    carregarConversas();
  }, [user]);

  async function carregarConversas() {
    try {
      setCarregando(true);
      setErro(null);

      const idAtual = await getMeuUserId();

      setMeuUserId(idAtual);

      const {
        data: conversasData,
        error: conversasError,
      } = await supabase
        .from('Conversas')
        .select('*')
        .or(
          `cliente_id.eq.${idAtual},prestador_id.eq.${idAtual}`
        )
        .order('updated_at', {
          ascending: false,
        });

      if (conversasError) {
        throw conversasError;
      }

      const conversasCompletas =
        await Promise.all(
          (conversasData ?? []).map(
            async (conversa: Conversa) => {
              const outroUsuarioId =
                conversa.cliente_id === idAtual
                  ? conversa.prestador_id
                  : conversa.cliente_id;

              const {
                data: outroUsuario,
              } = await supabase
                .from('User')
                .select('nome')
                .eq('id', outroUsuarioId)
                .maybeSingle();

              const tituloAnuncio =
                await buscarTituloAnuncio(
                  conversa.tipo_anuncio,
                  conversa.anuncio_id
                );

              const {
                data: ultimaMensagemData,
              } = await supabase
                .from('Mensagens')
                .select('*')
                .eq(
                  'conversa_id',
                  conversa.id
                )
                .order('created_at', {
                  ascending: false,
                })
                .limit(1)
                .maybeSingle();

              const {
                count: naoLidas,
              } = await supabase
                .from('Mensagens')
                .select('*', {
                  count: 'exact',
                  head: true,
                })
                .eq(
                  'conversa_id',
                  conversa.id
                )
                .neq(
                  'remetente_id',
                  idAtual
                )
                .eq('lida', false);

              return {
                ...conversa,

                nomeOutroUsuario:
                  outroUsuario?.nome ||
                  'Usuário',

                tituloAnuncio,

                ultimaMensagem:
                  ultimaMensagemData?.texto ||
                  'Nenhuma mensagem',

                dataUltimaMensagem:
                  ultimaMensagemData?.created_at ||
                  null,

                naoLidas:
                  naoLidas ?? 0,
              };
            }
          )
        );

      conversasCompletas.sort(
        (a, b) => {
          const dataA =
            a.dataUltimaMensagem
              ? new Date(
                  a.dataUltimaMensagem
                ).getTime()
              : 0;

          const dataB =
            b.dataUltimaMensagem
              ? new Date(
                  b.dataUltimaMensagem
                ).getTime()
              : 0;

          return dataB - dataA;
        }
      );

      setConversas(
        conversasCompletas
      );
    } catch (error) {
      console.error(
        '❌ Erro ao carregar conversas:',
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar suas conversas.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function buscarTituloAnuncio(
    tipoAnuncio: string | null,
    anuncioId: number | null
  ): Promise<string> {
    if (!tipoAnuncio || !anuncioId) {
      return 'Anúncio';
    }

    try {
      if (tipoAnuncio === 'produto') {
        const { data } =
          await supabase
            .from('Produto')
            .select('nomeProduto')
            .eq('id', anuncioId)
            .maybeSingle();

        return (
          data?.nomeProduto ||
          'Produto'
        );
      }

      if (tipoAnuncio === 'servico') {
        const { data } =
          await supabase
            .from('Servico')
            .select('nomeServico')
            .eq('id', anuncioId)
            .maybeSingle();

        return (
          data?.nomeServico ||
          'Serviço'
        );
      }

      if (tipoAnuncio === 'comida') {
        const { data } =
          await supabase
            .from('Food')
            .select('nomeFood')
            .eq('id', anuncioId)
            .maybeSingle();

        return (
          data?.nomeFood ||
          'Comida'
        );
      }

      return 'Anúncio';
    } catch (error) {
      console.error(
        'Erro ao buscar anúncio:',
        error
      );

      return 'Anúncio';
    }
  }

  function formatarData(
    data: string | null
  ) {
    if (!data) {
      return '';
    }

    const dataMensagem =
      new Date(data);

    const hoje =
      new Date();

    const mesmoDia =
      dataMensagem.toDateString() ===
      hoje.toDateString();

    if (mesmoDia) {
      return dataMensagem.toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    }

    return dataMensagem.toLocaleDateString(
      'pt-BR'
    );
  }

  function renderIcone(
    tipo: string | null
  ) {
    if (tipo === 'servico') {
      return (
        <Wrench size={22} />
      );
    }

    if (tipo === 'comida') {
      return (
        <UtensilsCrossed
          size={22}
        />
      );
    }

    return <Package size={22} />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showFullMenu />

        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <MessageCircle
            size={48}
            className="mx-auto mb-4 text-gray-400"
          />

          <h1 className="text-2xl font-bold mb-3">
            Minhas Conversas
          </h1>

          <p className="text-gray-600 mb-6">
            Faça login para acessar suas conversas.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/login')
            }
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showFullMenu />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6"
        >
          <ArrowLeft size={20} />

          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
            <div className="flex items-center gap-3">
              <MessageCircle
                size={30}
              />

              <div>
                <h1 className="text-2xl font-bold">
                  Minhas Conversas
                </h1>

                <p className="text-purple-100 text-sm">
                  Consulte suas mensagens com clientes e vendedores.
                </p>
              </div>
            </div>
          </div>

          {carregando && (
            <div className="p-10 text-center text-gray-500">
              Carregando conversas...
            </div>
          )}

          {erro && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {erro}
            </div>
          )}

          {!carregando &&
            !erro &&
            conversas.length === 0 && (
              <div className="p-12 text-center">
                <MessageCircle
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />

                <h2 className="font-semibold text-gray-700">
                  Nenhuma conversa ainda
                </h2>

                <p className="text-gray-500 text-sm mt-2">
                  Quando você entrar em contato com alguém ou receber uma mensagem, ela aparecerá aqui.
                </p>
              </div>
            )}

          {!carregando &&
            conversas.map(
              conversa => (
                <button
                  key={
                    conversa.id
                  }
                  type="button"
                  onClick={() =>
                    setConversaAberta(
                      conversa
                    )
                  }
                  className="w-full text-left flex items-center gap-4 p-4 border-b hover:bg-gray-50 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                    {renderIcone(
                      conversa.tipo_anuncio
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {
                          conversa.nomeOutroUsuario
                        }
                      </h2>

                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatarData(
                          conversa.dataUltimaMensagem
                        )}
                      </span>
                    </div>

                    <div className="text-sm text-purple-600 truncate mt-1">
                      {
                        conversa.tituloAnuncio
                      }
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {
                          conversa.ultimaMensagem
                        }
                      </p>

                      {conversa.naoLidas >
                        0 && (
                        <span className="min-w-6 h-6 px-2 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                          {
                            conversa.naoLidas
                          }
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            )}
        </div>
      </main>

      {conversaAberta &&
        meuUserId !== null && (
          <Chat
            conversaInicial={
              conversaAberta
            }
            meuUserIdInicial={
              meuUserId
            }
            nomeDestinatario={
              conversaAberta.nomeOutroUsuario
            }
            abertoInicialmente
            onFechar={() => {
              setConversaAberta(
                null
              );

              carregarConversas();
            }}
          />
        )}
    </div>
  );
}