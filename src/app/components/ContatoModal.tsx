import { X, Mail, Phone } from 'lucide-react';

interface ContatoModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContatoModal({ open, onClose }: ContatoModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-purple-600">Fale Conosco</h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Mail className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">E-mail</p>
              <a href="mailto:contato@favelashopping.com.br" className="text-purple-600 font-medium">
                contato@favelashopping.com.br
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
            <Phone className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Telefone / WhatsApp</p>
              <a href="tel:+5521999999999" className="text-purple-600 font-medium">
                (21) 99999-9999
              </a>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Estamos disponíveis de segunda a sexta, das 9h às 18h
        </p>
      </div>
    </div>
  );
}