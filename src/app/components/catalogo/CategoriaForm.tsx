import { FormEvent, useState } from 'react';
import { Plus } from 'lucide-react';

interface CategoriaFormProps {
  onSalvar: (nome: string) => Promise<void>;
}

export default function CategoriaForm({
  onSalvar,
}: CategoriaFormProps) {
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const nomeLimpo = nome.trim();

    if (!nomeLimpo) {
      return;
    }

    try {
      setSalvando(true);

      await onSalvar(nomeLimpo);

      setNome('');
    } catch (error) {
      console.error(
        'Erro ao cadastrar categoria:',
        error
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-5"
    >
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Nova categoria
      </h2>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={nome}
          onChange={(event) =>
            setNome(event.target.value)
          }
          placeholder="Ex.: Pizzas, Bebidas, Camisetas..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={salvando}
          maxLength={100}
        />

        <button
          type="submit"
          disabled={salvando || !nome.trim()}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />

          {salvando
            ? 'Salvando...'
            : 'Adicionar categoria'}
        </button>
      </div>
    </form>
  );
}