import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';

import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

import Chat from '../components/chat/Chat';
import Cabecalho from '../components/Cabecalho';

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

  function rotuloCategoria(tipo: string | null) {
    if (tipo === 'servico') {
      return 'Serviço';
    }

    if (tipo === 'comida') {
      return 'Comida';
    }

    return tipo === 'produto' ? 'Produto' : 'Anúncio';
  }

  function obterIniciais(nome: string) {
    const partesNome = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .filter((parte) => !['da', 'das', 'de', 'do', 'dos', 'e'].includes(parte.toLocaleLowerCase('pt-BR')));
    if (partesNome.length === 0) return 'U';
    const nomesParaIniciais = partesNome.length > 1
      ? [partesNome[0], partesNome[partesNome.length - 1]]
      : partesNome;
    return nomesParaIniciais
      .map((parte) => parte[0])
      .join('')
      .toLocaleUpperCase('pt-BR');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Cabecalho showFullMenu />

        <div className="mx-auto max-w-3xl px-4 py-12 text-center md:px-6">
          <MessageCircle
            size={48}
            strokeWidth={1.7}
            className="mx-auto mb-4 text-primary"
          />

          <h1 className="mb-3 text-2xl font-bold text-text-main">
            Minhas Conversas
          </h1>

          <p className="mb-6 text-text-muted">
            Faça login para acessar suas conversas.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate('/login')
            }
            className="rounded-lg bg-secondary px-6 py-3 font-semibold text-white transition-colors hover:bg-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Cabecalho showFullMenu />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft size={18} strokeWidth={1.8} />

          Voltar
        </button>

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-premium">
          <div className="border-b border-border bg-slate-50 p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <MessageCircle size={23} strokeWidth={1.7} />
              </span>

              <div>
                <h1 className="text-2xl font-bold text-text-main">
                  Minhas Conversas
                </h1>

                <p className="mt-1 text-sm text-text-muted">
                  Consulte suas mensagens com clientes e vendedores.
                </p>
              </div>
            </div>
          </div>

          {carregando && (
            <div className="p-10 text-center text-sm text-text-muted">
              Carregando conversas...
            </div>
          )}

          {erro && (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {erro}
            </div>
          )}

          {!carregando &&
            !erro &&
            conversas.length === 0 && (
              <div className="p-12 text-center">
                <MessageCircle
                  size={48}
                  strokeWidth={1.6}
                  className="mx-auto mb-4 text-slate-300"
                />

                <h2 className="font-semibold text-text-main">
                  Nenhuma conversa ainda
                </h2>

                <p className="mt-2 text-sm text-text-muted">
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
                  className="flex w-full items-center gap-4 border-b border-border/70 p-4 text-left transition-colors duration-200 hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary sm:p-5"
                >
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary ring-1 ring-inset ring-primary/10">
                    {obterIniciais(conversa.nomeOutroUsuario)}
                    <span className="absolute -bottom-1 -right-2 max-w-[4.5rem] truncate rounded-full border border-border bg-surface px-1.5 py-0.5 text-[9px] font-semibold leading-none text-text-muted shadow-premium">
                      {rotuloCategoria(conversa.tipo_anuncio)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-sm font-semibold text-text-main">
                        {
                          conversa.nomeOutroUsuario
                        }
                      </h2>

                      <span className="whitespace-nowrap text-xs text-text-muted">
                        {formatarData(
                          conversa.dataUltimaMensagem
                        )}
                      </span>
                    </div>

                    <div className="mt-1 truncate text-xs font-medium text-primary">
                      {
                        conversa.tituloAnuncio
                      }
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <p className="truncate text-sm text-slate-400">
                        {
                          conversa.ultimaMensagem
                        }
                      </p>

                      {conversa.naoLidas >
                        0 && (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
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