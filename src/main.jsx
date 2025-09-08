import React, { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserType } from "./components/enum/usertype/usertype";
import { ProtectedRoute } from "./components/enum/protectedRouted/protectedRouted.jsx";
import App from "./App.jsx";
import './index.css';
import LoginForm from "@/pages/Login";
import PaginaNaoEncontradaGoogleStyle from "./components/error";
import Registro from "./pages/Register_User";

// Lazy loading para páginas maiores
const ListaConvites = React.lazy(() => import("@/pages/listaConvites.jsx"));
// const ReservaConvite = React.lazy(() => import("@/pages/reserva.jsx"));
const VisualizarEventos = React.lazy(() => import("@/pages/ConsultaEvento.jsx"));
// const CadastroEvento = React.lazy(() => import("@/pages/CriarEvento.jsx"));

// Definição dos tipos de usuários permitidos
const ALL_TYPES = [UserType.ADMIN, UserType.USER, UserType.TI];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <PaginaNaoEncontradaGoogleStyle />,
    children: [
      { path: "/", element: <LoginForm /> },

      {
        path: "/CriarEvento",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Cadastro de Evento...</div>}>
              <VisualizarEventos />
            </Suspense>
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
        path: "/CriarConvites",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Reserva...</div>}>
              <VisualizarEventos />
            </Suspense>
          </ProtectedRoute>
        ),
      },
       {
        path: "/registro",
        element: (
          <ProtectedRoute allowedTypes={ALL_TYPES}>
            <Suspense fallback={<div>Carregando Reserva...</div>}>
              <Registro />
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
