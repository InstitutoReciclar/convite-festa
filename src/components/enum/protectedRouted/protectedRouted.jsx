
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

import { auth, dbRealtime } from "../../../../firebase"; // ajuste o caminho
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";

export function ProtectedRoute({ children, allowedTypes }) {
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = ref( dbRealtime, `usuarios/${user.uid}`);
        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const dados = snapshot.val();
              const tipo = dados?.funcao || dados?.tipo || "desconhecido";
              setUserType(tipo);
            } else {
              console.warn("Usuário não encontrado no banco de dados.");
              setUserType("desconhecido");
            }
          })
          .catch((error) => {
            console.error("Erro ao buscar dados do usuário:", error);
            setUserType("desconhecido");
          })
          .finally(() => setIsLoading(false));
      } else {
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!isLoading && userType && !allowedTypes.includes(userType)) {
      console.warn(`Acesso negado. Tipo de usuário "${userType}" não está autorizado.`);
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
    }
  }, [isLoading, userType, allowedTypes, navigate, location.pathname]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Carregando...</div>;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { getDatabase, ref, get } from "firebase/database";
// import PropTypes from "prop-types";

// export function ProtectedRoute({ children, allowedTypes }) {
//   const [userType, setUserType] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const auth = getAuth();
//     const db = getDatabase();

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         const userRef = ref(db, `usuarios/${user.uid}`);
//         get(userRef)
//           .then((snapshot) => {
//             if (snapshot.exists()) {
//               const dados = snapshot.val();
//               const tipo = dados?.funcao || dados?.tipo || "desconhecido";
//               setUserType(tipo);
//             } else {
//               console.warn("Usuário não encontrado no banco de dados.");
//               setUserType("desconhecido");
//             }
//           })
//           .catch((error) => {
//             console.error("Erro ao buscar dados do usuário:", error);
//             setUserType("desconhecido");
//           })
//           .finally(() => setIsLoading(false));
//       } else {
//         navigate("/");
//         setIsLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [navigate]);

//   useEffect(() => {
//     if (!isLoading && userType && !allowedTypes.includes(userType)) {
//       console.warn(`Acesso negado. Tipo de usuário "${userType}" não está autorizado.`);
//       navigate("/");
//     }
//   }, [isLoading, userType, allowedTypes, navigate]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">Carregando...</div>
//     );
//   }

//   return children;
// }

// ProtectedRoute.propTypes = {
//   children: PropTypes.node.isRequired,
//   allowedTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
// };
