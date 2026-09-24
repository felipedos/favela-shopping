export type TipoAnuncio = 'produto' | 'comida';

export interface CategoriaAnuncio {
  id: number;
  tipo_anuncio: TipoAnuncio;
  anuncio_id: number;
  nome: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemAnuncio {
  id: number;
  categoria_id: number;
  nome: string;
  descricao: string | null;
  preco: number;
  foto: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface GrupoOpcao {
  id: number;
  item_id: number;
  nome: string;
  obrigatorio: boolean;
  min_selecoes: number;
  max_selecoes: number;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface OpcaoItem {
  id: number;
  grupo_id: number;
  nome: string;
  preco_adicional: number;
  foto: string | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

/*
 * Tipos usados durante os cadastros.
 * Não possuem id/created_at porque esses campos
 * serão criados pelo banco.
 */

export interface NovaCategoriaAnuncio {
  tipo_anuncio: TipoAnuncio;
  anuncio_id: number;
  nome: string;
  ordem?: number;
  ativo?: boolean;
}

export interface NovoItemAnuncio {
  categoria_id: number;
  nome: string;
  descricao?: string | null;
  preco: number;
  foto?: string | null;
  ordem?: number;
  ativo?: boolean;
}

export interface NovoGrupoOpcao {
  item_id: number;
  nome: string;
  obrigatorio?: boolean;
  min_selecoes?: number;
  max_selecoes?: number;
  ordem?: number;
  ativo?: boolean;
}

export interface NovaOpcaoItem {
  grupo_id: number;
  nome: string;
  preco_adicional?: number;
  foto?: string | null;
  ordem?: number;
  ativo?: boolean;
}