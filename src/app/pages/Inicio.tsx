import { Link } from "react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  ShoppingBag,
  Star,
  Utensils,
  Wrench,
} from "lucide-react";
import Cabecalho from "../components/Cabecalho";
import Rodape from "../components/Rodape";
import {
  ANUNCIOS_DEMONSTRATIVOS,
  ROTULOS_ACAO_ANUNCIO,
  CATEGORIAS,
  obterCaminhoDetalheAnuncio,
  type IdCategoria,
} from "../../mocks/dadosAnunciosDemonstrativos";

const demoFoods = ANUNCIOS_DEMONSTRATIVOS.filter((advertisement) => advertisement.categoryId === "alimentacao");
const demoProducts = ANUNCIOS_DEMONSTRATIVOS.filter((advertisement) => advertisement.categoryId === "produtos");
const demoProfessionals = ANUNCIOS_DEMONSTRATIVOS.filter((advertisement) => advertisement.categoryId === "servicos");
const categoryActions: Record<IdCategoria, { label: string; route: string }> = {
  produtos: { label: "Comprar Produtos", route: "/produtos" },
  servicos: { label: "Contratar Serviços", route: "/servicos" },
  alimentacao: { label: "Pedir Comida", route: "/comidas" },
};
const categoryIcons = { produtos: ShoppingBag, servicos: Wrench, alimentacao: Utensils };

