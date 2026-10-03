import type { ReactNode } from "react";
import { BadgeCheck, MapPin, Star, Tag } from "lucide-react";
import { Link } from "react-router";
import AcoesContatoDetalhe from "./AcoesContatoDetalhe";
import { useAuth } from "../../contexts/AuthContext";
import { ROTAS_CATEGORIA, CATEGORIAS, type IdCategoria } from "../../mocks/dadosAnunciosDemonstrativos";

export interface DadosDetalheAnuncio {
  categoryId: IdCategoria;
  title: string;
  detailId: string | number;
  description?: string | null;
  price?: number | null;
  imageUrl?: string | null;
  imageElement?: ReactNode;
  imageIsAvatar?: boolean;
  sellerName?: string | null;
  location?: string | null;
  subcategory?: string | null;
  condition?: string | null;
  stock?: number | null;
  deliveryTime?: string | null;
  deliveryFee?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  isVerified?: boolean;
  professionalRole?: string | null;
  tags?: string[];
  startTime?: string | null;
  endTime?: string | null;
}

interface PropriedadesLayoutDetalheAnuncio {
  item: DadosDetalheAnuncio;
  onContact?: () => void;
  isDemo?: boolean;
  children?: ReactNode;
}

const formatarPreco = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function LayoutDetalheAnuncio({
  item,
  onContact,
  isDemo = false,
  children,
}: PropriedadesLayoutDetalheAnuncio) {
  const { user } = useAuth();
  const category = CATEGORIAS.find((entry) => entry.id === item.categoryId);
  const isService = item.categoryId === "servicos";
  const categoryPath = ROTAS_CATEGORIA[item.categoryId];
  const detailPath = `${categoryPath}/${item.detailId}`;
  const schedule = [item.startTime, item.endTime].filter(Boolean).join(" - ");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
      <Link to={categoryPath} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all duration-300 ease-out hover:text-primary-hover">
        <span aria-hidden="true">←</span> Voltar para {category?.name}
      </Link>
      <article className="mx-auto max-w-4xl overflow-hidden rounded-card border border-border bg-surface shadow-premium">
        {isService ? (
          <header className="flex flex-col gap-5 border-b border-border p-6 sm:flex-row sm:items-center sm:p-8">
            {(item.imageElement || item.imageUrl) && (
              <div className={`h-24 w-24 shrink-0 overflow-hidden shadow-premium ${item.imageIsAvatar ? "rounded-full" : "rounded-xl"}`}>
                {item.imageElement || <img src={item.imageUrl || ""} alt={item.sellerName || item.title} />}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-text-main">{item.sellerName || item.title}</h1>
                {item.isVerified && <BadgeCheck size={19} className="text-primary" aria-label="Profissional verificado" />}
              </div>
              <p className="mt-1 text-text-muted">{item.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-muted">
                {item.rating !== null && item.rating !== undefined && (
                  <span className="inline-flex items-center gap-1 font-semibold text-text-main">
                    <Star size={15} className="fill-accent text-accent" />
                    {item.rating}{item.reviewCount !== null && item.reviewCount !== undefined ? ` (${item.reviewCount} avaliações)` : ""}
                  </span>
                )}
                {item.location && <span className="inline-flex items-center gap-1"><MapPin size={15} />{item.location}</span>}
              </div>
            </div>
          </header>
        ) : (
          (item.imageElement || item.imageUrl) && (
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-background sm:aspect-[16/7]">
              {item.imageElement || <img src={item.imageUrl || ""} alt={item.title} className="h-full w-full object-cover" />}
              {item.tags?.[0] && <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-text-main">{item.tags[0]}</span>}
            </div>
          )
        )}

        <div className="p-6 sm:p-8">
          {!isService && (
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-text-main">{item.title}</h1>
                {category && <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-sm font-semibold text-text-muted"><Tag size={15} />{category.name}</span>}
              </div>
              {item.price !== null && item.price !== undefined && <strong className="text-2xl text-primary">{formatarPreco(item.price)}</strong>}
            </div>
          )}

          {isService && item.price !== null && item.price !== undefined && (
            <p className="mb-5 text-lg font-bold text-primary">Valor: {formatarPreco(item.price)}</p>
          )}

          <dl className="mb-5 grid gap-3 rounded-xl bg-background p-4 text-sm sm:grid-cols-2">
            {isService && item.sellerName && <div><dt className="font-bold text-text-main">Prestador</dt><dd className="text-text-muted">{item.sellerName}</dd></div>}
            {!isService && item.sellerName && <div><dt className="font-bold text-text-main">Vendedor</dt><dd className="text-text-muted">{item.sellerName}</dd></div>}
            {item.location && <div><dt className="font-bold text-text-main">Bairro</dt><dd className="text-text-muted">{item.location}</dd></div>}
            {item.subcategory && <div><dt className="font-bold text-text-main">Categoria</dt><dd className="text-text-muted">{item.subcategory}</dd></div>}
            {item.condition && <div><dt className="font-bold text-text-main">Condição</dt><dd className="text-text-muted">{item.condition}</dd></div>}
            {item.stock !== null && item.stock !== undefined && <div><dt className="font-bold text-text-main">Estoque</dt><dd className="text-text-muted">{item.stock}</dd></div>}
            {item.deliveryTime && <div><dt className="font-bold text-text-main">Tempo de entrega</dt><dd className="text-text-muted">{item.deliveryTime}</dd></div>}
            {item.deliveryFee !== null && item.deliveryFee !== undefined && <div><dt className="font-bold text-text-main">Frete</dt><dd className="text-text-muted">{item.deliveryFee === 0 ? "Entrega grátis" : formatarPreco(item.deliveryFee)}</dd></div>}
            {schedule && <div><dt className="font-bold text-text-main">Horário</dt><dd className="text-text-muted">{schedule}</dd></div>}
            {item.rating !== null && item.rating !== undefined && <div><dt className="font-bold text-text-main">Avaliação</dt><dd className="inline-flex items-center gap-1 text-text-muted"><Star size={14} className="fill-accent text-accent" />{item.rating}{item.reviewCount !== null && item.reviewCount !== undefined ? ` (${item.reviewCount} avaliações)` : ""}</dd></div>}
          </dl>

          {item.description && (
            <section className="mb-5">
              <h2 className="mb-2 text-lg font-bold text-text-main">Descrição</h2>
              <p className="whitespace-pre-line leading-7 text-text-muted">{item.description}</p>
            </section>
          )}

          {item.tags && item.tags.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {item.tags.map((tag) => <span key={tag} className="rounded-full bg-background px-3 py-1.5 text-sm font-semibold text-text-muted">{tag}</span>)}
            </div>
          )}

          <AcoesContatoDetalhe
            isAuthenticated={Boolean(user)}
            isDemo={isDemo}
            returnTo={detailPath}
            categoryPath={categoryPath}
            audience={isService ? "prestador" : "vendedor"}
            onContact={onContact}
          />
          {children}
        </div>
      </article>
    </main>
  );
}
