import {
  Bell,
  MessageCircle,
  X,
} from 'lucide-react';

import { useChat } from '../../../contexts/ChatContext';
import type { CSSProperties } from 'react';

export default function ChatNotification() {
  const {
    mensagemRecebida,
    nomeRemetente,
    notificacaoVisivel,
    abrirConversaRecebida,
    fecharNotificacao,
  } = useChat();

  if (
    !notificacaoVisivel ||
    !mensagemRecebida
  ) {
    return null;
  }

  const textoPreview =
    mensagemRecebida.texto.length > 80
      ? `${mensagemRecebida.texto.substring(
          0,
          80
        )}...`
      : mensagemRecebida.texto;

  return (
    <div style={styles.container}>
      <div style={styles.icone}>
        <Bell size={20} />
      </div>

      <div style={styles.conteudo}>
        <div style={styles.titulo}>
          Nova mensagem
        </div>

        <div style={styles.remetente}>
          {nomeRemetente}
        </div>

        <div style={styles.texto}>
          {textoPreview}
        </div>

        <button
          type="button"
          onClick={
            abrirConversaRecebida
          }
          style={styles.botaoAbrir}
        >
          <MessageCircle
            size={16}
          />

          Abrir conversa
        </button>
      </div>

      <button
        type="button"
        onClick={
          fecharNotificacao
        }
        title="Fechar notificação"
        style={styles.botaoFechar}
      >
        <X size={18} />
      </button>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',

    width: '340px',

    display: 'flex',
    gap: '12px',

    padding: '14px',

    backgroundColor: '#ffffff',

    borderRadius: '12px',

    boxShadow:
      '0 8px 30px rgba(0, 0, 0, 0.18)',

    border:
      '1px solid #e5e7eb',

    zIndex: 10001,
  },

  icone: {
    width: '40px',
    height: '40px',

    minWidth: '40px',

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: '50%',

    backgroundColor: '#dbeafe',
    color: '#2563eb',
  },

  conteudo: {
    flex: 1,
    minWidth: 0,
  },

  titulo: {
    fontSize: '13px',
    fontWeight: 700,

    color: '#111827',
  },

  remetente: {
    marginTop: '2px',

    fontSize: '14px',
    fontWeight: 600,

    color: '#1f2937',
  },

  texto: {
    marginTop: '4px',

    fontSize: '13px',

    color: '#4b5563',

    lineHeight: 1.4,

    wordBreak: 'break-word',
  },

  botaoAbrir: {
    marginTop: '10px',

    border: 'none',

    backgroundColor: '#2563eb',

    color: '#ffffff',

    borderRadius: '7px',

    padding: '7px 11px',

    fontSize: '12px',

    fontWeight: 600,

    cursor: 'pointer',

    display: 'inline-flex',

    alignItems: 'center',

    gap: '6px',
  },

  botaoFechar: {
    width: '30px',
    height: '30px',

    flexShrink: 0,

    border: 'none',

    backgroundColor:
      'transparent',

    cursor: 'pointer',

    color: '#6b7280',

    display: 'flex',

    alignItems: 'center',

    justifyContent:
      'center',

    borderRadius: '6px',
  },
};