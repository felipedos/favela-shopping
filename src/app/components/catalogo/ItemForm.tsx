import { FormEvent, useEffect, useState } from 'react';
import { Plus, Save } from 'lucide-react';

import ImageUpload from '../ImageUpload';

interface ItemFormProps {
  categoriaNome: string;

  itemInicial?: {
    nome: string;
    descricao: string | null;
    preco: number;
    foto: string | null;
  } | null;

  onSalvar: (dados: {
    nome: string;
    descricao: string | null;
    preco: number;
    foto: string | null;
  }) => Promise<void>;

  onCancelar: () => void;
}

export default function ItemForm({
  categoriaNome,
  itemInicial = null,
  onSalvar,
  onCancelar,
}: ItemFormProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [foto, setFoto] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const editando = itemInicial !== null;

  useEffect(() => {
    if (itemInicial) {
      setNome(itemInicial.nome);
      setDescricao(itemInicial.descricao || '');
      setPreco(
        Number(itemInicial.preco)
          .toFixed(2)
          .replace('.', ',')
      );
      setFoto(itemInicial.foto || null);
    } else {
      setNome('');
      setDescricao('');
      setPreco('');
      setFoto(null);
    }

    setErro(null);
  }, [itemInicial]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const nomeLimpo = nome.trim();
    const descricaoLimpa = descricao.trim();

    const precoNumerico = Number(
      preco.replace(',', '.')
    );

    if (!nomeLimpo) {
      setErro('Informe o nome do item.');
      return;
    }

    if (
      !Number.isFinite(precoNumerico) ||
      precoNumerico < 0
    ) {
      setErro('Informe um preço válido.');
      return;
    }

    try {
      setSalvando(true);
      setErro(null);

      await onSalvar({
        nome: nomeLimpo,
        descricao: descricaoLimpa || null,
        preco: precoNumerico,
        foto: foto || null,
      });

      if (!editando) {
        setNome('');
        setDescricao('');
        setPreco('');
        setFoto(null);
      }
    } catch (error) {
      console.error('Erro ao salvar item:', error);

      setErro(
        editando
          ? 'Não foi possível atualizar o item.'
          : 'Não foi possível cadastrar o item.'
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 border-t border-gray-200 pt-4"
    >
      <h4 className="font-semibold text-gray-800 mb-1">
        {editando ? 'Editar item' : 'Novo item'}
      </h4>

      <p className="text-sm text-gray-500 mb-4">
        Categoria: {categoriaNome}
      </p>

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>

          <input
            type="text"
            value={nome}
            onChange={(event) =>
              setNome(event.target.value)
            }
            placeholder="Ex.: Suco de laranja"
            maxLength={150}
            disabled={salvando}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>

          <textarea
            value={descricao}
            onChange={(event) =>
              setDescricao(event.target.value)
            }
            placeholder="Ex.: Suco natural preparado na hora"
            rows={3}
            disabled={salvando}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preço
          </label>

          <div className="flex items-center">
            <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-4 py-3 text-gray-600">
              R$
            </span>

            <input
              type="text"
              inputMode="decimal"
              value={preco}
              onChange={(event) =>
                setPreco(event.target.value)
              }
              placeholder="0,00"
              disabled={salvando}
              className="w-full border border-gray-300 rounded-r-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <ImageUpload
          bucket="catalogo"
          currentImage={foto}
          onUpload={(path) =>
            setFoto(path || null)
          }
          label="Foto do item"
        />

        <p className="text-xs text-gray-500">
          A foto é opcional. Você pode manter a atual ou selecionar outra.
        </p>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={salvando}
            className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              salvando ||
              !nome.trim() ||
              !preco.trim()
            }
            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editando ? (
              <Save size={18} />
            ) : (
              <Plus size={18} />
            )}

            {salvando
              ? 'Salvando...'
              : editando
                ? 'Salvar alterações'
                : 'Adicionar item'}
          </button>
        </div>
      </div>
    </form>
  );
}