import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import LoginCadastro from './pages/LoginCadastro';
import FinalizarCadastro from './pages/FinalizarCadastro';
import Servicos from './pages/Servicos';
import DetalhesServico from './pages/DetalhesServico';
import ServicosContratados from './pages/ServicosContratados';
import CadastrarServico from './pages/CadastrarServico';
import AvaliarServico from './pages/AvaliarServico';
import Produtos from './pages/Produtos';
import DetalhesProduto from './pages/DetalhesProduto';
import ProdutosContratados from './pages/ProdutosContratados';
import CadastrarProduto from './pages/CadastrarProduto';
import AvaliarProduto from './pages/AvaliarProduto';
import Comidas from './pages/Comidas';
import DetalhesComida from './pages/DetalhesComida';
import ComidasContratadas from './pages/ComidasContratadas';
import CadastrarComida from './pages/CadastrarComida';
import AvaliarComida from './pages/AvaliarComida';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: 'login', Component: LoginCadastro },
      { path: 'finalizar-cadastro', Component: FinalizarCadastro },
      { path: 'servicos', Component: Servicos },
      { path: 'servicos/:id', Component: DetalhesServico },
      { path: 'servicos-contratados', Component: ServicosContratados },
      { path: 'cadastrar-servico', Component: CadastrarServico },
      { path: 'avaliar-servico/:id', Component: AvaliarServico },
      { path: 'produtos', Component: Produtos },
      { path: 'produtos/:id', Component: DetalhesProduto },
      { path: 'produtos-contratados', Component: ProdutosContratados },
      { path: 'cadastrar-produto', Component: CadastrarProduto },
      { path: 'avaliar-produto/:id', Component: AvaliarProduto },
      { path: 'comidas', Component: Comidas },
      { path: 'comidas/:id', Component: DetalhesComida },
      { path: 'comidas-contratadas', Component: ComidasContratadas },
      { path: 'cadastrar-comida', Component: CadastrarComida },
      { path: 'avaliar-comida/:id', Component: AvaliarComida },
    ],
  },
]);