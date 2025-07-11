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

  const handleQRCodeRead = (decodedText) => {
    const agora = Date.now()
    if (agora - ultimaLeituraRef.current < TEMPO_ENTRE_LEITURAS) return
    ultimaLeituraRef.current = agora

    const conviteEncontrado = convites.find((c) =>
      c.comprador?.nome === decodedText ||
      c.comprador?.email === decodedText ||
      c.comprador?.cpf === decodedText ||
      c.comprador?.id === decodedText ||
      c.convidado?.nome === decodedText ||
      c.convidado?.email === decodedText ||
      c.convidado?.cpf === decodedText ||
      c.convidado?.id === decodedText
    )

    if (!conviteEncontrado) {
      toast.error("Convite não encontrado!")
      return
    }

    const isComprador =
      conviteEncontrado.comprador?.nome === decodedText ||
      conviteEncontrado.comprador?.email === decodedText ||
      conviteEncontrado.comprador?.cpf === decodedText ||
      conviteEncontrado.comprador?.id === decodedText

    const isConvidado =
      conviteEncontrado.convidado?.nome === decodedText ||
      conviteEncontrado.convidado?.email === decodedText ||
      conviteEncontrado.convidado?.cpf === decodedText ||
      conviteEncontrado.convidado?.id === decodedText

    if (isComprador) {
      if (conviteEncontrado.statusComprador === "presente") {
        toast.error("Comprador já presente!")
        return
      }
      update(ref(db, `convites/${idEvento}/${conviteEncontrado.id}`), {
        statusComprador: "presente",
      })
        .then(() => {
          setConviteSelecionado({ ...conviteEncontrado, statusComprador: "presente" })
          setModalDetalhesAberto(true)
          setQrModalAberto(false)
          html5QrCodeRef.current?.stop().then(() => html5QrCodeRef.current.clear())
          toast.success("Presença do comprador confirmada!")
        })
        .catch(() => toast.error("Erro ao confirmar presença do comprador."))
    } else if (isConvidado) {
      if (conviteEncontrado.statusConvidado === "presente") {
        toast.error("Convidado já presente!")
        return
      }
      update(ref(db, `convites/${idEvento}/${conviteEncontrado.id}`), {
        statusConvidado: "presente",
      })
        .then(() => {
          setConviteSelecionado({ ...conviteEncontrado, statusConvidado: "presente" })
          setModalDetalhesAberto(true)
          setQrModalAberto(false)
          html5QrCodeRef.current?.stop().then(() => html5QrCodeRef.current.clear())
          toast.success("Presença do convidado confirmada!")
        })
        .catch(() => toast.error("Erro ao confirmar presença do convidado."))
    } else {
      toast.error("Não foi possível identificar se é comprador ou convidado.")
    }
  }

  // Total de convites = número de compradores + número de convidados (cada convite tem 2 pessoas)
  const totalConvites = convites.length * 2

  // Total presentes
  const totalPresentes =
    convites.filter((c) => c.statusComprador === "presente").length +
    convites.filter((c) => c.statusConvidado === "presente").length

  // Pendentes = total convites - presentes
  const totalPendentes = totalConvites - totalPresentes

  // Filtro aplicado sobre compradores e convidados
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
                    <p className="text-3xl font-bold">{totalPendentes}</p>
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

                  <div>
                    <p className="font-semibold">Comprador:</p>
                    <p>{conviteSelecionado.comprador?.nome}</p>
                    <p>Email: {conviteSelecionado.comprador?.email}</p>
                    <p>CPF: {conviteSelecionado.comprador?.cpf}</p>
                    {badgePresenca(conviteSelecionado.statusComprador)}
                    {conviteSelecionado.statusComprador !== "presente" && (
                      <Button onClick={() => handleQRCodeRead(conviteSelecionado.comprador?.email)}>
                        Confirmar Presença Comprador
                      </Button>
                    )}
                  </div>

                  {conviteSelecionado.convidado && (
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Convidado:</p>
                      <p>{conviteSelecionado.convidado.nome}</p>
                      <p>Email: {conviteSelecionado.convidado.email}</p>
                      <p>CPF: {conviteSelecionado.convidado.cpf}</p>
                      {badgePresenca(conviteSelecionado.statusConvidado)}
                      {conviteSelecionado.statusConvidado !== "presente" && (
                        <Button onClick={() => handleQRCodeRead(conviteSelecionado.convidado?.email)}>
                          Confirmar Presença Convidado
                        </Button>
                      )}
                    </div>
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
