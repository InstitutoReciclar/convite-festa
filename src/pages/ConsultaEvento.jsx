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
  Camera,
  Loader2,
} from "lucide-react"

const VisualizarEventos = ({ idEvento, onVoltar }) => {
  const [convites, setConvites] = useState([])
  const [conviteSelecionado, setConviteSelecionado] = useState(null)
  const [qrModalAberto, setQrModalAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [modalTipo, setModalTipo] = useState(null)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)

  const qrCodeRegionId = "html5qr-code-full-region"
  const html5QrCodeRef = useRef(null)
  const ultimaLeituraRef = useRef(0)
  const TEMPO_ENTRE_LEITURAS = 2000
  const db = getDatabase()

  useEffect(() => {
    const convitesRef = ref(db, `convites/${idEvento}`)
    setLoading(true)
    const unsubscribe = onValue(convitesRef, (snapshot) => {
      const data = snapshot.val() || {}
      const convitesArray = Object.entries(data).map(([id, convite]) => ({
        id,
        ...convite,
      }))
      setConvites(convitesArray)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [db, idEvento])

  // Busca convite pelo nome completo (comprador ou convidado)
  const encontrarConvitePorNomeCompleto = (nomeCompleto) => {
    return convites.find((c) => {
      const nomeCompComprador = `${c.comprador?.nome ?? ""} ${c.comprador?.sobrenome ?? ""}`.toLowerCase().trim()
      const nomeCompConvidado = `${c.convidado?.nome ?? ""} ${c.convidado?.sobrenome ?? ""}`.toLowerCase().trim()
      return (
        nomeCompleto.toLowerCase().trim() === nomeCompComprador ||
        nomeCompleto.toLowerCase().trim() === nomeCompConvidado
      )
    })
  }

  const handleQRCodeRead = (decodedText) => {
    const agora = Date.now()
    if (agora - ultimaLeituraRef.current < TEMPO_ENTRE_LEITURAS) return
    ultimaLeituraRef.current = agora

    const nomeLido = decodedText.trim()
    const conviteEncontrado = encontrarConvitePorNomeCompleto(nomeLido)

    if (!conviteEncontrado) {
      toast.error(`Nenhum convite encontrado para: ${nomeLido}`)
      return
    }

    const nomeCompComprador = `${conviteEncontrado.comprador?.nome ?? ""} ${conviteEncontrado.comprador?.sobrenome ?? ""}`.toLowerCase().trim()
    const nomeCompConvidado = `${conviteEncontrado.convidado?.nome ?? ""} ${conviteEncontrado.convidado?.sobrenome ?? ""}`.toLowerCase().trim()

    if (nomeLido.toLowerCase() === nomeCompComprador) {
      if (conviteEncontrado.statusComprador === "presente") {
        toast.error("Comprador já registrado como presente!")
        return
      }
      setConviteSelecionado(conviteEncontrado)
      setModalTipo("comprador")
      setModalDetalhesAberto(true)
      setQrModalAberto(false)
      stopCamera()
    } else if (nomeLido.toLowerCase() === nomeCompConvidado) {
      if (conviteEncontrado.statusConvidado === "presente") {
        toast.error("Convidado já registrado como presente!")
        return
      }
      setConviteSelecionado(conviteEncontrado)
      setModalTipo("convidado")
      setModalDetalhesAberto(true)
      setQrModalAberto(false)
      stopCamera()
    } else {
      toast.error("Nome reconhecido, mas não foi possível identificar se é comprador ou convidado.")
    }
  }

  function stopCamera() {
    if (html5QrCodeRef.current) {
      // Só para se estiver rodando
      if (html5QrCodeRef.current._isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch((err) => {
            // Ignora erro de "Cannot stop, scanner is not running or paused."
            if (!String(err).includes("Cannot stop, scanner is not running or paused.")) {
              console.error("Erro ao parar scanner:", err)
            }
            html5QrCodeRef.current.clear()
          })
      } else {
        html5QrCodeRef.current.clear()
      }
    }
  }

  useEffect(() => {
    if (qrModalAberto) {
      setScannerLoading(true)
      const iniciarCamera = async () => {
        try {
          // Aguarda o DOM do modal ser renderizado
          await new Promise((resolve) => setTimeout(resolve, 500))
          const cameras = await Html5Qrcode.getCameras()
          if (!cameras || cameras.length === 0) {
            toast.error("Nenhuma câmera encontrada.")
            setScannerLoading(false)
            return
          }
          // Tenta encontrar a câmera traseira
          const backCamera = cameras.find(
            (cam) =>
              cam.label.toLowerCase().includes("back") ||
              cam.label.toLowerCase().includes("traseira") ||
              cam.label.toLowerCase().includes("rear")
          )
          const cameraId = backCamera ? backCamera.id : cameras[0].id
          // Garante que o elemento existe antes de iniciar
          const regionElement = document.getElementById(qrCodeRegionId)
          if (!regionElement) {
            toast.error("Elemento do scanner não encontrado.")
            setScannerLoading(false)
            return
          }
          if (!html5QrCodeRef.current) {
            html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId)
          }
          await html5QrCodeRef.current.start(
            cameraId,
            { fps: 10, qrbox: 250 },
            handleQRCodeRead,
            () => {}
          )
          setScannerLoading(false)
        } catch (err) {
          console.error("Erro ao iniciar câmera:", err)
          toast.error("Erro ao acessar a câmera: " + err.message)
          setScannerLoading(false)
        }
      }
      iniciarCamera()
    } else {
      stopCamera()
    }
  }, [qrModalAberto])
// ...existing code...

  const confirmarPresencaComprador = () => {
    update(ref(db, `convites/${idEvento}/${conviteSelecionado.id}`), {
      statusComprador: "presente",
    })
      .then(() => {
        toast.success("Presença do comprador confirmada!")
        setModalDetalhesAberto(false)
        setConvites((prev) =>
          prev.map((c) => (c.id === conviteSelecionado.id ? { ...c, statusComprador: "presente" } : c))
        )
      })
      .catch(() => toast.error("Erro ao confirmar presença do comprador."))
  }

  const confirmarPresencaConvidado = () => {
    update(ref(db, `convites/${idEvento}/${conviteSelecionado.id}`), {
      statusConvidado: "presente",
    })
      .then(() => {
        toast.success("Presença do convidado confirmada!")
        setModalDetalhesAberto(false)
        setConvites((prev) =>
          prev.map((c) => (c.id === conviteSelecionado.id ? { ...c, statusConvidado: "presente" } : c))
        )
      })
      .catch(() => toast.error("Erro ao confirmar presença do convidado."))
  }

  // Estatísticas
  const totalConvites = convites.length * 2
  const totalPresentes =
    convites.filter((c) => c.statusComprador === "presente").length +
    convites.filter((c) => c.statusConvidado === "presente").length
  const totalPendentes = totalConvites - totalPresentes

  // Filtro simples
  const convitesFiltrados = convites.filter((c) => {
    const termo = filtro.toLowerCase()
    return (
      c.comprador?.nome?.toLowerCase().includes(termo) ||
      c.comprador?.email?.toLowerCase().includes(termo) ||
      c.convidado?.nome?.toLowerCase().includes(termo) ||
      c.convidado?.email?.toLowerCase().includes(termo)
    )
  })



  const badgePresenca = (status) => (
    <Badge className={status === "presente" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
      {status === "presente" ? "Presente" : "Pendente"}
    </Badge>
  )

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" onClick={onVoltar} className="mb-6 hover:bg-purple-100 transition-colors duration-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Evento
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Convidados</h1>
                <p className="text-gray-600">Visualize e gerencie a presença dos convidados do evento</p>
              </div>
              <div className="mt-4">
                <Button onClick={() => setQrModalAberto(true)} className="mt-4">
                  <QrCode className="mr-2" /> Escanear QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
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
                    <p className="text-3xl font-bold">{totalPendentes}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
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

          {/* Lista de convites */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <>
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </CardContent>
                  </Card>
                ))}
              </>
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
              convitesFiltrados.map((convite) => (
                <Card
                  key={convite.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300 group"
                  onClick={() => {
                    setConviteSelecionado(convite)
                    setModalTipo(null)
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
                      {badgePresenca(
                        convite.statusComprador === "presente" && convite.statusConvidado === "presente"
                          ? "presente"
                          : "pendente"
                      )}
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
              ))
            )}
          </div>

          {/* Modal Scanner QR */}
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
                    <strong>Dica:</strong> Posicione o QR code dentro da área de escaneamento para validar a presença automaticamente.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal detalhes e confirmação presença */}
          <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Detalhes do Convite</DialogTitle>
              </DialogHeader>
              {conviteSelecionado && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-lg mb-1">Comprador</h2>
                    <p>
                      <strong>Nome:</strong> {conviteSelecionado.comprador?.nome} {conviteSelecionado.comprador?.sobrenome}
                    </p>
                    <p>
                      <strong>Email:</strong> {conviteSelecionado.comprador?.email}
                    </p>
                    <p>
                      <strong>CPF:</strong> {conviteSelecionado.comprador?.cpf}
                    </p>
                    <p>
                      <strong>Status:</strong> {badgePresenca(conviteSelecionado.statusComprador)}
                    </p>
                  </div>
                  {conviteSelecionado.convidado?.nome && (
                    <div>
                      <h2 className="font-semibold text-lg mb-1">Convidado</h2>
                      <p>
                        <strong>Nome:</strong> {conviteSelecionado.convidado?.nome} {conviteSelecionado.convidado?.sobrenome}
                      </p>
                      <p>
                        <strong>Email:</strong> {conviteSelecionado.convidado?.email}
                      </p>
                      <p>
                        <strong>Status:</strong> {badgePresenca(conviteSelecionado.statusConvidado)}
                      </p>
                    </div>
                  )}
                  {modalTipo === "comprador" && (
                    <Button
                      variant="outline"
                      onClick={confirmarPresencaComprador}
                      className="w-full mt-4"
                      disabled={conviteSelecionado.statusComprador === "presente"}
                    >
                      Confirmar Presença do Comprador
                    </Button>
                  )}
                  {modalTipo === "convidado" && (
                    <Button
                      variant="outline"
                      onClick={confirmarPresencaConvidado}
                      className="w-full mt-4"
                      disabled={conviteSelecionado.statusConvidado === "presente"}
                    >
                      Confirmar Presença do Convidado
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setModalDetalhesAberto(false)} className="w-full mt-2">
                    Fechar
                  </Button>
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