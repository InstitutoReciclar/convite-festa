// import React, { useEffect, useState, useRef } from 'react';
// import { getDatabase, ref, onValue, update } from 'firebase/database';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';

// import { Html5Qrcode } from "html5-qrcode";
// import toast, { Toaster } from 'react-hot-toast';

// const VisualizarEventos = ({ idEvento, onVoltar }) => {
//   const [convites, setConvites] = useState([]);
//   const [conviteSelecionado, setConviteSelecionado] = useState(null);
//   const [qrModalAberto, setQrModalAberto] = useState(false);
//   const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
//   const [scannerLoading, setScannerLoading] = useState(false);
//   const [filtro, setFiltro] = useState("");

//   const qrCodeRegionId = "html5qr-code-full-region";
//   const html5QrCodeRef = useRef(null);
//   const db = getDatabase();

//   useEffect(() => {
//     if (!idEvento) {
//       console.warn("idEvento não definido");
//       return;
//     }

//     const convitesRef = ref(db, `convites/${idEvento}`);
//     console.log("Buscando convites no caminho:", `convites/${idEvento}`);

//     const unsubscribe = onValue(convitesRef, (snapshot) => {
//       const dados = snapshot.val();
//       console.log("Dados recebidos do banco:", dados);

//       if (!dados || typeof dados !== 'object') {
//         setConvites([]);
//         return;
//       }

//       const lista = Object.entries(dados)
//         .filter(([_, data]) => typeof data === 'object' && data !== null)
//         .map(([id, data]) => ({ id, ...data }));

//       setConvites(lista);
//     }, (error) => {
//       console.error("Erro ao ler convites:", error);
//       toast.error("Erro ao ler dados do evento.");
//       setConvites([]);
//     });

//     return () => unsubscribe();
//   }, [db, idEvento]);

//   const validarConvite = (conviteId) => {
//     update(ref(db, `convites/${idEvento}/${conviteId}`), {
//       status: 'convidado presente'
//     }).then(() => {
//       toast.success("Presença confirmada!");
//       setModalDetalhesAberto(false);
//     }).catch((err) => {
//       toast.error("Erro ao confirmar presença.");
//     });
//   };

//   const handleQRCodeRead = (decodedText) => {
//     const conviteEncontrado = convites.find((c) =>
//       c.id === decodedText ||
//       c.comprador?.email === decodedText ||
//       c.comprador?.cpf === decodedText ||
//       c.convidado?.email === decodedText ||
//       c.convidado?.cpf === decodedText
//     );

//     if (!conviteEncontrado) {
//       toast.error("Convite não encontrado!");
//       setQrModalAberto(false);
//       return;
//     }

//     if (conviteEncontrado.status === "convidado presente") {
//       toast.error("Já marcado como presente!");
//       setQrModalAberto(false);
//       return;
//     }

//     update(ref(db, `convites/${idEvento}/${conviteEncontrado.id}`), {
//       status: "convidado presente"
//     }).then(() => {
//       setConviteSelecionado({ ...conviteEncontrado, status: "convidado presente" });
//       setModalDetalhesAberto(true);
//       setQrModalAberto(false);
//       if (html5QrCodeRef.current) {
//         html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear());
//       }
//       toast.success("Presença confirmada!");
//     }).catch(() => toast.error("Erro ao confirmar presença."));
//   };

//   useEffect(() => {
//     if (qrModalAberto) {
//       setScannerLoading(true);
//       const iniciarScanner = () => {
//         const element = document.getElementById(qrCodeRegionId);
//         if (!element) {
//           toast.error("Erro ao preparar o scanner.");
//           setQrModalAberto(false);
//           return;
//         }
//         if (!html5QrCodeRef.current) {
//           html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
//         }
//         html5QrCodeRef.current.start(
//           { facingMode: "environment" },
//           { fps: 10, qrbox: 250 },
//           handleQRCodeRead
//         ).then(() => setScannerLoading(false)).catch(() => {
//           setScannerLoading(false);
//           toast.error("Erro ao iniciar câmera.");
//           setQrModalAberto(false);
//         });
//       };
//       const timer = setTimeout(iniciarScanner, 300);
//       return () => clearTimeout(timer);
//     } else {
//       if (html5QrCodeRef.current) {
//         html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear());
//         html5QrCodeRef.current = null;
//       }
//       setScannerLoading(false);
//     }
//   }, [qrModalAberto]);

