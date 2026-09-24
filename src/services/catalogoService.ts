import { supabase } from '../lib/supabase';

import type {
  CategoriaAnuncio,
  ItemAnuncio,
  GrupoOpcao,
  OpcaoItem,
  NovaCategoriaAnuncio,
  NovoItemAnuncio,
  NovoGrupoOpcao,
  NovaOpcaoItem,
  TipoAnuncio,
} from '../types/catalogo';

/* ======================================================
   CATEGORIAS
====================================================== */

export async function buscarCategorias(
  tipoAnuncio: TipoAnuncio,
  anuncioId: number
): Promise<CategoriaAnuncio[]> {
  const { data, error } = await supabase
    .from('CategoriasAnuncio')
    .select('*')
    .eq('tipo_anuncio', tipoAnuncio)
    .eq('anuncio_id', anuncioId)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  return (data || []) as CategoriaAnuncio[];
}

export async function criarCategoria(
  categoria: NovaCategoriaAnuncio
): Promise<CategoriaAnuncio> {
  const { data, error } = await supabase
    .from('CategoriasAnuncio')
    .insert({
      tipo_anuncio: categoria.tipo_anuncio,
      anuncio_id: categoria.anuncio_id,
      nome: categoria.nome.trim(),
      ordem: categoria.ordem ?? 0,
      ativo: categoria.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return data as CategoriaAnuncio;
}

export async function atualizarCategoria(
  id: number,
  dados: Partial<
    Pick<CategoriaAnuncio, 'nome' | 'ordem' | 'ativo'>
  >
): Promise<CategoriaAnuncio> {
  const { data, error } = await supabase
    .from('CategoriasAnuncio')
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as CategoriaAnuncio;
}

export async function excluirCategoria(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from('CategoriasAnuncio')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* ======================================================
   ITENS
====================================================== */

export async function buscarItens(
  categoriaId: number
): Promise<ItemAnuncio[]> {
  const { data, error } = await supabase
    .from('ItensAnuncio')
    .select('*')
    .eq('categoria_id', categoriaId)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  return (data || []) as ItemAnuncio[];
}

export async function criarItem(
  item: NovoItemAnuncio
): Promise<ItemAnuncio> {
  const { data, error } = await supabase
    .from('ItensAnuncio')
    .insert({
      categoria_id: item.categoria_id,
      nome: item.nome.trim(),
      descricao: item.descricao?.trim() || null,
      preco: item.preco,
      foto: item.foto || null,
      ordem: item.ordem ?? 0,
      ativo: item.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return data as ItemAnuncio;
}

export async function atualizarItem(
  id: number,
  dados: Partial<
    Pick<
      ItemAnuncio,
      | 'nome'
      | 'descricao'
      | 'preco'
      | 'foto'
      | 'ordem'
      | 'ativo'
    >
  >
): Promise<ItemAnuncio> {
  const { data, error } = await supabase
    .from('ItensAnuncio')
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as ItemAnuncio;
}

export async function excluirItem(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from('ItensAnuncio')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* ======================================================
   GRUPOS DE OPÇÕES
====================================================== */

export async function buscarGruposOpcao(
  itemId: number
): Promise<GrupoOpcao[]> {
  const { data, error } = await supabase
    .from('GruposOpcao')
    .select('*')
    .eq('item_id', itemId)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  return (data || []) as GrupoOpcao[];
}

export async function criarGrupoOpcao(
  grupo: NovoGrupoOpcao
): Promise<GrupoOpcao> {
  const { data, error } = await supabase
    .from('GruposOpcao')
    .insert({
      item_id: grupo.item_id,
      nome: grupo.nome.trim(),
      obrigatorio: grupo.obrigatorio ?? false,
      min_selecoes: grupo.min_selecoes ?? 0,
      max_selecoes: grupo.max_selecoes ?? 1,
      ordem: grupo.ordem ?? 0,
      ativo: grupo.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return data as GrupoOpcao;
}

export async function atualizarGrupoOpcao(
  id: number,
  dados: Partial<
    Pick<
      GrupoOpcao,
      | 'nome'
      | 'obrigatorio'
      | 'min_selecoes'
      | 'max_selecoes'
      | 'ordem'
      | 'ativo'
    >
  >
): Promise<GrupoOpcao> {
  const { data, error } = await supabase
    .from('GruposOpcao')
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as GrupoOpcao;
}

export async function excluirGrupoOpcao(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from('GruposOpcao')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/* ======================================================
   OPÇÕES
====================================================== */

export async function buscarOpcoesItem(
  grupoId: number
): Promise<OpcaoItem[]> {
  const { data, error } = await supabase
    .from('OpcoesItem')
    .select('*')
    .eq('grupo_id', grupoId)
    .order('ordem', { ascending: true })
    .order('id', { ascending: true });

  if (error) throw error;

  return (data || []) as OpcaoItem[];
}

export async function criarOpcaoItem(
  opcao: NovaOpcaoItem
): Promise<OpcaoItem> {
  const { data, error } = await supabase
    .from('OpcoesItem')
    .insert({
      grupo_id: opcao.grupo_id,
      nome: opcao.nome.trim(),
      preco_adicional:
        opcao.preco_adicional ?? 0,
      foto: opcao.foto || null,
      ordem: opcao.ordem ?? 0,
      ativo: opcao.ativo ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return data as OpcaoItem;
}

export async function atualizarOpcaoItem(
  id: number,
  dados: Partial<
    Pick<
      OpcaoItem,
      | 'nome'
      | 'preco_adicional'
      | 'foto'
      | 'ordem'
      | 'ativo'
    >
  >
): Promise<OpcaoItem> {
  const { data, error } = await supabase
    .from('OpcoesItem')
    .update({
      ...dados,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as OpcaoItem;
}

export async function excluirOpcaoItem(
  id: number
): Promise<void> {
  const { error } = await supabase
    .from('OpcoesItem')
    .delete()
    .eq('id', id);

  if (error) throw error;
}