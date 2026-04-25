import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';

export default function EditarPerfil() {
  const { user, userProfile, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    ddd: '',
    whatsapp: '',
    cep: '',
    bairro: '',
    numero: '',
    complemento: '',
    favela: '',
    self: '',
    documento: '',
  });

  const [loading, setLoading] = useState(false);

  // Carregar dados do perfil quando o componente montar
  useEffect(() => {
    if (userProfile) {
      setFormData({
        nome: userProfile.nome || '',
        cpf: userProfile.cpfCnpj || '',
        ddd: userProfile.ddd || '',
        whatsapp: userProfile.whatsapp || '',
        cep: userProfile.cep || '',
        bairro: userProfile.bairro || '',
        numero: userProfile.numero?.toString() || '',
        complemento: userProfile.complemento || '',
        favela: userProfile.favela || '',
        self: userProfile.self || '',
        documento: userProfile.documento || '',
      });
    }
  }, [userProfile]);

  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!user) {
      navigate('/login-cadastro');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        nome: formData.nome,
        cpfCnpj: formData.cpf,
        ddd: formData.ddd,
        whatsapp: formData.whatsapp,
        cep: formData.cep,
        bairro: formData.bairro,
        numero: formData.numero ? parseInt(formData.numero) : null,
        complemento: formData.complemento,
        favela: formData.favela,
        self: formData.self,
        documento: formData.documento,
      });

      alert('Perfil atualizado com sucesso!');
      navigate('/');
    } catch (error) {
      alert('Erro ao atualizar perfil');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-purple-600">Editar Perfil</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-500">(não pode ser alterado)</span>
              </label>
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CPF/CNPJ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DDD <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ddd}
                  onChange={(e) => setFormData({ ...formData, ddd: e.target.value })}
                  required
                  maxLength={2}
                  placeholder="21"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  required
                  placeholder="999999999"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro / Favela
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <ImageUpload
              label="Foto de Perfil"
              bucket="self"
              onUpload={(url) => setFormData({ ...formData, self: url })}
              currentImage={formData.self}
            />

            <ImageUpload
              label="Documento (Identidade frente e verso)"
              bucket="documento"
              onUpload={(url) => setFormData({ ...formData, documento: url })}
              currentImage={formData.documento}
            />

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}