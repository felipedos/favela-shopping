import { supabase } from '../lib/supabase';

const PRIVATE_BUCKET =
  'dados-privados';

export async function getPrivateImageUrl(
  path: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  if (!path) {
    return null;
  }

  // Compatibilidade durante a migração
  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path;
  }

  const { data, error } =
    await supabase.storage
      .from(PRIVATE_BUCKET)
      .createSignedUrl(
        path,
        expiresIn
      );

  if (error) {
    console.error(
      `Erro ao carregar imagem privada ${path}:`,
      error
    );

    return null;
  }

  return data.signedUrl;
}