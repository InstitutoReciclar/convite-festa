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
  const ultimaLeituraRef = useRef(0)
  const TEMPO_ENTRE_LEITURAS = 2000
  const db = getDatabase()

  const handleQRCodeRead = (decodedText) => {
    const agora = Date.now()
    if (agora - ultimaLeituraRef.current < TEMPO_ENTRE_LEITURAS) return
    ultimaLeituraRef.current = agora

    const conviteEncontrado = convites.find(
      (c) =>
        c.id === decodedText ||
        c.comprador?.email === decodedText ||
        c.comprador?.cpf === decodedText ||
        c.convidado?.email === decodedText ||
        c.convidado?.cpf === decodedText ||
        c.convidado?.id === decodedText
    )

    if (!conviteEncontrado) {
      toast.error("Convite não encontrado!")
      return
    }

    if (conviteEncontrado.status === "convidado presente") {
      toast.error("Já marcado como presente!")
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

  const validarConvite = (idConvite) => {
    const conviteEncontrado = convites.find((c) => c.id === idConvite)
    if (!conviteEncontrado) {
      toast.error("Convite não encontrado!")
      return
    }

    if (conviteEncontrado.status === "convidado presente") {
      toast.error("Já marcado como presente!")
      return
    }

    update(ref(db, `convites/${idEvento}/${idConvite}`), {
      status: "convidado presente",
    })
      .then(() => {
        setConviteSelecionado({ ...conviteEncontrado, status: "convidado presente" })
        toast.success("Presença confirmada!")
      })
      .catch(() => toast.error("Erro ao confirmar presença."))
  }

  useEffect(() => {
    if (!idEvento) return

    const convitesRef = ref(db, `convites/${idEvento}`)
    const unsubscribe = onValue(
      convitesRef,
      (snapshot) => {
        const dados = snapshot.val()
        if (!dados || typeof dados !== "object") {
          setConvites([])
          setLoading(false)
          return
        }

        const lista = Object.entries(dados).map(([id, data]) => ({ id, ...data }))
        setConvites(lista)
        setLoading(false)
      },
      (error) => {
        toast.error("Erro ao ler dados do evento.")
        setConvites([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [db, idEvento])

  useEffect(() => {
    if (qrModalAberto) {
      setScannerLoading(true)

      const iniciarScanner = async () => {
        const element = document.getElementById(qrCodeRegionId)
        if (!element) {
          toast.error("Erro ao preparar o scanner.")
          setQrModalAberto(false)
          return
        }

        if (!html5QrCodeRef.current) {
          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId)
        }

        try {
          await html5QrCodeRef.current.start(
            { facingMode: { exact: "environment" } },
            { fps: 10, qrbox: 250 },
            handleQRCodeRead
          )
          setScannerLoading(false)
        } catch (errEnv) {
          try {
            await html5QrCodeRef.current.start(
              { facingMode: "user" },
              { fps: 10, qrbox: 250 },
              handleQRCodeRead
            )
            setScannerLoading(false)
          } catch (errUser) {
            console.error("Erro ao iniciar scanner:", errUser)
            setScannerLoading(false)
            toast.error("Erro ao iniciar câmera.")
            setQrModalAberto(false)
          }
        }
      }

      const timer = setTimeout(iniciarScanner, 300)
      return () => clearTimeout(timer)
    } else {
      if (html5QrCodeRef.current) {
        const estado = html5QrCodeRef.current.getState?.() ?? 0
        if (estado === 2) {
          html5QrCodeRef.current
            .stop()
            .then(() => html5QrCodeRef.current.clear())
            .catch((err) => console.error("Erro ao parar scanner:", err))
        }
        html5QrCodeRef.current = null
      }
      setScannerLoading(false)
    }
  }, [qrModalAberto])

  // Dados para estatísticas
  const totalConvites = convites.length
  const totalPresentes = convites.filter((c) => c.status === "convidado presente").length

  // Filtro simples de pesquisa
  const convitesFiltrados = convites.filter((convite) => {
    const termo = filtro.toLowerCase()
    return (
      convite.comprador?.nome?.toLowerCase().includes(termo) ||
      convite.comprador?.sobrenome?.toLowerCase().includes(termo) ||
      convite.comprador?.email?.toLowerCase().includes(termo) ||
      convite.comprador?.cpf?.toLowerCase().includes(termo) ||
      convite.convidado?.nome?.toLowerCase().includes(termo) ||
      convite.convidado?.sobrenome?.toLowerCase().includes(termo) ||
      convite.convidado?.email?.toLowerCase().includes(termo) ||
      convite.convidado?.cpf?.toLowerCase().includes(termo)
    )
  })

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

                    {conviteSelecionado.comprador?.cpf && (
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700">{conviteSelecionado.comprador.cpf}</span>
                      </div>
                    )}
                  </div>

                  {conviteSelecionado.convidado?.nome && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {conviteSelecionado.convidado?.nome} {conviteSelecionado.convidado?.sobrenome}
                          </p>
                          <p className="text-sm text-gray-600">Acompanhante</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700">{conviteSelecionado.convidado?.email}</span>
                      </div>

                      {conviteSelecionado.convidado?.cpf && (
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-gray-500 mr-3" />
                          <span className="text-gray-700">{conviteSelecionado.convidado.cpf}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    {conviteSelecionado.status !== "convidado presente" && (
                      <Button
                        onClick={() => validarConvite(conviteSelecionado.id)}
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Confirmar Presença
                      </Button>
                    )}

                    <Button onClick={() => setModalDetalhesAberto(false)} variant="ghost">
                      Fechar
                    </Button>
                  </div>
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
