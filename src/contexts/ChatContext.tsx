import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

import Chat from '../app/components/chat/Chat';

import {
  getMeuUserId,
  type Conversa,
  type Mensagem,
} from '../services/chatService';

interface ChatContextType {
  meuUserId: number | null;

  conversaRecebida: Conversa | null;
  mensagemRecebida: Mensagem | null;

  nomeRemetente: string;

  notificacaoVisivel: boolean;
  chatRecebidoAberto: boolean;

  abrirConversaRecebida: () => void;
  fecharConversaRecebida: () => void;
  fecharNotificacao: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(
  undefined
);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({
  children,
}: ChatProviderProps) {
  const { user } = useAuth();

  const [meuUserId, setMeuUserId] =
    useState<number | null>(null);

  const [conversaRecebida, setConversaRecebida] =
    useState<Conversa | null>(null);

  const [mensagemRecebida, setMensagemRecebida] =
    useState<Mensagem | null>(null);

  const [nomeRemetente, setNomeRemetente] =
    useState('Usuário');

  const [notificacaoVisivel, setNotificacaoVisivel] =
    useState(false);

  const [chatRecebidoAberto, setChatRecebidoAberto] =
    useState(false);

  /**
   * Busca a conversa relacionada à mensagem
   * e abre o chat para o destinatário.
   */
  const processarMensagemRecebida = useCallback(
    async (
      novaMensagem: Mensagem,
      idUsuarioAtual: number
    ) => {
      /**
       * Se fui eu quem enviou, não tratamos como
       * uma nova mensagem recebida.
       */
      if (
        novaMensagem.remetente_id ===
        idUsuarioAtual
      ) {
        return;
      }

      console.log(
        '📨 Nova mensagem recebida:',
        novaMensagem
      );

      try {
        /**
         * Busca a conversa.
         *
         * O próprio RLS já deve impedir acesso
         * às conversas das quais o usuário não participa.
         */
        const {
          data: conversa,
          error: conversaError,
        } = await supabase
          .from('Conversas')
          .select('*')
          .eq(
            'id',
            novaMensagem.conversa_id
          )
          .maybeSingle();

        if (conversaError) {
          console.error(
            '❌ Erro ao buscar conversa:',
            conversaError
          );
          return;
        }

        if (!conversa) {
          return;
        }

        /**
         * Validação adicional no front.
         */
        const participaDaConversa =
          conversa.cliente_id ===
            idUsuarioAtual ||
          conversa.prestador_id ===
            idUsuarioAtual;

        if (!participaDaConversa) {
          return;
        }

        /**
         * Busca o nome de quem enviou.
         */
        const {
          data: remetente,
          error: remetenteError,
        } = await supabase
          .from('User')
          .select('nome')
          .eq(
            'id',
            novaMensagem.remetente_id
          )
          .maybeSingle();

        if (remetenteError) {
          console.error(
            '⚠️ Não foi possível buscar o nome do remetente:',
            remetenteError
          );
        }

        setNomeRemetente(
          remetente?.nome || 'Usuário'
        );

        setConversaRecebida(
          conversa as Conversa
        );

        setMensagemRecebida(
          novaMensagem
        );

        /**
         * Exibe notificação interna.
         */
        setNotificacaoVisivel(true);

        /**
         * Abre automaticamente a caixa do chat.
         */
        setChatRecebidoAberto(true);
      } catch (error) {
        console.error(
          '❌ Erro ao processar mensagem recebida:',
          error
        );
      }
    },
    []
  );

  /**
   * Inicializa o monitor global do chat.
   */
  useEffect(() => {
    if (!user) {
      setMeuUserId(null);
      setConversaRecebida(null);
      setMensagemRecebida(null);
      setNotificacaoVisivel(false);
      setChatRecebidoAberto(false);

      return;
    }

    let ativo = true;

    let channel:
      | ReturnType<
          typeof supabase.channel
        >
      | null = null;

    const inicializarChatGlobal =
      async () => {
        try {
          const idAtual =
            await getMeuUserId();

          if (!ativo) {
            return;
          }

          console.log(
            '🆔 Chat global iniciado para User ID:',
            idAtual
          );

          setMeuUserId(idAtual);

          /**
           * Verifica se já existe mensagem não lida.
           *
           * Isso é importante porque o usuário pode
           * abrir o aplicativo depois que a mensagem
           * já foi enviada.
           */
          const {
            data: mensagemPendente,
            error: mensagemPendenteError,
          } = await supabase
            .from('Mensagens')
            .select('*')
            .neq(
              'remetente_id',
              idAtual
            )
            .eq(
              'lida',
              false
            )
            .order(
              'created_at',
              {
                ascending: false,
              }
            )
            .limit(1)
            .maybeSingle();

          if (
            mensagemPendenteError
          ) {
            console.error(
              '⚠️ Erro ao procurar mensagem pendente:',
              mensagemPendenteError
            );
          }

          if (
            mensagemPendente &&
            ativo
          ) {
            await processarMensagemRecebida(
              mensagemPendente as Mensagem,
              idAtual
            );
          }

          /**
           * Assinatura global.
           *
           * Diferente do Chat.tsx,
           * esta assinatura não depende de uma
           * conversa específica.
           */
          channel = supabase
            .channel(
              `chat-global-${idAtual}`
            )
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'Mensagens',
              },
              async payload => {
                if (!ativo) {
                  return;
                }

                const novaMensagem =
                  payload.new as Mensagem;

                await processarMensagemRecebida(
                  novaMensagem,
                  idAtual
                );
              }
            )
            .subscribe(status => {
              console.log(
                '📡 Realtime global:',
                status
              );
            });
        } catch (error) {
          console.error(
            '❌ Erro ao inicializar ChatContext:',
            error
          );
        }
      };

    inicializarChatGlobal();

    return () => {
      ativo = false;

      if (channel) {
        void supabase.removeChannel(
          channel
        );
      }
    };
  }, [
    user,
    processarMensagemRecebida,
  ]);

  const abrirConversaRecebida =
    () => {
      if (!conversaRecebida) {
        return;
      }

      setChatRecebidoAberto(true);
      setNotificacaoVisivel(false);
    };

  const fecharConversaRecebida =
    () => {
      setChatRecebidoAberto(false);
    };

  const fecharNotificacao = () => {
    setNotificacaoVisivel(false);
  };

  return (
    <ChatContext.Provider
      value={{
        meuUserId,

        conversaRecebida,
        mensagemRecebida,

        nomeRemetente,

        notificacaoVisivel,
        chatRecebidoAberto,

        abrirConversaRecebida,
        fecharConversaRecebida,
        fecharNotificacao,
      }}
    >
      {children}

      {chatRecebidoAberto &&
        conversaRecebida &&
        meuUserId !== null && (
          <Chat
            conversaInicial={
              conversaRecebida
            }
            meuUserIdInicial={
              meuUserId
            }
            nomeDestinatario={
              nomeRemetente
            }
            abertoInicialmente={
              true
            }
            onFechar={
              fecharConversaRecebida
            }
          />
        )}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context =
    useContext(ChatContext);

  if (!context) {
    throw new Error(
      'useChat deve ser utilizado dentro de ChatProvider.'
    );
  }

  return context;
}