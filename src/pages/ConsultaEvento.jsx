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
  Phone,
  CreditCard,
  Camera,
  Loader2,
} from "lucide-react"

const VisualizarEventos = ({ idEvento, onVoltar }) => {
  const [convites, setConvites] = useState([])
  const [conviteSelecionado, setConviteSelecionado] = useState(null)
  const [qrModalAberto, setQrModalAberto] = useState(false)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)
  const [modalEditarAberto, setModalEditarAberto] = useState(false)
  const [modalTipo, setModalTipo] = useState(null)
  const [scannerLoading, setScannerLoading] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [loading, setLoading] = useState(true)
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    cpf: "",
  })

  const qrCodeRegionId = "html5qr-code-full-region"
  const html5QrCodeRef = useRef(null)
  const ultimaLeituraRef = useRef(0)
  const TEMPO_ENTRE_LEITURAS = 2000
  const db = getDatabase()

  // Formatar CPF (xxx.xxx.xxx-xx)
  function formatarCPF(valor) {
    if (!valor) return ""
    valor = valor.replace(/\D/g, "")
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2")
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2")
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    return valor.slice(0, 14)
  }

  // Formatar telefone ((xx) xxxxx-xxxx)
  function formatarTelefone(valor) {
    if (!valor) return ""
    valor = valor.replace(/\D/g, "")
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2")
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2")
    return valor.slice(0, 15)
  }

  // Buscar convites do evento no Firebase
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

  // Parar a câmera QR Code
  function stopCamera() {
    if (html5QrCodeRef.current) {
      if (html5QrCodeRef.current._isScanning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            setTimeout(() => {
              try {
                html5QrCodeRef.current && html5QrCodeRef.current.clear()
              } catch {}
            }, 1000)
          })
          .catch((err) => {
            if (!String(err).includes("Cannot stop, scanner is not running or paused.")) {
              console.error("Erro ao parar scanner:", err)
            }
          })
      } else {
        try {
          html5QrCodeRef.current.clear()
        } catch {}
      }
    }
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  // Lida com leitura do QR Code (preenche filtro)
  const handleQRCodeRead = (decodedText) => {
    const agora = Date.now()
    if (agora - ultimaLeituraRef.current < TEMPO_ENTRE_LEITURAS) return
    ultimaLeituraRef.current = agora

    setFiltro(decodedText.trim())
    setQrModalAberto(false)
    stopCamera()
  }

  // Inicia câmera para leitura QR
  useEffect(() => {
    if (qrModalAberto) {
      setScannerLoading(true)
      const iniciarCamera = async () => {
        try {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const cameras = await Html5Qrcode.getCameras()
          if (!cameras || cameras.length === 0) {
            toast.error("Nenhuma câmera encontrada.")
            setScannerLoading(false)
            return
          }
          const backCamera = cameras.find((cam) =>
            ["back", "traseira", "rear"].some((label) => cam.label.toLowerCase().includes(label))
          )
          const cameraId = backCamera ? backCamera.id : cameras[0].id
          const regionElement = document.getElementById(qrCodeRegionId)
          if (!regionElement) {
            toast.error("Elemento do scanner não encontrado.")
            setScannerLoading(false)
            return
          }
          if (html5QrCodeRef.current) {
            try {
              await html5QrCodeRef.current.stop()
            } catch {}
            try {
              html5QrCodeRef.current.clear()
            } catch {}
          }
          html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId)
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

  // Confirmar presença do comprador
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

  // Confirmar presença do convidado
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

  // Cancelar convidado (zera os dados do convidado no Firebase)
  const cancelarConvidado = () => {
    update(ref(db, `convites/${idEvento}/${conviteSelecionado.id}/convidado`), {
      nome: "",
      sobrenome: "",
      telefone: "",
      cpf: "",
    })
      .then(() => {
        toast.success("Convidado cancelado com sucesso!")
        setModalDetalhesAberto(false)
      })
      .catch(() => toast.error("Erro ao cancelar convidado."))
  }

  // Abrir modal de edição com dados atuais do convidado
  const abrirModalEditarConvidado = () => {
    setDadosEdicao({
      nome: conviteSelecionado.convidado?.nome || "",
      sobrenome: conviteSelecionado.convidado?.sobrenome || "",
      telefone: conviteSelecionado.convidado?.telefone || "",
      cpf: conviteSelecionado.convidado?.cpf || "",
    })
    setModalEditarAberto(true)
  }

  // Salvar edição do convidado
  const salvarEdicaoConvidado = () => {
    update(ref(db, `convites/${idEvento}/${conviteSelecionado.id}/convidado`), dadosEdicao)
      .then(() => {
        toast.success("Convidado editado com sucesso!")
        setModalEditarAberto(false)
        setModalDetalhesAberto(false)
      })
      .catch(() => toast.error("Erro ao salvar edição do convidado."))
  }

  // Estatísticas
  const totalConvites = convites.length * 2
  const totalPresentes =
    convites.filter((c) => c.statusComprador === "presente").length +
    convites.filter((c) => c.statusConvidado === "presente").length
  const totalPendentes = totalConvites - totalPresentes

  // Filtro por nome e sobrenome do comprador e do convidado
  const convitesFiltrados = convites.filter((c) => {
    const termo = filtro.toLowerCase()
    const nomeComprador = `${c.comprador?.nome || ""} ${c.comprador?.sobrenome || ""}`.toLowerCase()
    const nomeConvidado = `${c.convidado?.nome || ""} ${c.convidado?.sobrenome || ""}`.toLowerCase()
    return nomeComprador.includes(termo) || nomeConvidado.includes(termo)
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
                  placeholder="Pesquisar por nome ou sobrenome..."
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
              <>
                {/* Cards de compradores */}
                {convitesFiltrados.map((convite) => (
                  <Card
                    key={convite.id + "-comprador"}
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300 group"
                    onClick={() => {
                      setConviteSelecionado(convite)
                      setModalTipo("comprador")
                      setModalDetalhesAberto(true)
                    }}
                  >
                    <CardHeader className="pb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                        {convite.comprador?.nome} {convite.comprador?.sobrenome}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4 mr-1" />
                        {formatarTelefone(convite.comprador?.telefone)}
                      </div>
                      {convite.comprador?.cpf && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <CreditCard className="w-4 h-4 mr-1" />
                          {formatarCPF(convite.comprador?.cpf)}
                        </div>
                      )}
                    </CardHeader>
                    <CardContent>
                      {badgePresenca(convite.statusComprador)}
                    </CardContent>
                  </Card>
                ))}

                {/* Cards de convidados */}
                {convitesFiltrados
                  .filter((convite) => convite.convidado?.nome)
                  .map((convite) => (
                    <Card
                      key={convite.id + "-convidado"}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-purple-300 group"
                      onClick={() => {
                        setConviteSelecionado(convite)
                        setModalTipo("convidado")
                        setModalDetalhesAberto(true)
                      }}
                    >
                      <CardHeader className="pb-3">
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors">
                          {convite.convidado?.nome} {convite.convidado?.sobrenome}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          {formatarTelefone(convite.convidado?.telefone)}
                        </div>
                        {convite.convidado?.cpf && (
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <CreditCard className="w-4 h-4 mr-1" />
                            {formatarCPF(convite.convidado?.cpf)}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        {badgePresenca(convite.statusConvidado)}
                      </CardContent>
                    </Card>
                  ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal Detalhes */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Detalhes do {modalTipo === "comprador" ? "Comprador" : "Convidado"}
            </DialogTitle>
          </DialogHeader>
          {conviteSelecionado && (
            <>
              <div className="space-y-2">
                <p>
                  <strong>Nome:</strong>{" "}
                  {modalTipo === "comprador"
                    ? `${conviteSelecionado.comprador?.nome} ${conviteSelecionado.comprador?.sobrenome}`
                    : `${conviteSelecionado.convidado?.nome} ${conviteSelecionado.convidado?.sobrenome}`}
                </p>
                <p>
                  <strong>Telefone:</strong>{" "}
                  {modalTipo === "comprador"
                    ? formatarTelefone(conviteSelecionado.comprador?.telefone)
                    : formatarTelefone(conviteSelecionado.convidado?.telefone)}
                </p>
                <p>
                  <strong>CPF:</strong>{" "}
                  {modalTipo === "comprador"
                    ? formatarCPF(conviteSelecionado.comprador?.cpf)
                    : formatarCPF(conviteSelecionado.convidado?.cpf)}
                </p>
                <p>
                  <strong>Status Presença:</strong>{" "}
                  {modalTipo === "comprador"
                    ? badgePresenca(conviteSelecionado.statusComprador)
                    : badgePresenca(conviteSelecionado.statusConvidado)}
                </p>
              </div>

              <div className="mt-6 flex gap-2 flex-wrap">
                {/* Botão confirmar presença */}
                {(modalTipo === "comprador" && conviteSelecionado.statusComprador !== "presente") && (
                  <Button onClick={confirmarPresencaComprador} variant="success" className="flex items-center gap-2">
                    <UserCheck /> Confirmar Presença
                  </Button>
                )}
                {(modalTipo === "convidado" && conviteSelecionado.statusConvidado !== "presente") && (
                  <Button onClick={confirmarPresencaConvidado} variant="success" className="flex items-center gap-2">
                    <UserCheck /> Confirmar Presença
                  </Button>
                )}

                {/* Botão editar convidado - só para convidados */}
                {modalTipo === "convidado" && (
                  <Button onClick={abrirModalEditarConvidado} variant="secondary" className="flex items-center gap-2">
                    <Users /> Editar Convidado
                  </Button>
                )}

                {/* Botão cancelar convidado - só para convidados que não estejam presentes */}
                {modalTipo === "convidado" && conviteSelecionado.statusConvidado !== "presente" && (
                  <Button onClick={cancelarConvidado} variant="destructive" className="flex items-center gap-2">
                    Cancelar Convidado
                  </Button>
                )}

                <Button variant="outline" onClick={() => setModalDetalhesAberto(false)}>
                  Fechar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Editar Convidado */}
      <Dialog open={modalEditarAberto} onOpenChange={setModalEditarAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Convidado</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              salvarEdicaoConvidado()
            }}
          >
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Nome"
                value={dadosEdicao.nome}
                onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Sobrenome"
                value={dadosEdicao.sobrenome}
                onChange={(e) => setDadosEdicao({ ...dadosEdicao, sobrenome: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Telefone"
                maxLength={15}
                value={formatarTelefone(dadosEdicao.telefone)}
                onChange={(e) => setDadosEdicao({ ...dadosEdicao, telefone: e.target.value })}
              />
              <Input
                type="text"
                placeholder="CPF"
                maxLength={14}
                value={formatarCPF(dadosEdicao.cpf)}
                onChange={(e) => setDadosEdicao({ ...dadosEdicao, cpf: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                  Salvar
                </Button>
                <Button variant="outline" onClick={() => setModalEditarAberto(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={qrModalAberto} onOpenChange={setQrModalAberto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR Code</DialogTitle>
          </DialogHeader>

          {scannerLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin mr-2" />
              <span>Carregando câmera...</span>
            </div>
          )}

          <div id={qrCodeRegionId} className="w-full h-72" />

          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setQrModalAberto(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VisualizarEventos
