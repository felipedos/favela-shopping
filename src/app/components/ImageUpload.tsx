import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  bucket: string; // Na verdade é a "pasta" dentro do bucket
  currentImage?: string | null;
  label?: string;
}

export default function ImageUpload({ onUpload, bucket, currentImage, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      setUploading(true);
      const file = e.target.files[0];

      console.log('🔍 DEBUG - Iniciando upload:');
      console.log('- Arquivo:', file.name, file.size, 'bytes');
      console.log('- Pasta (bucket):', bucket);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Incluir a pasta no caminho: self/arquivo.png, documento/arquivo.png, etc
      const filePath = `${bucket}/${fileName}`;

      console.log('- Caminho completo:', filePath);

      // Verificar se usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('- Usuário autenticado:', user?.email || 'NÃO AUTENTICADO');

      // Usar o bucket "bucket" (que é o único bucket que existe)
      const { error: uploadError, data } = await supabase.storage
        .from('bucket')  // ← MUDANÇA AQUI: sempre usar "bucket"
        .upload(filePath, file);

      if (uploadError) {
        console.error('❌ Erro do Supabase:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload bem-sucedido:', data);

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('bucket')  // ← MUDANÇA AQUI: sempre usar "bucket"
        .getPublicUrl(filePath);

      console.log('✅ URL pública:', publicUrl);

      setPreview(publicUrl);
      onUpload(publicUrl);
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      alert(`Erro ao fazer upload da imagem!\n\nDetalhes: ${error.message || error}`);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUpload('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
            <p className="text-sm text-gray-500">
              {uploading ? 'Enviando...' : 'Clique para fazer upload'}
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}