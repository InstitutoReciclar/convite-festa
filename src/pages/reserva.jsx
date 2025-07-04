import { useState } from "react"
import { db } from "../../firebase"
import { ref, push, set } from "firebase/database"
import QRCode from "react-qr-code"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Ticket, User, Mail, CreditCard, UserPlus, Download, CheckCircle, AlertCircle, Loader2, QrCode, Copy, RotateCcw } from "lucide-react"
import { Link } from "react-router-dom"

export default function ReservaConvite() {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    email: "",
    cpf: "",
    convidadoNome: "",
    convidadoSobrenome: "",
    convidadoEmail: "",
    convidadoCPF: "",
  })

  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  function validateForm() {
    const newErrors = {}

    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!form.sobrenome.trim()) newErrors.sobrenome = "Sobrenome é obrigatório"
    if (!form.email.trim()) {
      newErrors.email = "E-mail é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "E-mail inválido"
    }
    if (!form.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!/^\d{11}$/.test(form.cpf.replace(/\D/g, ""))) {
      newErrors.cpf = "CPF deve ter 11 dígitos"
    }

    if (form.convidadoEmail && !/\S+@\S+\.\S+/.test(form.convidadoEmail)) {
      newErrors.convidadoEmail = "E-mail do convidado inválido"
    }
    if (form.convidadoCPF && !/^\d{11}$/.test(form.convidadoCPF.replace(/\D/g, ""))) {
      newErrors.convidadoCPF = "CPF do convidado deve ter 11 dígitos"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const conviteRef = ref(db, "convites")
      const newConviteRef = push(conviteRef)
      const conviteId = newConviteRef.key
      const conviteData = {
        comprador: { nome: form.nome, sobrenome: form.sobrenome, email: form.email, cpf: form.cpf, },
        convidado: { nome: form.convidadoNome || null, sobrenome: form.convidadoSobrenome || null, email: form.convidadoEmail || null, cpf: form.convidadoCPF || null},
        status: "pendente",
        criadoEm: new Date().toISOString(),
      }
      await set(newConviteRef, conviteData)
      setQrCodeValue(conviteId)
      setSuccess(true)
    } catch (error) {
      setErrors({ submit: "Erro ao reservar convite: " + error.message })
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({
      nome: "",
      sobrenome: "",
      email: "",
      cpf: "",
      convidadoNome: "",
      convidadoSobrenome: "",
      convidadoEmail: "",
      convidadoCPF: "",
    })
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
  }

  function copyQRCodeId() {
    if (qrCodeValue) {
      navigator.clipboard.writeText(qrCodeValue)
    }
  }

  function downloadQRCode() {
    const svg = document.getElementById("qr-code-svg")
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const padding = 20
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, padding, padding)

      const pngFile = canvas.toDataURL("image/png")
      const downloadLink = document.createElement("a")
      downloadLink.download = `convite-${qrCodeValue}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  if (success && qrCodeValue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <CardTitle className="text-2xl font-bold text-green-800">Convite Reservado!</CardTitle>
              </div>
              <p className="text-green-700">Seu convite foi gerado com sucesso</p>
            </CardHeader>
          </Card>

          {/* QR Code */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-center justify-center">
                <QrCode className="h-5 w-5 text-blue-600" />
                QR Code do Convite
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg inline-block shadow-inner">
                <QRCode
                  id="qr-code-svg"
                  value={qrCodeValue}
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                />
              </div>

              <div className="space-y-2">
                <Badge variant="secondary" className="font-mono text-sm">
                  ID: {qrCodeValue}
                </Badge>
                <p className="text-sm text-gray-600">Apresente este QR Code no evento para validar sua entrada</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button onClick={copyQRCodeId} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar ID
                </Button>
                <Button onClick={downloadQRCode} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR Code
                </Button>
                <Button onClick={resetForm} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nova Reserva
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resumo dos Dados */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Comprador
                </h3>
                <div className="text-sm text-gray-600 space-y-1 pl-6">
                  <p>
                    <strong>Nome:</strong> {form.nome} {form.sobrenome}
                  </p>
                  <p>
                    <strong>E-mail:</strong> {form.email}
                  </p>
                  <p>
                    <strong>CPF:</strong> {form.cpf}
                  </p>
                </div>
              </div>

              {form.convidadoNome && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Convidado
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1 pl-6">
                      <p>
                        <strong>Nome:</strong> {form.convidadoNome} {form.convidadoSobrenome}
                      </p>
                      {form.convidadoEmail && (
                        <p>
                          <strong>E-mail:</strong> {form.convidadoEmail}
                        </p>
                      )}
                      {form.convidadoCPF && (
                        <p>
                          <strong>CPF:</strong> {form.convidadoCPF}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Ticket className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold text-gray-800">Reserva de Convite</CardTitle>
            </div>
            <p className="text-gray-600">Preencha os dados para gerar seu convite</p>
          </CardHeader>
        </Card>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados do Comprador */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Dados do Comprador
                <Badge variant="destructive" className="text-xs">
                  Obrigatório
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Digite seu nome"
                    value={form.nome}
                    onChange={handleChange}
                    className={errors.nome ? "border-red-500" : ""}
                  />
                  {errors.nome && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nome}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sobrenome">Sobrenome *</Label>
                  <Input
                    id="sobrenome"
                    name="sobrenome"
                    type="text"
                    placeholder="Digite seu sobrenome"
                    value={form.sobrenome}
                    onChange={handleChange}
                    className={errors.sobrenome ? "border-red-500" : ""}
                  />
                  {errors.sobrenome && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.sobrenome}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  CPF *
                </Label>
                <Input
                  id="cpf"
                  name="cpf"
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={handleChange}
                  className={errors.cpf ? "border-red-500" : ""}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.cpf}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dados do Convidado */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5 text-green-600" />
                Dados do Convidado
                <Badge variant="secondary" className="text-xs">
                  Opcional
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">Preencha apenas se você tem um convidado</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="convidadoNome">Nome</Label>
                  <Input
                    id="convidadoNome"
                    name="convidadoNome"
                    type="text"
                    placeholder="Nome do convidado"
                    value={form.convidadoNome}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="convidadoSobrenome">Sobrenome</Label>
                  <Input
                    id="convidadoSobrenome"
                    name="convidadoSobrenome"
                    type="text"
                    placeholder="Sobrenome do convidado"
                    value={form.convidadoSobrenome}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="convidadoEmail" className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  E-mail
                </Label>
                <Input
                  id="convidadoEmail"
                  name="convidadoEmail"
                  type="email"
                  placeholder="email@convidado.com"
                  value={form.convidadoEmail}
                  onChange={handleChange}
                  className={errors.convidadoEmail ? "border-red-500" : ""}
                />
                {errors.convidadoEmail && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.convidadoEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="convidadoCPF" className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  CPF
                </Label>
                <Input
                  id="convidadoCPF"
                  name="convidadoCPF"
                  type="text"
                  placeholder="000.000.000-00"
                  value={form.convidadoCPF}
                  onChange={handleChange}
                  className={errors.convidadoCPF ? "border-red-500" : ""}
                />
                {errors.convidadoCPF && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.convidadoCPF}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Erro de Submit */}
          {errors.submit && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Botão Submit */}
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <Button type="submit" disabled={loading} className="w-full h-12 text-lg" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  <>
                    <Ticket className="h-5 w-5 mr-2" />
                    Reservar Convite
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </form>
        <Link to={"/ListaConvidados"}>
        <Button>Ir para Lista de convidados</Button>
        </Link>

<br /><br />
          <Link to={"/ConsultaConvidados"}>
        <Button>Ir para Consulta de Convidados</Button>
        </Link>
        
      </div>
    </div>
  )
}
