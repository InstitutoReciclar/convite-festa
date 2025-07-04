import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import './index.css';
import App from './App.jsx';
import Reserva from './pages/reserva';
import ListaConvites from './pages/listaConvites';
import LeitorQRCode from './pages/leitorQRcode';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: "/", element: <Reserva />},
      { path: "/ListaConvidados", element: <ListaConvites />},
      { path: "/ConsultaConvidados", element: <LeitorQRCode />},

      
    ],
  },
]);
createRoot(document.getElementById('root')).render( <StrictMode> <RouterProvider router={router} /> </StrictMode>);
