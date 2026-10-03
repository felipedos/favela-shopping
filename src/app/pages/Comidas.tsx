import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Food, CATEGORIAS_COMIDA } from '../../types';
import { Search, Filter, UtensilsCrossed } from 'lucide-react';
import SobreModal from '../components/SobreModal';
import ContatoModal from '../components/ContatoModal';
import Cabecalho from '../components/Cabecalho';
import PrivateImage from '../components/PrivateImage';
import Rodape from '../components/Rodape';
import GradeAnunciosDemonstrativos from '../components/GradeAnunciosDemonstrativos';
import { ROTULOS_ACAO_ANUNCIO } from '../../mocks/dadosAnunciosDemonstrativos';

export default function Comidas() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [comidas, setComidas] = useState<Food[]>([]);
  const [fotoUrls, setFotoUrls] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bairroFilter, setBairroFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showSobre, setShowSobre] = useState(false);
  const [showContato, setShowContato] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    loadComidas();
  }, [searchTerm, bairroFilter, categoriaFilter]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('Food')
      .select('categoria');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    // Remove duplicadas
    const unique = [...new Set(data.map(item => item.categoria).filter(Boolean))];
    setCategorias(unique);
  };

  const loadComidas = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('Food')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchTerm) {
        query = query.ilike(
          'nomeFood',
          `%${searchTerm}%`
        );
      }

      if (bairroFilter) {
        query = query.ilike(
          'bairro',
          `%${bairroFilter}%`
        );
      }

      if (categoriaFilter) {
        query = query.ilike(
          'categoria',
          categoriaFilter.toLowerCase()
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const comidasCarregadas =
        (data || []) as Food[];

      setComidas(comidasCarregadas);

      const caminhosFotos =
        comidasCarregadas
          .map((comida) => comida.foto)
          .filter(
            (foto): foto is string =>
              Boolean(foto)
          );

      if (caminhosFotos.length === 0) {
        setFotoUrls({});
        return;
      }

      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from('dados-privados')
        .createSignedUrls(
          caminhosFotos,
          60 * 60
        );

      if (signedError) {
        console.error(
          'Erro ao gerar URLs das imagens:',
          signedError
        );

        setFotoUrls({});
        return;
      }

      const urls: Record<string, string> = {};

      signedData?.forEach((item) => {
        if (
          item.path &&
          item.signedUrl
        ) {
          urls[item.path] =
            item.signedUrl;
        }
      });

      setFotoUrls(urls);

    } catch (error) {
      console.error(
        'Erro ao carregar comidas:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const sair = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <div className="marketplace-page min-h-screen bg-background">
        <Cabecalho showFullMenu={true} />

        <div className="container mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">

          <div className="marketplace-hero marketplace-hero--food rounded-2xl p-6 sm:p-8 mb-8 text-text-main shadow-premium">
            <div className="flex items-center gap-3 mb-3">
              <UtensilsCrossed className="w-10 h-10" />
              <h1 className="text-4xl font-bold">Comidas</h1>
            </div>
            <p className="text-text-muted text-lg">
              Descubra delícias e sabores da sua comunidade
            </p>
          </div>

          <GradeAnunciosDemonstrativos categoryId="alimentacao" />

          <div className="marketplace-filters bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">

              {/* Busca */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Nome da comida..."
                  />
                </div>
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairroFilter}
                  onChange={(e) => setBairroFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Filtrar por bairro..."
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Categoria
                </label>
                <select
                  value={categoriaFilter}
                  onChange={(e) => setCategoriaFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* LISTAGEM */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando comidas...</p>
            </div>
          ) : comidas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhuma comida encontrada</p>
            </div>
          ) : (
            <div className="marketplace-grid marketplace-grid--catalog grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comidas.map((comida) => (
                <Link
                  key={comida.id}
                  to={`/comidas/${comida.id}`}
                  className="marketplace-card mock-ad-card mock-ad-card--catalog group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100"
                >
                  <div className="mock-ad-card__media">
                    {comida.foto && fotoUrls[comida.foto] && (
                      <img
                        src={fotoUrls[comida.foto]}
                        alt={comida.nomeFood || ''}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>

                  <div className="mock-ad-card__body">
                    <div className="mock-ad-card__details">
                      <h3 className="line-clamp-2 min-h-12 font-bold text-text-main">{comida.nomeFood}</h3>
                      {comida.valor !== null && comida.valor !== undefined && (
                        <strong>R$ {Number(comida.valor).toFixed(2)}</strong>
                      )}
                    </div>
                    <div className="mock-ad-card__metadata">
                      {comida.nome && <span><strong>Vendedor:</strong> {comida.nome}</span>}
                      {comida.bairro && <span><strong>Bairro:</strong> {comida.bairro}</span>}
                      {comida.categoria && <span><strong>Categoria:</strong> {comida.categoria}</span>}
                    </div>
                    {comida.categoria && <div className="mock-ad-card__tags"><span>{comida.categoria}</span></div>}
                    <span className="mock-ad-card__action">
                      {ROTULOS_ACAO_ANUNCIO.alimentacao}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Rodape />

      <SobreModal open={showSobre} onClose={() => setShowSobre(false)} />
      <ContatoModal open={showContato} onClose={() => setShowContato(false)} />
    </>
  );
}