import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Link } from "react-router";
import {
  ANUNCIOS_DEMONSTRATIVOS,
  ROTULOS_ACAO_ANUNCIO,
  CATEGORIAS,
  IdCategoria,
  obterCaminhoDetalheAnuncio,
} from "../../mocks/dadosAnunciosDemonstrativos";

interface PropriedadesGradeAnunciosDemonstrativos {
  categoryId: IdCategoria;
}

const formatarPreco = (price: number | null) =>
  price === null
    ? "Orçamento"
    : price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function GradeAnunciosDemonstrativos({ categoryId }: PropriedadesGradeAnunciosDemonstrativos) {
  const category = CATEGORIAS.find((item) => item.id === categoryId);
  const advertisements = ANUNCIOS_DEMONSTRATIVOS.filter((item) => item.categoryId === categoryId);
  const isServiceCategory = categoryId === "servicos";

  if (!category || advertisements.length === 0) return null;

  return (
    <section className="mock-advertisements mb-8" aria-labelledby={`mock-heading-${categoryId}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-secondary">Conteúdo de demonstração</p>
          <h2 id={`mock-heading-${categoryId}`} className="mt-1 text-xl font-bold text-text-main">Destaques de {category.name}</h2>
        </div>
        <span className="rounded-full bg-accent/50 px-3 py-1 text-xs font-bold text-text-main">Dados mockados</span>
      </div>

      <div className={`mock-ad-grid ${isServiceCategory ? "mock-ad-grid--services" : "mock-ad-grid--catalog"}`}>
        {advertisements.map((advertisement) => (
          <Link
            key={advertisement.id}
            to={obterCaminhoDetalheAnuncio(advertisement)}
            className={`marketplace-card mock-ad-card group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100 ${isServiceCategory ? "mock-ad-card--service" : "mock-ad-card--catalog"}`}
          >
            {isServiceCategory ? (
              <>
                <div className="mock-ad-service-head">
                  <img src={advertisement.imageUrl} alt={advertisement.metadata.professionalName || advertisement.title} className="mock-ad-avatar" loading="lazy" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="line-clamp-2 min-h-12 font-bold text-text-main">{advertisement.metadata.professionalName}</h3>
                      {advertisement.metadata.isVerified && <BadgeCheck size={16} className="shrink-0 text-primary" aria-label="Profissional verificado" />}
                    </div>
                    <p className="text-sm text-text-muted">{advertisement.metadata.professionalRole}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                      <span><strong>Prestador:</strong> {advertisement.metadata.professionalName}</span>
                      <span><strong>Bairro:</strong> {advertisement.metadata.location}</span>
                    </div>
                  </div>
                </div>
                <div className="mock-ad-card__body">
                  <div className="mock-ad-card__details">
                    <span className="inline-flex items-center gap-1 font-bold text-text-main"><Star size={14} className="fill-accent text-accent" />{advertisement.metadata.rating}</span>
                    <span className="text-text-muted">({advertisement.metadata.reviewCount} avaliações)</span>
                    <span className="inline-flex items-center gap-1 text-text-muted"><MapPin size={13} />{advertisement.metadata.location}</span>
                  </div>
                  <div className="mock-ad-card__tags">
                    {advertisement.metadata.subcategory && <span>Categoria: {advertisement.metadata.subcategory}</span>}
                    {advertisement.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <span className="mock-ad-card__action mock-ad-card__action--service">{ROTULOS_ACAO_ANUNCIO[advertisement.categoryId]}</span>
                </div>
              </>
            ) : (
              <>
                <div className="mock-ad-card__media">
                  <img src={advertisement.imageUrl} alt={advertisement.title} loading="lazy" />
                  {advertisement.tags[0] && <span>{advertisement.tags[0]}</span>}
                </div>
                <div className="mock-ad-card__body">
                  <div className="mock-ad-card__details">
                    <h3 className="line-clamp-2 min-h-12 font-bold text-text-main">{advertisement.title}</h3>
                    <strong>{formatarPreco(advertisement.price)}</strong>
                  </div>
                  <div className="mock-ad-card__metadata">
                    {advertisement.metadata.sellerName && <span><strong>Vendedor:</strong> {advertisement.metadata.sellerName}</span>}
                    <span className="inline-flex items-center gap-1"><MapPin size={13} /><strong>Bairro:</strong> {advertisement.metadata.location}</span>
                    {advertisement.metadata.subcategory && <span><strong>Categoria:</strong> {advertisement.metadata.subcategory}</span>}
                    {advertisement.metadata.deliveryTime && <span>{advertisement.metadata.deliveryTime}</span>}
                    {advertisement.metadata.rating && <span className="inline-flex items-center gap-1"><Star size={13} className="fill-accent text-accent" />{advertisement.metadata.rating}</span>}
                    {advertisement.metadata.condition && <span><strong>Condição:</strong> {advertisement.metadata.condition}</span>}
                    {advertisement.metadata.stock !== undefined && <span><strong>Estoque:</strong> {advertisement.metadata.stock}</span>}
                  </div>
                  <div className="mock-ad-card__tags">
                    {advertisement.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <span className="mock-ad-card__action">{ROTULOS_ACAO_ANUNCIO[advertisement.categoryId]}</span>
                </div>
              </>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}