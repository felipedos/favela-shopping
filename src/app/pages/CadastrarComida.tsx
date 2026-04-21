import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { UtensilsCrossed, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIAS_COMIDA } from '../../types';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';

export default function CadastrarComida() {
  const navigate = useNavigate();
  const { user, userProfile, isProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState('');
  const [formData, setFormData] = useState({
    nomeFood: '',
    categoria: '',
    descricao: '',
    valor: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login-cadastro');
      return;
    }
    if (!isProfileComplete()) {
      alert('Complete seu perfil antes de cadastrar uma comida');
      navigate('/finalizar-cadastro');
    }
  }, [user, isProfileComplete, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('Food').insert({
        email: user.email,
        nome: userProfile.nome,
        cpfCnpj: userProfile.cpfCnpj,
        ddd: userProfile.ddd,
        whatsapp: userProfile.whatsapp,
        cep: userProfile.cep,
        bairro: userProfile.bairro,
        numero: userProfile.numero,
        complemento: userProfile.complemento,
        nomeFood: formData.nomeFood,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        foto: foto || null,
      });

      if (error) throw error;

      alert('Comida cadastrada com sucesso!');
      navigate('/comidas');
    } catch (error) {
      console.error('Erro ao cadastrar comida:', error);
      alert('Erro ao cadastrar comida. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-3 rounded-lg">
              <UtensilsCrossed className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cadastrar Comida</h1>
              <p className="text-gray-600">Divulgue suas delícias na comunidade</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Foto da Comida
              </label>
              <ImageUpload
                bucket="food"
                onUpload={setFoto}
                currentImage={foto}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nome da Comida *
              </label>
              <input
                type="text"
                required
                value={formData.nomeFood}
                onChange={(e) => setFormData({ ...formData, nomeFood: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Ex: Feijoada Completa"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Categoria *
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_COMIDA.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Descrição
              </label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows={5}
                placeholder="Descreva sua comida, ingredientes, porções, horários de entrega..."
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-4 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Comida'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}