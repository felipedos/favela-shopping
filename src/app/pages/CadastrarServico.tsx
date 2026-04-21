import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CATEGORIAS_SERVICO } from '../../types';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft } from 'lucide-react';

export default function CadastrarServico() {
  const { user, profile, isProfileComplete } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nomeServico: '',
    categoria: '',
    descricao: '',
    valor: '',
    foto: '',
  });

  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!isProfileComplete()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Cadastro Incompleto</h2>
            <p className="text-gray-700 mb-6">
              Você precisa completar seu cadastro antes de cadastrar serviços.
            </p>
            <button
              onClick={() => navigate('/finalizar-cadastro')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Completar Cadastro
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('Servico').insert({
        id_usuario: profile?.id,
        nomeServico: formData.nomeServico,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor) || null,
        foto: formData.foto,
        nome: profile?.nome,
        email: profile?.email,
        bairro: profile?.bairro,
        favela: profile?.favela,
        whatsapp: profile?.whatsapp,
        ddd: profile?.ddd,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      alert('Serviço cadastrado com sucesso!');
      navigate('/servicos');
    } catch (error) {
      alert('Erro ao cadastrar serviço');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="text-purple-600 hover:text-purple-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-purple-600">Cadastrar Serviço</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <ImageUpload
              label="Foto do Serviço"
              bucket="servico"
              onUpload={(url) => setFormData({ ...formData, foto: url })}
              currentImage={formData.foto}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Serviço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nomeServico}
                onChange={(e) => setFormData({ ...formData, nomeServico: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_SERVICO.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Informações de contato:</strong> Serão utilizados o telefone ({profile?.ddd}{' '}
                {profile?.whatsapp}) e bairro ({profile?.bairro}) do seu cadastro.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}