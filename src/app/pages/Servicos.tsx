import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Servico, CATEGORIAS_SERVICO } from '../../types';
import {  Wrench, LogOut, Search, Filter } from 'lucide-react';
import SobreModal from '../components/SobreModal';
import ContatoModal from '../components/ContatoModal';
import Cabecalho from '../components/Cabecalho';
import PrivateImage from '../components/PrivateImage';
import Rodape from '../components/Rodape';
import GradeAnunciosDemonstrativos from '../components/GradeAnunciosDemonstrativos';
import { ROTULOS_ACAO_ANUNCIO } from '../../mocks/dadosAnunciosDemonstrativos';

export default function Servicos() {
  const { user, signOut, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [fotoUrls, setFotoUrls] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bairroFilter, setBairroFilter] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [showSobre, setShowSobre] = useState(false);
  const [showContato, setShowContato] = useState(false);
  const [categorias, setCategorias] = useState<string[]>([]);

  useEffect(() => {
    loadServicos();
  }, [searchTerm, bairroFilter, categoriaFilter]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('Servico')
      .select('categoria');

    if (error) {
      console.error('Erro ao buscar categorias:', error);
      return;
    }

    // Remove duplicadas
    const unique = [...new Set(data.map(item => item.categoria).filter(Boolean))];
    setCategorias(unique);
  };
  
  const loadServicos = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('Servico')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (searchTerm) {
        query = query.ilike(
          'nomeServico',
          `%${searchTerm}%`
        );
      }

      if (bairroFilter) {
        query = query.eq(
          'bairro',
          bairroFilter
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

      const servicosCarregados =
        (data || []) as Servico[];

      setServicos(servicosCarregados);

      const caminhosFotos =
        servicosCarregados
          .map((servico) => servico.foto)
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
        'Erro ao carregar serviços:',
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

            <div className="marketplace-hero marketplace-hero--services rounded-2xl p-6 sm:p-8 mb-8 text-text-main shadow-premium">
            <div className="flex items-center gap-3 mb-3">
                <Wrench className="w-10 h-10" />
                <h1 className="text-4xl font-bold">Serviços</h1>
            </div>
            <p className="text-text-muted text-lg">
                Encontre profissionais e serviços na sua comunidade
            </p>
            </div>
          <GradeAnunciosDemonstrativos categoryId="servicos" />
          <div className="marketplace-filters bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Filtros</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nome
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Nome do serviço..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando serviços...</p>
            </div>
          ) : servicos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum serviço encontrado</p>
            </div>
          ) : (
            <div className="marketplace-grid marketplace-grid--services grid md:grid-cols-2 gap-6">
              {servicos.map((servico) => (
                <Link
                  key={servico.id}
                  to={`/servicos/${servico.id}`}
                  className="marketplace-card mock-ad-card mock-ad-card--service group cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-hover active:scale-[0.98] active:duration-100"
                >
                  <div className="mock-ad-service-head">
                    {servico.foto && fotoUrls[servico.foto] ? (
                      <img
                        src={fotoUrls[servico.foto]}
                        alt={servico.nomeServico || ''}
                        className="mock-ad-avatar"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="mock-ad-avatar flex items-center justify-center bg-background text-primary">
                        <Wrench size={24} />
                      </div>
                    )}
                    <div className="min-w-0">
                      {servico.nome && <p className="text-xs font-semibold text-text-muted">Prestador local</p>}
                      <h3 className="line-clamp-2 min-h-12 font-bold text-text-main">{servico.nomeServico}</h3>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                        {servico.nome && <span><strong>Prestador:</strong> {servico.nome}</span>}
                        {servico.bairro && <span><strong>Bairro:</strong> {servico.bairro}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="mock-ad-card__body">
                    <div className="mock-ad-card__details">
                      {servico.valor !== null && servico.valor !== undefined && <strong>{Number(servico.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>}
                      {servico.categoria && <span><strong>Categoria:</strong> {servico.categoria}</span>}
                      {(servico.inico || servico.fim) && <span><strong>Horário:</strong> {[servico.inico, servico.fim].filter(Boolean).join(' - ')}</span>}
                    </div>
                    {servico.categoria && <div className="mock-ad-card__tags"><span>{servico.categoria}</span></div>}
                    <span className="mock-ad-card__action mock-ad-card__action--service">
                      {ROTULOS_ACAO_ANUNCIO.servicos}
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