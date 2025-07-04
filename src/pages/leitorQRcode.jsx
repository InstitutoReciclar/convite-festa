import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { db } from "../../firebase"
import { ref, get, update } from "firebase/database"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Camera,
  CheckCircle,
  XCircle,
  User,
  Mail,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react"

export default function LeitorQRCode() {
  const qrRegionId = "reader"
  const html5QrCodeRef = useRef(null)
  const [resultado, setResultado] = useState(null)
  const [conviteDados, setConviteDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [cameraId, setCameraId] = useState(null)

  // Função para iniciar o scanner
  async function iniciarScanner(camId) {
    if (!html5QrCodeRef.current) return
    setErro(null)
    setIsScanning(true)
    setResultado(null)
    setConviteDados(null)
    setModalAberto(false)

    try {
      await html5QrCodeRef.current.start(
        camId,
        { fps: 15, qrbox: 250 },
        async (decodedText) => {
          setResultado(decodedText)
          setIsScanning(false)
          // Busca dados no banco
          try {
            const conviteRef = ref(db, `convites/${decodedText}`)
            const snapshot = await get(conviteRef)
            if (snapshot.exists()) {
              setConviteDados(snapshot.val())
              setErro(null)
              setModalAberto(true)
              // Não para o scanner, deixa aberto para ler novamente depois do modal fechar
            } else {
              setConviteDados(null)
              setErro("Convite não encontrado.")
              setModalAberto(false)
            }
          } catch (error) {
            setErro("Erro ao buscar convite: " + error.message)
            setConviteDados(null)
            setModalAberto(false)
          }
        },
        (errorMessage) => {
          // Erros pequenos de leitura podem ser ignorados
        }
      )
    } catch (err) {
      setErro("Erro ao iniciar scanner: " + err.message)
      setIsScanning(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Função para parar scanner, só se estiver rodando
  async function pararScanner() {
    if (!html5QrCodeRef.current) return
    const state = html5QrCodeRef.current.getState()
    if (state === "SCANNING" || state === "STARTING") {
      try {
        await html5QrCodeRef.current.stop()
      } catch {}
    }
  }

  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode(qrRegionId)

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          const backCamera =
            devices.find((d) =>
              d.label.toLowerCase().includes("back") ||
              d.label.toLowerCase().includes("environment")
            ) || devices[devices.length - 1]

          setCameraId(backCamera.id)
          iniciarScanner(backCamera.id)
        } else {
          setErro("Nenhuma câmera encontrada.")
          setIsLoading(false)
        }
      })
      .catch((err) => {
        setErro("Erro ao buscar câmeras: " + err.message)
        setIsLoading(false)
      })

    return () => {
      // Cleanup ao desmontar componente
      pararScanner().then(() => {
        if (html5QrCodeRef.current) {
          html5QrCodeRef.current.clear()
        }
      })
    }
  }, [])

  // Marca presença e reinicia scanner

async function marcarPresenca() {
  if (!resultado) return
  try {
    const conviteRef = ref(db, `convites/${resultado}`)
    await update(conviteRef, { status: "presente" })
    alert("Convidado marcado como presente!")
    setModalAberto(false)
    setConviteDados(null)
    setResultado(null)
    setErro(null)

    // Reinicia scanner
    if (cameraId) {
      await pararScanner()
      iniciarScanner(cameraId)
    }
  } catch (error) {
    alert("Erro ao marcar presença: " + error.message)
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Camera className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">Leitor de QR Code</CardTitle>
            </div>
            <p className="text-gray-600">Escaneie o QR Code do convite para verificar os dados</p>
          </CardHeader>
        </Card>

        {/* Scanner */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="relative">
              <div
                id={qrRegionId}
                className="mx-auto rounded-lg overflow-hidden border-4 border-dashed border-gray-300"
                style={{ width: "300px", height: "300px" }}
              />

              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Iniciando câmera...</p>
                  </div>
                </div>
              )}

              {isScanning && !isLoading && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                    Escaneando
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resultado do QR Code */}
        {resultado && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>QR Code detectado:</strong> {resultado}
            </AlertDescription>
          </Alert>
        )}

        {/* Erro */}
        {erro && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{erro}</AlertDescription>
          </Alert>
        )}

        {/* Modal dos Dados do Convite */}
        {modalAberto && conviteDados && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-xl w-full p-6 relative shadow-lg">
              <button
                onClick={() => {
                  setModalAberto(false)
                  setResultado(null)
                  setConviteDados(null)
                  setErro(null)
                  if (cameraId) iniciarScanner(cameraId)
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 font-bold text-lg"
                aria-label="Fechar modal"
              >
                ×
              </button>

              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                  <Users className="h-5 w-5 text-blue-600" />
                  Dados do Convite
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comprador */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <h3 className="font-semibold text-gray-800">Comprador</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">Nome completo</p>
                      <p className="font-medium">
                        {conviteDados.comprador.nome} {conviteDados.comprador.sobrenome}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        E-mail
                      </p>
                      <p className="font-medium">{conviteDados.comprador.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        CPF
                      </p>
                      <p className="font-medium">{conviteDados.comprador.cpf}</p>
                    </div>
                  </div>
                </div>

                {/* Convidado (se existir) */}
                {conviteDados.convidado?.nome && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-800">Convidado</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Nome completo</p>
                          <p className="font-medium">
                            {conviteDados.convidado.nome} {conviteDados.convidado.sobrenome}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            E-mail
                          </p>
                          <p className="font-medium">{conviteDados.convidado.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            CPF
                          </p>
                          <p className="font-medium">{conviteDados.convidado.cpf}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Data de criação */}
                <Separator />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Criado em: {new Date(conviteDados.criadoEm).toLocaleString("pt-BR")}</span>
                </div>

                {/* Botão para marcar presença */}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={marcarPresenca}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Marcar como Presente
                  </button>
                </div>
              </CardContent>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}