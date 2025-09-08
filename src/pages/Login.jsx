// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
// import {
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";
// import { ref, get, update } from "firebase/database";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@radix-ui/react-label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { auth, dbRealtime } from "../../firebase";

// const UserType = { ADMIN: "Admin", COZINHA: "Cozinha", TI: "T.I" };

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [resetEmail, setResetEmail] = useState("");
//   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showResetModal, setShowResetModal] = useState(false);
//   const navigate = useNavigate();

//   const validateEmail = (email) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const trimmedEmail = email.trim();
//     const trimmedPassword = password.trim();

//     if (!validateEmail(trimmedEmail)) {
//       toast.error("E-mail inválido.");
//       return;
//     }

//     if (!trimmedPassword) {
//       toast.error("Digite a senha.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const userCredential = await signInWithEmailAndPassword(
//         auth,
//         trimmedEmail,
//         trimmedPassword
//       );
//       const user = userCredential.user;
//       const userRef = ref(dbRealtime, "usuarios/" + user.uid);
//       const snapshot = await get(userRef);

//       if (!snapshot.exists()) {
//         toast.error("Usuário não encontrado no sistema.");
//         return;
//       }

//       const userData = snapshot.val();
//       const funcao = userData.funcao;

//       if (!funcao || !Object.values(UserType).includes(funcao)) {
//         toast.error("Função de usuário inválida.");
//         return;
//       }

//       await update(userRef, {
//         ultimoAcesso: new Date().toISOString(),
//       });

//       toast.success("Login bem-sucedido, bem-vindo!");
//       navigate("/CriarEvento");
//     } catch (error) {
//       console.error("Erro ao logar:", error.code, error.message);

//       switch (error.code) {
//         case "auth/user-not-found":
//           toast.error("Usuário não encontrado.");
//           break;
//         case "auth/wrong-password":
//           toast.error("Senha incorreta.");
//           break;
//         case "auth/invalid-credential":
//           toast.error("Credenciais inválidas.");
//           break;
//         default:
//           toast.error("Erro ao fazer login.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     const provider = new GoogleAuthProvider();

//     try {
//       const result = await signInWithPopup(auth, provider);
//       const user = result.user;

//       if (!user.email.endsWith("@reciclar.org.br")) {
//         toast.error("Apenas contas @reciclar.org.br são permitidas.");
//         return;
//       }

//       const userRef = ref(dbRealtime, "usuarios/" + user.uid);
//       const snapshot = await get(userRef);

//       if (!snapshot.exists()) {
//         toast.error("Usuário não encontrado no sistema.");
//         return;
//       }

//       const userData = snapshot.val();
//       const funcao = userData.funcao;

//       if (!funcao || !Object.values(UserType).includes(funcao)) {
//         toast.error("Função de usuário inválida.");
//         return;
//       }

//       await update(userRef, {
//         ultimoAcesso: new Date().toISOString(),
//       });

//       toast.success("Login com Google bem-sucedido!");
//       navigate("/CriarEvento");
//     } catch (error) {
//       console.error("Erro ao entrar com Google:", error);
//       toast.error("Erro ao entrar com Google.");
//     }
//   };

//   const handlePasswordReset = async () => {
//     if (!validateEmail(resetEmail)) {
//       toast.error("Digite um e-mail válido!");
//       return;
//     }

//     try {
//       await sendPasswordResetEmail(auth, resetEmail.trim());
//       toast.success("Instruções enviadas para seu e-mail.");
//       setShowResetModal(false);
//     } catch (error) {
//       toast.error("Erro ao enviar e-mail de redefinição.");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
//       <ToastContainer position="top-right" autoClose={4000} />
//       {/* plano de fundo animado omitido para foco no login */}

//       <Card className="w-full max-w-md relative z-10 bg-white/95 shadow-2xl border-0">
//         <CardHeader className="text-center pb-8">
//           <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
//             <img
//               src="/Reciclar_30anos_Blocado_Positivo.png"
//               alt="Logo"
//               className="w-12 h-12 object-contain filter brightness-0 invert"
//             />
//           </div>
//           <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//             Instituto Reciclar
//           </CardTitle>
//           <CardDescription className="text-gray-600 mt-2">
//             Acesse sua conta para continuar
//           </CardDescription>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">E-mail</Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="seu@email.com"
//                   className="pl-10 h-12"
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Senha</Label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//                 <Input
//                   id="password"
//                   type={isPasswordVisible ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Digite sua senha"
//                   className="pl-10 pr-10 h-12"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setIsPasswordVisible(!isPasswordVisible)}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                 >
//                   {isPasswordVisible ? (
//                     <EyeOff className="h-4 w-4 text-gray-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-gray-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white"
//             >
//               {isLoading ? "Entrando..." : "Acessar Plataforma"}
//               {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
//             </Button>
//           </form>

//           <div className="text-center">
//             <button
//               onClick={() => setShowResetModal(true)}
//               className="text-sm text-purple-600 hover:text-purple-700 underline"
//             >
//               Esqueceu a senha?
//             </button>
//           </div>

//           <div className="relative mt-4">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t border-gray-200" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-white px-2 text-gray-500">
//                 ou continue com
//               </span>
//             </div>
//           </div>

//           <Button
//             onClick={handleGoogleLogin}
//             variant="outline"
//             className="w-full h-12"
//           >
//             <img
//               src="../iconGoogle.png"
//               alt="Google"
//               className="w-5 h-5 mr-3"
//             />
//             Entrar com Google
//           </Button>
//         </CardContent>
//       </Card>

//       <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Recuperação de Senha</DialogTitle>
//             <DialogDescription>
//               Digite seu e-mail para receber instruções.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             <Label htmlFor="reset-email">E-mail</Label>
//             <Input
//               id="reset-email"
//               type="email"
//               value={resetEmail}
//               onChange={(e) => setResetEmail(e.target.value)}
//             />
//           </div>
//           <div className="flex justify-end gap-2">
//             <Button variant="outline" onClick={() => setShowResetModal(false)}>
//               Cancelar
//             </Button>
//             <Button onClick={handlePasswordReset}>Enviar Instruções</Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
