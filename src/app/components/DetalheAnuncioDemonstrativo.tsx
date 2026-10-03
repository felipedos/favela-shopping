import LayoutDetalheAnuncio, { type DadosDetalheAnuncio } from "./LayoutDetalheAnuncio";
import type { Anuncio } from "../../mocks/dadosAnunciosDemonstrativos";

interface PropriedadesDetalheAnuncioDemonstrativo {
  advertisement: Anuncio;
}

export default function DetalheAnuncioDemonstrativo({ advertisement }: PropriedadesDetalheAnuncioDemonstrativo) {
  const isService = advertisement.categoryId === "servicos";
  const item: DadosDetalheAnuncio = {
    categoryId: advertisement.categoryId,
    detailId: advertisement.detailId,
    title: isService
      ? advertisement.metadata.professionalRole || advertisement.title
      : advertisement.title,
    description: advertisement.description,
    price: advertisement.price,
    imageUrl: advertisement.imageUrl,
    imageIsAvatar: isService,
    sellerName: isService
      ? advertisement.metadata.professionalName
      : advertisement.metadata.sellerName,
    location: advertisement.metadata.location,
    subcategory: advertisement.metadata.subcategory,
    condition: advertisement.metadata.condition,
    stock: advertisement.metadata.stock,
    deliveryTime: advertisement.metadata.deliveryTime,
    deliveryFee: advertisement.metadata.deliveryFee,
    rating: advertisement.metadata.rating,
    reviewCount: advertisement.metadata.reviewCount,
    isVerified: advertisement.metadata.isVerified,
    professionalRole: advertisement.metadata.professionalRole,
    tags: advertisement.tags,
  };

  return <LayoutDetalheAnuncio item={item} isDemo />;
}