import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Avaliacao } from '../../types';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';

export default function ServicosContratados() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [contratados, setContratados] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadContratados();
  }, [user]);

  const loadContratados = async () => {
    try {
      const { data, error } = await supabase
        .from('Avaliacao')
        .select('*')
        .eq('Tipo', 'servico')
        .or(`emailCliente.eq.${profile?.email},emailPrestador.eq.${profile?.email}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContratados(data || []);
    } catch (error) {
      console.error('Error loading contratados:', error);
    } finally {
      setLoading(false);
    }
  };

  const isCliente = (item: Avaliacao) => item.emailCliente === profile?.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold">
              Serviços Contratados / Meus Clientes
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : contratados.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">Nenhum serviço contratado ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contratados.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">{item.nomeServico}</h3>
                      <p className="text-gray-600 mb-1">
                        <strong>{isCliente(item) ? 'Prestador' : 'Cliente'}:</strong>{' '}
                        {isCliente(item) ? item.nomeServico : item.nomeCliente}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <strong>Bairro:</strong>{' '}
                        {isCliente(item) ? item.bairroServico : item.bairroCliente}
                      </p>
                      <p className="text-sm text-gray-500">
                        Contato em: {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <Link
                      to={`/avaliar-servico/${item.id}`}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                      Avaliar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}