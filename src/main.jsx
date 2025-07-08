// import { StrictMode, Suspense } from 'react';
// import { createRoot } from 'react-dom/client';
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import React from 'react';
// import './index.css';
// import App from './App.jsx';
// import Reserva from './pages/reserva';
// import ListaConvites from './pages/listaConvites';
// import LeitorQRCode from './pages/leitorQRcode';
// import CadastroEvento from './pages/CriarEvento';
// import VisualizarEventos from './pages/ConsultaEvento';
// import Home from './pages/Home';


// const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <App />,
//     children: [
//       { path: "/", element: <Home />},
//       { path: "/ListaConvidados", element: <ListaConvites />},
//       { path: "/ConsultaConvidados", element: <LeitorQRCode />},
//       { path: "/CriarEvento", element: <CadastroEvento />},
//       { path: "/ConsultarEvento", element: <VisualizarEventos />},
//       { path: "/CriarConvites", element: <Reserva />},

      
//     ],
//   },
// ]);
// createRoot(document.getElementById('root')).render( <StrictMode> <RouterProvider router={router} /> </StrictMode>);



import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserType } from "./components/enum/usertype/usertype";
import { ProtectedRoute } from "./components/enum/protectedRouted/protectedRouted.jsx";
import App from "./App.jsx";
import './index.css';
import LoginForm from "@/pages/Login";
import Home from "./pages/Home.jsx";
import PaginaNaoEncontradaGoogleStyle from "./components/error";
import Registro from "./pages/Register_User";

// Lazy loading para páginas maiores
const ListaConvites = React.lazy(() => import("@/pages/listaConvites.jsx"));
const ReservaConvite = React.lazy(() => import("@/pages/reserva.jsx"));
const VisualizarEventos = React.lazy(() => import("@/pages/ConsultaEvento.jsx"));
const CadastroEvento = React.lazy(() => import("@/pages/CriarEvento.jsx"));

// Definição dos tipos de usuários permitidos
const ADMIN_ONLY = [UserType.ADMIN];
const ALL_TYPES = [UserType.ADMIN, UserType.USER, UserType.TI];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <PaginaNaoEncontradaGoogleStyle />,
    children: [
      { path: "/", element: <LoginForm /> },

      {
        path: "/home",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Home />
          </ProtectedRoute>
        ),
      },

      {
        path: "/ListaConvidados",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Convites...</div>}>
              <ListaConvites />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: "/CriarEvento",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Cadastro de Evento...</div>}>
              <CadastroEvento />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: "/ConsultarEvento",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Eventos...</div>}>
              <VisualizarEventos />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: "/register-user",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Eventos...</div>}>
              <Registro />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: "/CriarConvites",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Reserva...</div>}>
              <ReservaConvite />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