//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="max-w-6xl mx-auto p-6 space-y-6">
//         <Button variant="ghost" onClick={onVoltar}>⬅ Voltar para Evento</Button>

//         <div className="flex justify-between items-center">
//           <h2 className="text-2xl font-bold text-purple-700">Convidados do Evento</h2>
//           <Button onClick={() => setQrModalAberto(true)}>📷 Ler QR Code</Button>
//         </div>

//         <div className="mt-4">
//           <input
//             type="text"
//             placeholder="🔍 Pesquisar por nome, email ou CPF"
//             value={filtro}
//             onChange={(e) => setFiltro(e.target.value.toLowerCase())}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
//           {convites.filter((c) => {
//             const busca = filtro.toLowerCase();
//             return (
//               c.comprador?.nome?.toLowerCase().includes(busca) ||
//               c.comprador?.sobrenome?.toLowerCase().includes(busca) ||
//               c.comprador?.email?.toLowerCase().includes(busca) ||
//               c.comprador?.cpf?.includes(busca) ||
//               c.convidado?.nome?.toLowerCase().includes(busca) ||
//               c.convidado?.sobrenome?.toLowerCase().includes(busca)
//             );
//           }).map((convite) => (
//             <Card
//               key={convite.id}
//               className="p-4 cursor-pointer border-2 hover:border-purple-500"
//               onClick={() => {
//                 setConviteSelecionado(convite);
//                 setModalDetalhesAberto(true);
//               }}
//             >
//               <h3 className="font-bold text-lg">{convite.comprador?.nome} {convite.comprador?.sobrenome}</h3>
//               <p className="text-sm text-gray-600">{convite.comprador?.email}</p>
//               <div className="mt-2">
//                 <Badge className={
//                   convite.status === 'convidado presente'
//                     ? 'bg-green-100 text-green-700'
//                     : 'bg-gray-100 text-gray-700'
//                 }>
//                   {convite.status || 'pendente'}
//                 </Badge>
//               </div>
//             </Card>
//           ))}
//         </div>

//         <Dialog open={qrModalAberto} onOpenChange={setQrModalAberto}>
//           <DialogContent className="max-w-md">
//             <DialogHeader>
//               <DialogTitle>Escanear QR Code</DialogTitle>
//             </DialogHeader>
//             {scannerLoading && <p className="text-center text-gray-500 mb-2">Carregando câmera...</p>}
//             <div id={qrCodeRegionId} style={{ width: "100%", minHeight: "300px" }} />
//           </DialogContent>
//         </Dialog>

//         <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
//           <DialogContent className="max-w-lg">
//             <DialogHeader>
//               <DialogTitle>Detalhes do Convite</DialogTitle>
//             </DialogHeader>
//             {conviteSelecionado && (
//               <div className="space-y-2">
//                 <p><strong>Nome:</strong> {conviteSelecionado.comprador?.nome} {conviteSelecionado.comprador?.sobrenome}</p>
//                 <p><strong>Email:</strong> {conviteSelecionado.comprador?.email}</p>
//                 <p><strong>CPF:</strong> {conviteSelecionado.comprador?.cpf}</p>
//                 {conviteSelecionado.convidado?.nome && (
//                   <p><strong>Convidado:</strong> {conviteSelecionado.convidado?.nome} {conviteSelecionado.convidado?.sobrenome}</p>
//                 )}
//                 <p><strong>Status:</strong> {conviteSelecionado.status || 'pendente'}</p>
//                 {conviteSelecionado.status !== 'convidado presente' && (
//                   <Button className="mt-4 w-full bg-green-600 text-white hover:bg-green-700" onClick={() => validarConvite(conviteSelecionado.id)}>
//                     ✅ Marcar como presente
//                   </Button>
//                 )}
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </>
//   );
// };

// export default VisualizarEventos;



"use client"

