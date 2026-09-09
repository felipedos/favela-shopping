import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface PrivateImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  path?: string | null;
}

const PRIVATE_BUCKET = 'dados-privados';

// signed URL válida por 1 hora
const SIGNED_URL_EXPIRATION = 60 * 60;

// cache local em memória
type CacheItem = {
  url: string;
  expiresAt: number;
};

const imageCache = new Map<string, CacheItem>();

export default function PrivateImage({
  path,
  alt = '',
  ...props
}: PrivateImageProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarImagem() {
      if (!path) {
        setUrl(null);
        return;
      }

      // Compatibilidade com alguma URL completa antiga
      if (
        path.startsWith('http://') ||
        path.startsWith('https://')
      ) {
        setUrl(path);
        return;
      }

      const agora = Date.now();

      /*
       * Primeiro verifica se já existe
       * uma URL válida no cache.
       */
      const cached = imageCache.get(path);

      if (
        cached &&
        cached.expiresAt > agora
      ) {
        setUrl(cached.url);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from(PRIVATE_BUCKET)
          .createSignedUrl(
            path,
            SIGNED_URL_EXPIRATION
          );

        if (error) {
          throw error;
        }

        /*
         * Guardamos por 55 minutos,
         * um pouco menos que a validade real
         * de 60 minutos.
         */
        imageCache.set(path, {
          url: data.signedUrl,
          expiresAt:
            Date.now() +
            55 * 60 * 1000,
        });

        if (ativo) {
          setUrl(data.signedUrl);
        }

      } catch (error) {
        console.error(
          `Erro ao carregar imagem ${path}:`,
          error
        );

        if (ativo) {
          setUrl(null);
        }
      }
    }

    carregarImagem();

    return () => {
      ativo = false;
    };
  }, [path]);

  if (!url) {
    return null;
  }

  return (
    <img
      src={url}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}