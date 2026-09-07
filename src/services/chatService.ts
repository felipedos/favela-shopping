import { supabase } from '../lib/supabase';

/**
 * Tipos usados pelo chat
 */

export interface Conversa {
  id: number;
  cliente_id: number;
  prestador_id: number;
  tipo_anuncio: string | null;
  anuncio_id: number | null;
  arquivo_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mensagem {
  id: number;
  conversa_id: number;
  remetente_id: number;
  texto: string;
  created_at: string;
  lida: boolean;
}

/**
 * Retorna o ID do usuário logado na tabela public."User".
 *
 * A função get_my_user_id() já criada no Supabase
 * faz a correspondência entre auth.users.email
 * e public."User".email.
 */
export async function getMeuUserId(): Promise<number> {
  const { data, error } = await supabase.rpc('get_my_user_id');

  if (error) {
    console.error('❌ Erro ao obter ID do usuário:', error);
    throw error;
  }

  if (!data) {
    throw new Error('Usuário autenticado não possui registro na tabela User.');
  }

  return Number(data);
}

/**
 * Procura uma conversa existente entre cliente e prestador
 * para determinado anúncio.
 */
export async function buscarConversa(
  clienteId: number,
  prestadorId: number,
  tipoAnuncio: string,
  anuncioId: number
): Promise<Conversa | null> {
  const { data, error } = await supabase
    .from('Conversas')
    .select('*')
    .eq('cliente_id', clienteId)
    .eq('prestador_id', prestadorId)
    .eq('tipo_anuncio', tipoAnuncio)
    .eq('anuncio_id', anuncioId)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar conversa:', error);
    throw error;
  }

  return data as Conversa | null;
}

/**
 * Cria uma nova conversa.
 */
export async function criarConversa(
  clienteId: number,
  prestadorId: number,
  tipoAnuncio: string,
  anuncioId: number
): Promise<Conversa> {
  const { data, error } = await supabase
    .from('Conversas')
    .insert({
      cliente_id: clienteId,
      prestador_id: prestadorId,
      tipo_anuncio: tipoAnuncio,
      anuncio_id: anuncioId,
      arquivo_path: null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('❌ Erro ao criar conversa:', error);
    throw error;
  }

  return data as Conversa;
}

/**
 * Procura uma conversa existente.
 * Caso não exista, cria uma nova.
 */

export async function buscarOuCriarConversa(
  prestadorId: number,
  tipoAnuncio: string,
  anuncioId: number
): Promise<{
  conversa: Conversa;
  meuUserId: number;
}> {
  const meuUserId = await getMeuUserId();

  // Impede que o usuário converse consigo mesmo.
  if (meuUserId === prestadorId) {
    throw new Error('Você não pode iniciar uma conversa consigo mesmo.');
  }

  const conversaExistente = await buscarConversa(
    meuUserId,
    prestadorId,
    tipoAnuncio,
    anuncioId
  );

  if (conversaExistente) {
    return {
      conversa: conversaExistente,
      meuUserId,
    };
  }

  const novaConversa = await criarConversa(
    meuUserId,
    prestadorId,
    tipoAnuncio,
    anuncioId
  );

  return {
    conversa: novaConversa,
    meuUserId,
  };
}

/**
 * Busca todas as mensagens de uma conversa.
 */
export async function buscarMensagens(
  conversaId: number
): Promise<Mensagem[]> {
  const { data, error } = await supabase
    .from('Mensagens')
    .select('*')
    .eq('conversa_id', conversaId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar mensagens:', error);
    throw error;
  }

  return (data ?? []) as Mensagem[];
}

/**
 * Envia uma nova mensagem.
 */
export async function enviarMensagem(
  conversaId: number,
  texto: string
): Promise<Mensagem> {
  const textoLimpo = texto.trim();

  if (!textoLimpo) {
    throw new Error('A mensagem não pode estar vazia.');
  }

  const remetenteId = await getMeuUserId();

  const { data, error } = await supabase
    .from('Mensagens')
    .insert({
      conversa_id: conversaId,
      remetente_id: remetenteId,
      texto: textoLimpo,
      lida: false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    throw error;
  }

  return data as Mensagem;
}

/**
 * Marca uma mensagem específica como lida.
 */
export async function marcarMensagemComoLida(
  mensagemId: number
): Promise<void> {
  const { error } = await supabase
    .from('Mensagens')
    .update({
      lida: true,
    })
    .eq('id', mensagemId);

  if (error) {
    console.error('❌ Erro ao marcar mensagem como lida:', error);
    throw error;
  }
}

/**
 * Marca todas as mensagens recebidas de uma conversa como lidas.
 *
 * Não altera mensagens enviadas pelo próprio usuário.
 */
export async function marcarMensagensComoLidas(
  conversaId: number
): Promise<void> {
  const meuId = await getMeuUserId();

  const { error } = await supabase
    .from('Mensagens')
    .update({
      lida: true,
    })
    .eq('conversa_id', conversaId)
    .neq('remetente_id', meuId)
    .eq('lida', false);

  if (error) {
    console.error('❌ Erro ao marcar mensagens como lidas:', error);
    throw error;
  }
}

/**
 * Busca a quantidade de mensagens não lidas
 * nas conversas do usuário atual.
 */
export async function contarMensagensNaoLidas(): Promise<number> {
  const meuId = await getMeuUserId();

  // Primeiro buscamos as conversas das quais o usuário participa.
  const { data: conversas, error: conversasError } = await supabase
    .from('Conversas')
    .select('id')
    .or(`cliente_id.eq.${meuId},prestador_id.eq.${meuId}`);

  if (conversasError) {
    console.error(
      '❌ Erro ao buscar conversas para notificações:',
      conversasError
    );

    throw conversasError;
  }

  if (!conversas || conversas.length === 0) {
    return 0;
  }

  const conversaIds = conversas.map((conversa) => conversa.id);

  const { count, error: mensagensError } = await supabase
    .from('Mensagens')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .in('conversa_id', conversaIds)
    .neq('remetente_id', meuId)
    .eq('lida', false);

  if (mensagensError) {
    console.error(
      '❌ Erro ao contar mensagens não lidas:',
      mensagensError
    );

    throw mensagensError;
  }

  return count ?? 0;
}

/**
 * Inscreve o chat em mensagens novas em tempo real.
 *
 * O componente Chat.tsx poderá utilizar essa função
 * para receber mensagens sem precisar atualizar a página.
 */
export function assinarMensagens(
  conversaId: number,
  onMensagem: (mensagem: Mensagem) => void
) {
  const channel = supabase
    .channel(`chat-conversa-${conversaId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Mensagens',
        filter: `conversa_id=eq.${conversaId}`,
      },
      (payload) => {
        onMensagem(payload.new as Mensagem);
      }
    )
    .subscribe((status) => {
      console.log(
        `📡 Realtime da conversa ${conversaId}:`,
        status
      );
    });

  return channel;
}

/**
 * Encerra uma inscrição Realtime.
 */
export async function cancelarAssinatura(channel: ReturnType<typeof supabase.channel>) {
  await supabase.removeChannel(channel);
}