import { useEffect, useState, useRef } from "react"
import { getDatabase, ref, onValue, update } from "firebase/database"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Html5Qrcode } from "html5-qrcode"
import toast, { Toaster } from "react-hot-toast"
import {
  ArrowLeft,
  QrCode,
  Search,
  Users,
  UserCheck,
  Clock,
  Mail,
  CreditCard,
  CheckCircle2,
  Camera,
  Loader2,
} from "lucide-react"

const VisualizarEventos = ({ idEvento, onVoltar }) => {
  const [convites, setConvites] = useState([])
  const [conviteSelecionado, setConviteSelecionado] = useState(null)
  const [qrModalAberto, setQrModalAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)
  const qrCodeRegionId = "html5qr-code-full-region"
  const html5QrCodeRef = useRef(null)
  const db = getDatabase()

  useEffect(() => {
    if (!idEvento) {
      console.warn("idEvento não definido")
      return
    }

    const convitesRef = ref(db, `convites/${idEvento}`)
    console.log("Buscando convites no caminho:", `convites/${idEvento}`)

    const unsubscribe = onValue(
      convitesRef,
      (snapshot) => {
        const dados = snapshot.val()
        console.log("Dados recebidos do banco:", dados)

        if (!dados || typeof dados !== "object") {
          setConvites([])
          setLoading(false)
          return
        }

        const lista = Object.entries(dados)
          .filter(([_, data]) => typeof data === "object" && data !== null)
          .map(([id, data]) => ({ id, ...data }))

        setConvites(lista)
        setLoading(false)
      },
      (error) => {
        console.error("Erro ao ler convites:", error)
        toast.error("Erro ao ler dados do evento.")
        setConvites([])
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [db, idEvento])

  const validarConvite = (conviteId) => {
    update(ref(db, `convites/${idEvento}/${conviteId}`), {
      status: "convidado presente",
    })
      .then(() => {
        toast.success("Presença confirmada!")
        setModalDetalhesAberto(false)
      })
      .catch((err) => {
        toast.error("Erro ao confirmar presença.")
      })
  }

  const handleQRCodeRead = (decodedText) => {
    const conviteEncontrado = convites.find(
      (c) =>
        c.id === decodedText ||
        c.comprador?.email === decodedText ||
        c.comprador?.cpf === decodedText ||
        c.convidado?.email === decodedText ||
        c.convidado?.cpf === decodedText,
    )

    if (!conviteEncontrado) {
      toast.error("Convite não encontrado!")
      setQrModalAberto(false)
      return
    }

    if (conviteEncontrado.status === "convidado presente") {
      toast.error("Já marcado como presente!")
      setQrModalAberto(false)
      return
    }

    update(ref(db, `convites/${idEvento}/${conviteEncontrado.id}`), {
      status: "convidado presente",
    })
      .then(() => {
        setConviteSelecionado({ ...conviteEncontrado, status: "convidado presente" })
        setModalDetalhesAberto(true)
        setQrModalAberto(false)
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear())
        }
        toast.success("Presença confirmada!")
      })
      .catch(() => toast.error("Erro ao confirmar presença."))
  }

  useEffect(() => {
    if (qrModalAberto) {
      setScannerLoading(true)
      const iniciarScanner = () => {
        const element = document.getElementById(qrCodeRegionId)
        if (!element) {
          toast.error("Erro ao preparar o scanner.")
          setQrModalAberto(false)
          return
        }

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId)
        }

        html5QrCodeRef.current
          .start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, handleQRCodeRead)
          .then(() => setScannerLoading(false))
          .catch(() => {
            setScannerLoading(false)
            toast.error("Erro ao iniciar câmera.")
            setQrModalAberto(false)
          })
      }

      const timer = setTimeout(iniciarScanner, 300)
      return () => clearTimeout(timer)
    } else {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current.clear())
        html5QrCodeRef.current = null
      }
      setScannerLoading(false)
    }
  }, [qrModalAberto])

  const convitesFiltrados = convites.filter((c) => {
    const busca = filtro.toLowerCase()
    return (
      c.comprador?.nome?.toLowerCase().includes(busca) ||
      c.comprador?.sobrenome?.toLowerCase().includes(busca) ||
      c.comprador?.email?.toLowerCase().includes(busca) ||
      c.comprador?.cpf?.includes(busca) ||
      c.convidado?.nome?.toLowerCase().includes(busca) ||
      c.convidado?.sobrenome?.toLowerCase().includes(busca)
    )
  })

  const totalPresentes = convites.filter((c) => c.status === "convidado presente").length
  const totalConvites = convites.length

  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </CardContent>
    </Card>
  )

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={onVoltar}
              className="mb-6 hover:bg-purple-100 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Evento
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Convidados</h1>
                <p className="text-gray-600">Visualize e gerencie a presença dos convidados do evento</p>
              </div>

              <Button
                onClick={() => setQrModalAberto(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                <QrCode className="w-5 h-5 mr-2" />
                Escanear QR Code
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total de Convites</p>
                    <p className="text-3xl font-bold">{totalConvites}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Presentes</p>
                    <p className="text-3xl font-bold">{totalPresentes}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Pendentes</p>
                    <p className="text-3xl font-bold">{totalConvites - totalPresentes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Bar */}
          <Card className="mb-6 shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Pesquisar por nome, email ou CPF..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10 h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Guests Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : convitesFiltrados.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {filtro ? "Nenhum convite encontrado" : "Nenhum convite cadastrado"}
                </h3>
                <p className="text-gray-500">
                  {filtro ? "Tente ajustar os termos de busca" : "Os convites aparecerão aqui quando forem cadastrados"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {convitesFiltrados.map((convite) => (
                <Card
                  key={convite.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300 group"
                  onClick={() => {
                    setConviteSelecionado(convite)
                    setModalDetalhesAberto(true)
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                          {convite.comprador?.nome} {convite.comprador?.sobrenome}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4 mr-1" />
                          {convite.comprador?.email}
                        </div>
                        {convite.comprador?.cpf && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {convite.comprador?.cpf}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          convite.status === "convidado presente"
                            ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                            : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
                        }
                      >
                        {convite.status === "convidado presente" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Presente
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </div>

                    {convite.convidado?.nome && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-600">
                          <strong>Acompanhante:</strong> {convite.convidado?.nome} {convite.convidado?.sobrenome}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* QR Code Modal */}
          <Dialog open={qrModalAberto} onOpenChange={setQrModalAberto}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center text-xl">
                  <Camera className="w-6 h-6 mr-2 text-purple-600" />
                  Escanear QR Code
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {scannerLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600 mr-3" />
                    <span className="text-gray-600">Iniciando câmera...</span>
                  </div>
                )}

                <div
                  id={qrCodeRegionId}
                  className="rounded-lg overflow-hidden border-2 border-gray-200"
                  style={{ width: "100%", minHeight: "300px" }}
                />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Dica:</strong> Posicione o QR code dentro da área de escaneamento para validar a presença
                    automaticamente.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Details Modal */}
          <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Detalhes do Convite</DialogTitle>
              </DialogHeader>

              {conviteSelecionado && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-gray-500 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {conviteSelecionado.comprador?.nome} {conviteSelecionado.comprador?.sobrenome}
                        </p>
                        <p className="text-sm text-gray-600">Comprador principal</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">{conviteSelecionado.comprador?.email}</span>
                    </div>

                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700">{conviteSelecionado.comprador?.cpf}</span>
                    </div>

                    {conviteSelecionado.convidado?.nome && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center">
                          <Users className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {conviteSelecionado.convidado?.nome} {conviteSelecionado.convidado?.sobrenome}
                            </p>
                            <p className="text-sm text-gray-600">Acompanhante</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Status atual:</span>
                    <Badge
                      className={
                        conviteSelecionado.status === "convidado presente"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-orange-100 text-orange-800 border-orange-200"
                      }
                    >
                      {conviteSelecionado.status === "convidado presente" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Presente
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4 mr-1" />
                          Pendente
                        </>
                      )}
                    </Badge>
                  </div>

                  {conviteSelecionado.status !== "convidado presente" && (
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      onClick={() => validarConvite(conviteSelecionado.id)}
                      size="lg"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Confirmar Presença
                    </Button>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  )
}

export default VisualizarEventos
