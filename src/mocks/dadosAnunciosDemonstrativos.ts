export const CATEGORIAS = [
  {
    id: "produtos",
    name: "Produtos",
    icon: "ShoppingBag",
    description: "Compre e venda produtos por perto",
  },
  {
    id: "servicos",
    name: "Serviços",
    icon: "Wrench",
    description: "Encontre profissionais da sua comunidade",
  },
  {
    id: "alimentacao",
    name: "Alimentação",
    icon: "Utensils",
    description: "Sabores locais feitos com carinho",
  },
] as const;

export type IdCategoria = (typeof CATEGORIAS)[number]["id"];

export interface MetadadosAnuncio {
  deliveryTime?: string;
  rating?: number;
  reviewCount?: number;
  deliveryFee?: number;
  condition?: string;
  stock?: number;
  isVerified?: boolean;
  location?: string;
  professionalName?: string;
  professionalRole?: string;
  sellerName?: string;
  subcategory?: string;
}

interface BaseAnuncio {
  id: string;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string;
  metadata: MetadadosAnuncio;
  tags: string[];
  detailId: string;
}

export type Anuncio = BaseAnuncio & (
  | { categoryId: "servicos"; serviceId: string }
  | { categoryId: "produtos"; productId: string; serviceId?: never }
  | { categoryId: "alimentacao"; foodId: string; serviceId?: never }
);

export const ROTULOS_ACAO_ANUNCIO: Record<IdCategoria, string> = {
  produtos: "Ver produto",
  servicos: "Ver perfil",
  alimentacao: "Ver comida",
};

export const ROTAS_CATEGORIA: Record<IdCategoria, string> = {
  produtos: "/produtos",
  servicos: "/servicos",
  alimentacao: "/comidas",
};

export const obterCaminhoDetalheAnuncio = (advertisement: Anuncio) => {
  return `${ROTAS_CATEGORIA[advertisement.categoryId]}/${advertisement.detailId}`;
};

export const ANUNCIOS_DEMONSTRATIVOS: Anuncio[] = [
  {
    id: "adv-001",
    categoryId: "alimentacao",
    foodId: "demo-x-tudo",
    detailId: "demo-x-tudo",
    title: "X-Tudo Artesanal Tremendo",
    description: "Hambúrguer artesanal preparado na hora, com carne suculenta, queijo derretido e molho especial da casa.",
    price: 28.9,
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
    metadata: {
      deliveryTime: "25-35 min",
      rating: 4.9,
      reviewCount: 142,
      deliveryFee: 0,
      location: "Campo Grande",
      sellerName: "Lanche do Beto",
      subcategory: "Lanches",
    },
    tags: ["Entrega Grátis", "Mais Pedido"],
  },
  {
    id: "adv-002",
    categoryId: "produtos",
    productId: "demo-tenis-veloz",
    detailId: "demo-tenis-veloz",
    title: "Tênis Casual Veloz",
    description: "Tênis casual confortável para o dia a dia, com solado leve e ótimo acabamento.",
    price: 129.9,
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    metadata: {
      condition: "Novo",
      stock: 5,
      location: "Bangu",
      sellerName: "Loja do Júnior",
      subcategory: "Moda e Acessórios",
    },
    tags: ["Destaque"],
  },
  {
    id: "adv-003",
    categoryId: "servicos",
    serviceId: "demo-marta-silva",
    detailId: "demo-marta-silva",
    title: "Marta Silva - Manicure & Nail Design",
    description: "Atendimento cuidadoso para unhas impecáveis, com opções de alongamento e esmaltação em gel.",
    price: null,
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&h=240&q=85",
    metadata: {
      isVerified: true,
      rating: 4.8,
      reviewCount: 89,
      location: "Bloco B",
      professionalName: "Marta Silva",
      professionalRole: "Manicure & Nail Design",
      subcategory: "Beleza e Estética",
    },
    tags: ["Alongamento", "Gel"],
  },
  {
    id: "adv-004",
    categoryId: "alimentacao",
    foodId: "demo-acai-completo",
    detailId: "demo-acai-completo",
    title: "Açaí Completo 500ml",
    description: "Açaí cremoso servido com frutas frescas e acompanhamentos à sua escolha.",
    price: 22,
    imageUrl:
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=900&q=85",
    metadata: {
      deliveryTime: "20-30 min",
      rating: 4.9,
      reviewCount: 96,
      deliveryFee: 4.5,
      location: "Santíssimo",
      sellerName: "Açaí da Praça",
      subcategory: "Doces e Sobremesas",
    },
    tags: ["Mais Pedido"],
  },
  {
    id: "adv-005",
    categoryId: "alimentacao",
    foodId: "demo-bolo-cenoura",
    detailId: "demo-bolo-cenoura",
    title: "Bolo de Cenoura com Brigadeiro",
    description: "Bolo caseiro fofinho, coberto com brigadeiro artesanal e preparado no mesmo dia.",
    price: 16,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=85",
    metadata: {
      deliveryTime: "Retirada hoje",
      rating: 5,
      reviewCount: 34,
      deliveryFee: 0,
      location: "Realengo",
      sellerName: "Doce da Nanda",
      subcategory: "Doces e Sobremesas",
    },
    tags: ["Feito Hoje"],
  },
  {
    id: "adv-006",
    categoryId: "produtos",
    productId: "demo-relogio-classico",
    detailId: "demo-relogio-classico",
    title: "Relógio Clássico",
    description: "Relógio clássico seminovo, revisado e em ótimo estado de conservação.",
    price: 89,
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    metadata: {
      condition: "Seminovo",
      stock: 1,
      location: "Padre Miguel",
      sellerName: "Brechó da Praça",
      subcategory: "Moda e Acessórios",
    },
    tags: ["Destaque"],
  },
  {
    id: "adv-007",
    categoryId: "produtos",
    productId: "demo-camera-instantanea",
    detailId: "demo-camera-instantanea",
    title: "Câmera Instantânea Compacta",
    description: "Câmera compacta para registrar e revelar seus momentos especiais na hora.",
    price: 245,
    imageUrl:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85",
    metadata: {
      condition: "Novo",
      stock: 2,
      location: "Realengo",
      sellerName: "Tech Realengo",
      subcategory: "Eletrônicos",
    },
    tags: ["Oportunidade"],
  },
  {
    id: "adv-008",
    categoryId: "servicos",
    serviceId: "demo-carlos-reformas",
    detailId: "demo-carlos-reformas",
    title: "Carlos Reformas & Elétrica",
    description: "Serviços de elétrica e reformas residenciais, incluindo pintura e pequenos reparos.",
    price: null,
    imageUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&h=240&q=85",
    metadata: {
      isVerified: true,
      rating: 4.8,
      reviewCount: 86,
      location: "Bangu",
      professionalName: "Carlos Reformas",
      professionalRole: "Reformas & Elétrica",
      subcategory: "Construção e Reformas",
    },
    tags: ["Elétrica", "Pintura", "Reparos"],
  },
];