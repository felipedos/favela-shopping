export interface Servico {
  id: number;
  created_at: string;
  id_usuario: number;
  favela: string | null;
  bairro: string | null;
  categoria: string | null;
  nome: string | null;
  descricao: string | null;
  inico: string | null;
  fim: string | null;
  valor: number | null;
  foto: string | null;
  nomeServico: string | null;
  email: string | null;
  whatsapp: string | null;
  keywords: string | null;
  ddd: string | null;
}

export interface Produto {
  id: number;
  created_at: string;
  id_usuario: number;
  favela: string | null;
  bairro: string | null;
  categoria: string | null;
  nome: string | null;
  descricao: string | null;
  inico: string | null;
  fim: string | null;
  valor: string | null;
  foto: string | null;
  nomeProduto: string | null;
  email: string | null;
  whatsapp: string | null;
  keywords: string | null;
  ddd: string | null;
}

export interface Food {
  id: number;
  created_at: string;
  id_usuario: number;
  favela: string | null;
  bairro: string | null;
  categoria: string | null;
  nome: string | null;
  descricao: string | null;
  inico: string | null;
  fim: string | null;
  valor: number | null;
  foto: string | null;
  nomeFood: string | null;
  email: string | null;
  whatsapp: string | null;
  keywords: string | null;
  ddd: string | null;
}

export interface Avaliacao {
  id: number;
  created_at: string;
  id_servico: number | null;
  id_user: number | null;
  avaPrestador: number | null;
  avaConsumidor: number | null;
  nomeServico: string | null;
  nomeCliente: string | null;
  bairroServico: string | null;
  bairroCliente: string | null;
  mensagem: string | null;
  emailCliente: string | null;
  emailPrestador: string | null;
  Tipo: string | null;
}

export const CATEGORIAS_SERVICO = [
  'Beleza e Estética',
  'Construção e Reformas',
  'Educação',
  'Eletrônica e Tecnologia',
  'Limpeza',
  'Manutenção',
  'Saúde',
  'Transporte',
  'Outros',
];

export const CATEGORIAS_PRODUTO = [
  'Artesanato',
  'Bebidas',
  'Eletrônicos',
  'Moda e Acessórios',
  'Móveis e Decoração',
  'Outros',
];

export const CATEGORIAS_COMIDA = [
  'Brasileira',
  'Lanches',
  'Doces e Sobremesas',
  'Bebidas',
  'Refeições Completas',
  'Outros',
];