const formatarPreco = (price: number | null) =>
  price === null
    ? "A combinar"
    : price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Inicio() {
  return (
    <div className="min-h-screen flex flex-col">
      <Cabecalho showFullMenu={true} />

      <main className="home-surface flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 pb-14 md:px-6 lg:px-8">
          <section className="grid grid-cols-1 items-center gap-12 pt-8 pb-12 lg:grid-cols-2">
            <div className="flex max-w-2xl flex-col justify-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/30 px-3 py-1.5 text-xs font-bold text-text-main">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                A comunidade vende. A comunidade cresce.
              </p>
              <h1 className="mb-4 text-5xl font-black leading-tight tracking-tight text-text-main lg:text-6xl">
                Tem de tudo. Tem <span className="text-secondary">daqui.</span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-text-muted sm:text-lg">
                Comida fresquinha, bons achados e profissionais de confiança, pertinho de você.
              </p>
              <div className="mt-7">
                <h2 className="mb-3 text-sm font-bold text-text-main">O que você quer fazer hoje?</h2>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {CATEGORIAS.map(({ id }) => {
                    const Icon = categoryIcons[id];
                    return (
                      <Link
                        key={id}
                        to={categoryActions[id].route}
                        className="flex min-h-[92px] w-full cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-white p-2 shadow-premium transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-hover sm:gap-3 sm:p-4"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary sm:h-10 sm:w-10">
                          <Icon size={21} strokeWidth={1.8} />
                        </span>
                        <span className="text-[10px] font-bold leading-tight text-text-main sm:text-sm">{categoryActions[id].label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="home-mosaic h-[480px]">
              <Link to={obterCaminhoDetalheAnuncio(demoFoods[0])} className="home-mosaic__main group">
                <img
                  src={demoFoods[0].imageUrl}
                  alt={demoFoods[0].title}
                  className="h-full w-full rounded-2xl object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
                <span className="home-mosaic__badge">Destaque da semana</span>
                <span className="home-mosaic__caption">
                  <span className="block text-xs font-semibold text-white/80">{demoFoods[0].metadata.sellerName}</span>
                  <span className="text-lg font-extrabold text-white">{demoFoods[0].title}</span>
                </span>
              </Link>
              <Link to={obterCaminhoDetalheAnuncio(demoFoods[1])} className="home-mosaic__tile group">
                <img
                  src={demoFoods[1].imageUrl}
                  alt={demoFoods[1].title}
                  className="h-full w-full rounded-2xl object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                />
                <span className="home-mosaic__tile-label">{demoFoods[1].title}</span>
              </Link>
              <Link to={obterCaminhoDetalheAnuncio(demoProfessionals[0])} className="home-mosaic__tile group">
                <img
                  src={demoProfessionals[0].imageUrl}
                  alt={demoProfessionals[0].title}
                  className="h-full w-full rounded-2xl object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                />
                <span className="home-mosaic__tile-label">Talento local</span>
              </Link>
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-secondary">Feito pertinho</p>
                <h2 className="text-2xl font-extrabold text-text-main sm:text-3xl">Sabores da Comunidade <span aria-hidden="true">🍕</span></h2>
                <p className="mt-1 text-sm text-text-muted">Anúncios de demonstração para dar água na boca.</p>
              </div>
              <Link to="/comidas" className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all duration-300 ease-out hover:gap-2">
                Ver comidas <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {demoFoods.map((food) => (
                <Link key={food.id} to={obterCaminhoDetalheAnuncio(food)} className="home-listing-card group flex cursor-pointer flex-col overflow-hidden rounded-card border border-border/40 bg-surface shadow-premium transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100">
                  <span className="home-listing-card__image relative block aspect-[4/3] overflow-hidden">
                    <img src={food.imageUrl} alt={food.title} className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-full bg-accent/90 px-3 py-1 text-xs font-bold text-text-main">{food.tags[0]}</span>
                  </span>
                  <div className="flex min-h-[196px] flex-1 flex-col p-4 sm:p-5">
                    <div className="mb-2 flex min-h-[72px] items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-bold text-text-main">{food.title}</h3>
                      <span className="shrink-0 text-lg font-extrabold text-text-main">{formatarPreco(food.price)}</span>
                    </div>
                    <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-muted">
                      {food.metadata.sellerName && <span><strong>Vendedor:</strong> {food.metadata.sellerName}</span>}
                      <span className="inline-flex items-center gap-1"><MapPin size={13} />{food.metadata.location}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 size={13} />{food.metadata.deliveryTime}</span>
                      <span className="inline-flex items-center gap-1"><Star size={13} className="fill-accent text-accent" />{food.metadata.rating}</span>
                      {food.metadata.subcategory && <span><strong>Categoria:</strong> {food.metadata.subcategory}</span>}
                    </div>
                  </div>
                  <span className="mx-5 mb-5 flex min-h-10 items-center justify-center rounded-button bg-secondary px-5 text-sm font-bold text-white transition-all duration-300 ease-out group-hover:bg-secondary-hover group-hover:shadow-hover">
                    {ROTULOS_ACAO_ANUNCIO[food.categoryId]}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">Uma boa escolha, bem perto</p>
                <h2 className="text-2xl font-extrabold text-text-main sm:text-3xl">Achados da vizinhança</h2>
              </div>
              <Link to="/produtos" className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all duration-300 ease-out hover:gap-2">
                Ver produtos <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {demoProducts.map((product) => (
                <Link key={product.id} to={obterCaminhoDetalheAnuncio(product)} className="home-listing-card group flex cursor-pointer flex-col overflow-hidden rounded-card border border-border/40 bg-surface shadow-premium transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100">
                  <span className="home-listing-card__image relative block aspect-[4/3] overflow-hidden">
                    <img src={product.imageUrl} alt={product.title} className="aspect-[4/3] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]" loading="lazy" />
                    <span className="absolute left-3 top-3 rounded-full bg-accent/90 px-3 py-1 text-xs font-bold text-text-main">{product.tags[0]}</span>
                  </span>
                  <div className="flex min-h-[120px] flex-1 items-start justify-between gap-3 p-4 sm:p-5">
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 min-h-12 font-bold text-text-main">{product.title}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                        {product.metadata.sellerName && <span><strong>Vendedor:</strong> {product.metadata.sellerName}</span>}
                        <span className="inline-flex items-center gap-1"><MapPin size={13} /><strong>Bairro:</strong> {product.metadata.location}</span>
                        {product.metadata.subcategory && <span><strong>Categoria:</strong> {product.metadata.subcategory}</span>}
                        {product.metadata.condition && <span><strong>Condição:</strong> {product.metadata.condition}</span>}
                        {product.metadata.stock !== undefined && <span><strong>Estoque:</strong> {product.metadata.stock}</span>}
                      </div>
                    </div>
                    <span className="shrink-0 text-lg font-extrabold text-text-main">{formatarPreco(product.price)}</span>
                  </div>
                  <span className="mx-5 mb-5 flex min-h-10 items-center justify-center rounded-button bg-secondary px-5 text-sm font-bold text-white transition-all duration-300 ease-out group-hover:bg-secondary-hover group-hover:shadow-hover">{ROTULOS_ACAO_ANUNCIO[product.categoryId]}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-secondary">Gente boa que resolve</p>
                <h2 className="text-2xl font-extrabold text-text-main sm:text-3xl">Profissionais e Serviços Locais <span aria-hidden="true">🛠️</span></h2>
                <p className="mt-1 text-sm text-text-muted">Perfis de demonstração. Encontre mais profissionais na vitrine.</p>
              </div>
              <Link to="/servicos" className="inline-flex items-center gap-1 text-sm font-bold text-primary transition-all duration-300 ease-out hover:gap-2">
                Ver serviços <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {demoProfessionals.map((professional) => (
                <Link key={professional.id} to={obterCaminhoDetalheAnuncio(professional)} className="home-listing-card group flex cursor-pointer flex-col rounded-card border border-border/40 bg-surface p-5 shadow-premium transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100 sm:p-6">
                  <div className="flex items-start gap-4">
                    <img src={professional.imageUrl} alt={professional.title} className="h-16 w-16 shrink-0 rounded-full border-2 border-white object-cover shadow-premium sm:h-[72px] sm:w-[72px]" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-extrabold text-text-main">{professional.metadata.professionalName}</h3>
                        {professional.metadata.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-primary"><BadgeCheck size={14} />Verificada</span>}
                      </div>
                      <p className="mt-1 text-sm text-text-muted">{professional.metadata.professionalRole}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
                        <span className="inline-flex items-center gap-1 font-bold text-text-main"><Star size={14} className="fill-accent text-accent" />{professional.metadata.rating}</span>
                        <span>({professional.metadata.reviewCount} avaliações)</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={13} />{professional.metadata.location}</span>
                        {professional.metadata.subcategory && <span><strong>Categoria:</strong> {professional.metadata.subcategory}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 mb-6 flex flex-wrap gap-2">
                    {professional.tags.map((tag) => <span key={tag} className="rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-text-muted">{tag}</span>)}
                  </div>
                  <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-button border border-primary px-5 py-3 text-sm font-bold text-primary transition-all duration-300 ease-out group-hover:bg-primary group-hover:text-white">
                    <MessageCircle size={17} />
                    Ver perfil e chamar
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Rodape />
    </div>
  );
}
