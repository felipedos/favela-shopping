import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Package, ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIAS_PRODUTO } from '../../types';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';

export default function CadastrarProduto() {
  const navigate = useNavigate();
  const { user, userProfile, isProfileComplete } = useAuth();
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState('');
  const [formData, setFormData] = useState({
    nomeProduto: '',
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
      alert('Complete seu perfil antes de cadastrar um produto');
      navigate('/finalizar-cadastro');
    }
  }, [user, isProfileComplete, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('Produto').insert({
        email: user.email,
        nome: userProfile.nome,
        cpfCnpj: userProfile.cpfCnpj,
        ddd: userProfile.ddd,
        whatsapp: userProfile.whatsapp,
        cep: userProfile.cep,
        bairro: userProfile.bairro,
        numero: userProfile.numero,
        complemento: userProfile.complemento,
        nomeProduto: formData.nomeProduto,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        foto: foto || null,
      });

      if (error) throw error;

      alert('Produto cadastrado com sucesso!');
      navigate('/produtos');
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      alert('Erro ao cadastrar produto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cadastrar Produto</h1>
              <p className="text-gray-600">Divulgue seus produtos na comunidade</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Foto do Produto
              </label>
              <ImageUpload
                bucket="produto"
                onUpload={setFoto}
                currentImage={foto}
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                required
                value={formData.nomeProduto}
                onChange={(e) => setFormData({ ...formData, nomeProduto: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Cesta de produtos orgânicos"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_PRODUTO.map(cat => (
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Descreva seu produto, condições, detalhes importantes..."
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-sky-600 text-white py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-sky-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}