import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
  onUpload: (path: string) => void;

  /*
   * Apesar do nome "bucket", neste projeto
   * este parâmetro representa a pasta:
   *
   * produto
   * food
   * servico
   * self
   * documento
   */
  bucket: string;

  currentImage?: string | null;
  label?: string;
}

const PRIVATE_BUCKET = 'dados-privados';

export default function ImageUpload({
  onUpload,
  bucket,
  currentImage,
  label,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);

  /*
   * Quando recebemos um caminho já salvo no banco,
   * geramos uma signed URL somente para exibição.
   */
  useEffect(() => {
    async function carregarPreview() {
      if (!currentImage) {
        setPreview(null);
        return;
      }

      /*
       * Compatibilidade temporária caso ainda
       * exista alguma URL antiga no banco.
       */
      if (
        currentImage.startsWith('http://') ||
        currentImage.startsWith('https://')
      ) {
        setPreview(currentImage);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from(PRIVATE_BUCKET)
          .createSignedUrl(
            currentImage,
            60 * 60
          );

        if (error) {
          throw error;
        }

        setPreview(data.signedUrl);
      } catch (error) {
        console.error(
          'Erro ao carregar preview da imagem:',
          error
        );

        setPreview(null);
      }
    }

    carregarPreview();
  }, [currentImage]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      if (
        !e.target.files ||
        e.target.files.length === 0
      ) {
        return;
      }

      setUploading(true);

      const file = e.target.files[0];

      /*
       * Confirma que existe um usuário autenticado.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          'Usuário não autenticado.'
        );
      }

      const fileExt =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase() || 'jpg';

      /*
       * Gera um nome único.
       */
      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

      /*
       * Exemplos:
       *
       * produto/arquivo.jpg
       * food/arquivo.jpg
       * self/arquivo.jpg
       * documento/arquivo.jpg
       */
      const filePath =
        `${bucket}/${fileName}`;

      console.log(
        'Enviando para:',
        `${PRIVATE_BUCKET}/${filePath}`
      );

      /*
       * NOVO BUCKET PRIVADO
       */
      const { error: uploadError } =
        await supabase.storage
          .from(PRIVATE_BUCKET)
          .upload(
            filePath,
            file,
            {
              cacheControl: '3600',
              upsert: false,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      /*
       * IMPORTANTE:
       *
       * O banco recebe somente:
       *
       * produto/arquivo.jpg
       *
       * e NÃO recebe uma URL.
       */
      onUpload(filePath);

      /*
       * Signed URL somente para mostrar
       * a imagem na tela imediatamente.
       */
      const {
        data: signedData,
        error: signedError,
      } = await supabase.storage
        .from(PRIVATE_BUCKET)
        .createSignedUrl(
          filePath,
          60 * 60
        );

      if (signedError) {
        throw signedError;
      }

      setPreview(
        signedData.signedUrl
      );

    } catch (error) {
      console.error(
        'Erro ao fazer upload da imagem:',
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido';

      alert(
        `Erro ao fazer upload da imagem!\n\n${message}`
      );

    } finally {
      setUploading(false);

      /*
       * Permite selecionar novamente
       * o mesmo arquivo.
       */
      e.target.value = '';
    }
  };

  const clearImage = () => {
    setPreview(null);

    /*
     * Limpa somente o valor do formulário.
     * Por enquanto não exclui fisicamente
     * o arquivo do Storage.
     */
    onUpload('');
  };

  return (
    <div className="space-y-2">

      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative inline-block">

          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg"
          />

          <button
            type="button"
            onClick={clearImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            aria-label="Remover imagem"
          >
            <X size={16} />
          </button>

        </div>
      ) : (

        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition">

          <div className="flex flex-col items-center justify-center pt-5 pb-6">

            <Upload className="w-8 h-8 mb-2 text-gray-400" />

            <p className="text-sm text-gray-500">
              {uploading
                ? 'Enviando...'
                : 'Clique para fazer upload'}
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