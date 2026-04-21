import { Link } from 'react-router';
import { Wrench, Package, UtensilsCrossed } from 'lucide-react';
import Header from '../components/Header';
import favelaLogo from '../../imports/FAVEELA.png';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header showFullMenu={true} />

      <main className="flex-1 relative bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-8 overflow-hidden">
        {/* Imagem de fundo como marca d'água */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={favelaLogo}
            alt=""
            className="max-w-4xl w-full h-auto opacity-10 select-none"
          />
        </div>

        {/* Conteúdo por cima da imagem */}
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12 pt-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Favela Shopping
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Conectando moradores das comunidades do Rio de Janeiro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/servicos"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center group hover:scale-105"
            >
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Wrench className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Serviços</h2>
              <p className="text-gray-600">
                Encontre prestadores de serviços na sua comunidade
              </p>
            </Link>

            <Link
              to="/produtos"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center group hover:scale-105"
            >
              <div className="bg-gradient-to-br from-blue-600 to-sky-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Produtos</h2>
              <p className="text-gray-600">
                Compre e venda produtos de qualidade
              </p>
            </Link>

            <Link
              to="/comidas"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 text-center group hover:scale-105"
            >
              <div className="bg-gradient-to-br from-orange-600 to-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Comidas</h2>
              <p className="text-gray-600">
                Delícias e sabores da comunidade
              </p>
            </Link>
          </div>

          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Como funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl mb-2">📱</div>
                <h4 className="font-semibold text-gray-800 mb-1">1. Cadastre-se</h4>
                <p className="text-sm text-gray-600">Crie sua conta gratuitamente</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🔍</div>
                <h4 className="font-semibold text-gray-800 mb-1">2. Explore</h4>
                <p className="text-sm text-gray-600">Encontre o que precisa</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💬</div>
                <h4 className="font-semibold text-gray-800 mb-1">3. Conecte-se</h4>
                <p className="text-sm text-gray-600">Contato direto via WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}