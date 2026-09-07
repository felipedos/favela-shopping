import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

import {
  X,
  Minus,
  Send,
  MessageCircle,
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';

import {
  type Conversa,
  type Mensagem,
  getMeuUserId,
  buscarOuCriarConversa,
  buscarMensagens,
  enviarMensagem,
  marcarMensagensComoLidas,
  assinarMensagens,
  cancelarAssinatura,
} from '../../../services/chatService';

interface ChatProps {
  prestadorId?: number;
  tipoAnuncio?: string;
  anuncioId?: number;

  conversaInicial?: Conversa;
  meuUserIdInicial?: number;

  nomeDestinatario?: string;
  abertoInicialmente?: boolean;
  onFechar?: () => void;
}

export default function Chat({
  prestadorId,
  tipoAnuncio,
  anuncioId,

  conversaInicial,
  meuUserIdInicial,

  nomeDestinatario = 'Chat',
  abertoInicialmente = true,
  onFechar,
}: ChatProps) {
  const { user } = useAuth();

  const [aberto, setAberto] = useState(abertoInicialmente);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [conversa, setConversa] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [meuUserId, setMeuUserId] = useState<number | null>(null);

  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const mensagensContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Carrega ou cria a conversa quando o componente é montado.
   */
  useEffect(() => {
    if (!user) {
        setCarregando(false);
        return;
    }

    carregarConversa();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user,
    prestadorId,
    tipoAnuncio,
    anuncioId,
    conversaInicial?.id,
  ]);

  /**
   * Configura o Realtime quando temos uma conversa.
   */
  useEffect(() => {
    if (!conversa) return;

    const channel = assinarMensagens(conversa.id, (novaMensagem) => {
      setMensagens((mensagensAtuais) => {
        // Evita duplicar uma mensagem que já esteja na tela.
        const jaExiste = mensagensAtuais.some(
          (mensagem) => mensagem.id === novaMensagem.id
        );

        if (jaExiste) {
          return mensagensAtuais;
        }

        return [...mensagensAtuais, novaMensagem];
      });

      // Se o chat estiver aberto, a mensagem recebida é marcada como lida.
      if (
        aberto &&
        novaMensagem.remetente_id !== meuUserId
      ) {
        marcarMensagensComoLidas(
            conversa.id
        ).catch((error) => {
            console.error(
            '❌ Erro ao marcar mensagem como lida:',
            error
            );
        });
      }
    });

    return () => {
      void cancelarAssinatura(channel);
    };
  }, [conversa, aberto, meuUserId]);

  /**
   * Faz o scroll para a última mensagem.
   */
  useEffect(() => {
    if (!mensagensContainerRef.current) return;

    mensagensContainerRef.current.scrollTop =
      mensagensContainerRef.current.scrollHeight;
  }, [mensagens]);

  /**
   * Carrega a conversa e suas mensagens.
   */
const carregarConversa =
  async () => {
    try {
      setCarregando(true);
      setErro(null);

      /**
       * CASO 1:
       *
       * A conversa já existe.
       *
       * Isso acontece quando recebemos
       * uma mensagem pelo ChatContext.
       */
      if (conversaInicial) {
        console.log(
          '📥 Abrindo conversa recebida:',
          conversaInicial
        );

        let idAtual =
          meuUserIdInicial;

        if (
          idAtual === undefined
        ) {
          const resultadoId =
            await getMeuUserId();

          idAtual = resultadoId;
        }

        setMeuUserId(
          idAtual
        );

        setConversa(
          conversaInicial
        );

        const mensagensCarregadas =
          await buscarMensagens(
            conversaInicial.id
          );

        setMensagens(
          mensagensCarregadas
        );

        await marcarMensagensComoLidas(
          conversaInicial.id
        );

        return;
      }

      /**
       * CASO 2:
       *
       * Usuário clicou em "Entrar em Contato"
       * numa página de produto.
       */
      if (
        prestadorId === undefined ||
        tipoAnuncio === undefined ||
        anuncioId === undefined
      ) {
        throw new Error(
          'Dados insuficientes para abrir a conversa.'
        );
      }

      console.log(
        '💬 Carregando conversa:',
        {
          prestadorId,
          tipoAnuncio,
          anuncioId,
        }
      );

      const resultado =
        await buscarOuCriarConversa(
          prestadorId,
          tipoAnuncio,
          anuncioId
        );

      setConversa(
        resultado.conversa
      );

      setMeuUserId(
        resultado.meuUserId
      );

      const mensagensCarregadas =
        await buscarMensagens(
          resultado.conversa.id
        );

      setMensagens(
        mensagensCarregadas
      );

      await marcarMensagensComoLidas(
        resultado.conversa.id
      );
    } catch (error) {
      console.error(
        '❌ Erro ao carregar chat:',
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o chat.'
      );
    } finally {
      setCarregando(false);
    }
  };

  /**
   * Envia uma mensagem.
   */
  const handleEnviarMensagem = async () => {
    const textoEnviar = texto.trim();

    if (!textoEnviar || !conversa || enviando || meuUserId === null) {
        return;
    }

    const idTemporario = -Date.now();

    const mensagemTemporaria: Mensagem = {
        id: idTemporario,
        conversa_id: conversa.id,
        remetente_id: meuUserId,
        texto: textoEnviar,
        created_at: new Date().toISOString(),
        lida: false,
    };

    // Mostra imediatamente na tela.
    setMensagens((atuais) => [
        ...atuais,
        mensagemTemporaria,
    ]);

    // Limpa o campo imediatamente.
    setTexto('');
    setErro(null);
    setEnviando(true);

    try {
        const mensagemSalva = await enviarMensagem(
        conversa.id,
        textoEnviar
        );

        // Substitui a mensagem temporária pela mensagem real do banco.
        setMensagens((atuais) =>
        atuais.map((mensagem) =>
            mensagem.id === idTemporario
            ? mensagemSalva
            : mensagem
        )
        );

        inputRef.current?.focus();

    } catch (error) {
        console.error(
        '❌ Erro ao enviar mensagem:',
        error
        );

        // Remove a mensagem otimista caso a gravação tenha falhado.
        setMensagens((atuais) =>
        atuais.filter(
            (mensagem) =>
            mensagem.id !== idTemporario
        )
        );

        // Devolve o texto para o usuário.
        setTexto(textoEnviar);

        setErro(
        error instanceof Error
            ? error.message
            : 'Não foi possível enviar a mensagem.'
        );

    } finally {
        setEnviando(false);
    }
  };

  /**
   * Permite enviar pressionando Enter.
   */
  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key !== 'Enter') {
        return;
    }

    // CTRL + ENTER = quebra de linha.
    if (event.ctrlKey) {
        return;
    }

    // ENTER sozinho = envia.
    event.preventDefault();

    handleEnviarMensagem();
  };

  /**
   * Minimiza o chat.
   */
  const handleMinimizar = () => {
    setAberto(false);
  };

  /**
   * Fecha completamente o chat.
   */
  const handleFechar = () => {
    setAberto(false);

    if (onFechar) {
      onFechar();
    }
  };

  /**
   * Reabre o chat minimizado.
   */
  const handleAbrir = () => {
    setAberto(true);

    if (conversa) {
      marcarMensagensComoLidas(conversa.id).catch((error) => {
        console.error(
          '❌ Erro ao marcar mensagens como lidas:',
          error
        );
      });
    }

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  /**
   * Se não existe usuário autenticado,
   * não exibimos o chat.
   */
  if (!user) {
    return null;
  }

  /**
   * Chat minimizado.
   */
  if (!aberto) {
    return (
      <button
        type="button"
        onClick={handleAbrir}
        title="Abrir chat"
        style={styles.botaoMinimizado}
      >
        <MessageCircle size={24} />

        {mensagens.some(
          (mensagem) =>
            !mensagem.lida &&
            mensagem.remetente_id !== meuUserId
        ) && <span style={styles.indicadorNotificacao} />}
      </button>
    );
  }

  return (
    <div style={styles.container}>
      {/* CABEÇALHO */}
      <div style={styles.cabecalho}>
        <div style={styles.tituloContainer}>
          <div style={styles.iconeUsuario}>
            <MessageCircle size={18} />
          </div>

          <div>
            <div style={styles.titulo}>
              {nomeDestinatario}
            </div>

            <div style={styles.subtitulo}>
              Mensagens
            </div>
          </div>
        </div>

        <div style={styles.acoesCabecalho}>
          <button
            type="button"
            onClick={handleMinimizar}
            title="Minimizar"
            style={styles.botaoCabecalho}
          >
            <Minus size={18} />
          </button>

          <button
            type="button"
            onClick={handleFechar}
            title="Fechar"
            style={styles.botaoCabecalho}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* MENSAGENS */}
      <div
        ref={mensagensContainerRef}
        style={styles.mensagens}
      >
        {carregando && (
          <div style={styles.mensagemSistema}>
            Carregando conversa...
          </div>
        )}

        {!carregando && mensagens.length === 0 && (
          <div style={styles.mensagemSistema}>
            <MessageCircle size={28} />

            <span>
              Nenhuma mensagem ainda.
            </span>

            <small>
              Envie uma mensagem para iniciar a conversa.
            </small>
          </div>
        )}

        {mensagens.map((mensagem) => {

          /*
           * Se o usuário atual é o cliente:
           *   cliente -> direita
           *   prestador -> esquerda
           *
           * Se o usuário atual é o prestador:
           *   prestador -> direita
           *   cliente -> esquerda
           */
          const mensagemEhMinha =
            mensagem.remetente_id === meuUserId;

          return (
            <div
              key={mensagem.id}
              style={{
                ...styles.linhaMensagem,
                justifyContent: mensagemEhMinha
                  ? 'flex-end'
                  : 'flex-start',
              }}
            >
              <div
                style={{
                  ...styles.balao,
                  ...(mensagemEhMinha
                    ? styles.balaoMinha
                    : styles.balaoOutra),
                }}
              >
                <div>{mensagem.texto}</div>

                <div style={styles.horario}>
                  {formatarHorario(mensagem.created_at)}

                  {mensagemEhMinha && (
                    <span
                      style={
                        mensagem.lida
                          ? styles.lida
                          : styles.naoLida
                      }
                    >
                      {mensagem.lida ? ' ✓✓' : ' ✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ERRO */}
      {erro && (
        <div style={styles.erro}>
          {erro}
        </div>
      )}

      {/* CAMPO DE ENVIO */}
      <div style={styles.areaEnvio}>
        <textarea
            ref={inputRef}
            value={texto}
            onChange={(event) => setTexto(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            disabled={carregando || enviando || !conversa}
            rows={1}
            style={styles.input}
        />

        <button
          type="button"
          onClick={handleEnviarMensagem}
          disabled={
            carregando ||
            enviando ||
            !conversa ||
            !texto.trim()
          }
          title="Enviar mensagem"
          style={{
            ...styles.botaoEnviar,
            opacity:
              carregando ||
              enviando ||
              !conversa ||
              !texto.trim()
                ? 0.5
                : 1,
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/**
 * Formata o horário da mensagem.
 */
function formatarHorario(data: string): string {
  try {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

/**
 * Estilos isolados do componente.
 *
 * Posteriormente podemos mover isso para Chat.css
 * ou para Tailwind sem alterar a lógica do chat.
 */
const styles: Record<string, CSSProperties> = {
  container: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '360px',
    height: '500px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.20)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 9999,
    border: '1px solid #e5e7eb',
  },

  cabecalho: {
    height: '60px',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 12px 0 14px',
    backgroundColor: '#111827',
    color: '#ffffff',
  },

  tituloContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  iconeUsuario: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
  },

  titulo: {
    fontSize: '14px',
    fontWeight: 600,
  },

  subtitulo: {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '2px',
  },

  acoesCabecalho: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },

  botaoCabecalho: {
    width: '34px',
    height: '34px',
    border: 'none',
    background: 'transparent',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
  },

  mensagens: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px',
    backgroundColor: '#f3f4f6',
  },

  linhaMensagem: {
    display: 'flex',
    width: '100%',
    marginBottom: '8px',
  },

  balao: {
    maxWidth: '78%',
    padding: '9px 11px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },

  balaoMinha: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    borderBottomRightRadius: '3px',
  },

  balaoOutra: {
    backgroundColor: '#ffffff',
    color: '#111827',
    borderBottomLeftRadius: '3px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
  },

  horario: {
    fontSize: '10px',
    marginTop: '4px',
    opacity: 0.65,
    textAlign: 'right',
  },

  lida: {
    marginLeft: '2px',
  },

  naoLida: {
    marginLeft: '2px',
  },

  mensagemSistema: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#6b7280',
    textAlign: 'center',
    fontSize: '13px',
  },

  erro: {
    padding: '8px 12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: '12px',
    borderTop: '1px solid #fecaca',
  },

  areaEnvio: {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#ffffff',
    borderTop: '1px solid #e5e7eb',
  },

  input: {
    flex: 1,
    minHeight: '40px',
    maxHeight: '100px',
    border: '1px solid #d1d5db',
    borderRadius: '20px',
    padding: '10px 14px',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'none',
    overflowY: 'auto',
  },

  botaoEnviar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  botaoMinimizado: {
    position: 'fixed',
    right: '20px',
    bottom: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.20)',
    zIndex: 9999,
  },

  indicadorNotificacao: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '13px',
    height: '13px',
    borderRadius: '50%',
    backgroundColor: '#ef4444',
    border: '2px solid #ffffff',
  },
};
