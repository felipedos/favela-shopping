import { X } from 'lucide-react';

interface SobreModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SobreModal({ open, onClose }: SobreModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-4 text-purple-600">Sobre o Favela Shopping</h2>

        <div className="space-y-4 text-gray-700">
          <p>
            O <strong>Favela Shopping</strong> é uma plataforma de divulgação que conecta
            moradores de comunidades do Rio de Janeiro, promovendo a economia local e
            facilitando o acesso a serviços, produtos e comidas.
          </p>

          <p>
            Nossa missão é fortalecer o comércio local, valorizando empreendedores e
            prestadores de serviço das favelas cariocas, criando oportunidades e
            aproximando clientes de quem está perto.
          </p>

          <div className="bg-purple-50 p-4 rounded-lg mt-4">
            <h3 className="font-bold text-purple-700 mb-2">O que você encontra aqui:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Serviços profissionais da sua comunidade</li>
              <li>Produtos artesanais e variados</li>
              <li>Comidas caseiras e deliciosas</li>
              <li>Sistema de avaliação para garantir qualidade</li>
              <li>Contato direto via WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}