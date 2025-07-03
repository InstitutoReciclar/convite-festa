import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import './index.css';
import App from './App.jsx';
import GerarConvite from './pages/gerarConvite';
import Validador from './pages/validador';
import ConviteConfirmado from './components/ui/convite';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <GerarConvite /> },
      { path: "/validador", element: <Validador />},
      { path: "/convite/:codigo", element: <ConviteConfirmado />}
    ],
  },
]);
createRoot(document.getElementById('root')).render( <StrictMode> <RouterProvider router={router} /> </StrictMode>);
