import { useState, useRef } from "react"
import { ref, push, set } from "firebase/database"
import { dbRealtime } from "../../firebase"
// import QRCode from "qrcode.react" // npm install qrcode.react
import { QRCodeCanvas } from "qrcode.react"

import { jsPDF } from "jspdf"
import {
  Ticket,
  User,
  Mail,
  CreditCard,
  UserPlus,
  Download,
  AlertCircle,
  Loader2,
  Copy,
  RotateCcw,
  ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ReservaConvite({ evento }) {
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    telefone: "",
    cpf: "",
    convidadoNome: "",
    convidadoSobrenome: "",
    convidadoEmail: "",
    convidadoCPF: "",
  })

  const [imagemBase64, setImagemBase64] = useState(null)
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  // Ref para pegar o SVG do QR Code para baixar PNG
  const qrRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  function handleImagemChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagemBase64(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  function validateForm() {
    const newErrors = {}
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!form.sobrenome.trim()) newErrors.sobrenome = "Sobrenome é obrigatório"
    if (!form.telefone.trim()) newErrors.telefone = "Telefone é obrigatório"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.telefone = "E-mail inválido"
    if (!form.cpf.trim()) newErrors.cpf = "CPF é obrigatório"
    else if (!/^\d{11}$/.test(form.cpf.replace(/\D/g, "")))
      newErrors.cpf = "CPF deve ter 11 dígitos"
    if (form.convidadoTelefone && !/\S+@\S+\.\S+/.test(form.convidadoTelefone))
      newErrors.convidadoTelefone = "Telefone do convidado inválido"
    if (form.convidadoCPF && !/^\d{11}$/.test(form.convidadoCPF.replace(/\D/g, "")))
      newErrors.convidadoCPF = "CPF do convidado deve ter 11 dígitos"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // async function handleSubmit(e) {
  //   e.preventDefault()
  //   setLoading(true)
  //   setSuccess(false)
  //   if (!validateForm()) {
  //     setLoading(false)
  //     return
  //   }

  //   try {
  //     const conviteRefDb = ref(dbRealtime, `eventos/${evento?.id || "geral"}`)
  //     const newConviteRef = push(conviteRefDb)
  //     const conviteId = newConviteRef.key

  //     const conviteData = {
  //       comprador: { ...form },
  //       convidado: {
  //         nome: form.convidadoNome || null,
  //         sobrenome: form.convidadoSobrenome || null,
  //         email: form.convidadoEmail || null,
  //         cpf: form.convidadoCPF || null,
  //       },
  //       evento: {
  //         nomeEvento: evento?.nome || "",
  //         dataEvento: evento?.data || "",
  //         localEvento: evento?.local || "",
  //         imagemBase64: imagemBase64 || evento?.imagemBase64 || null,
  //         imagemURL: evento?.imagemURL || null,
  //       },
  //       status: "Convidado não presente",
  //       criadoEm: new Date().toISOString(),
  //     }

  //     await set(newConviteRef, conviteData)
  //     setQrCodeValue(conviteId)
  //     setSuccess(true)

  //     setTimeout(() => gerarPDF(conviteId, conviteData), 500)
  //   } catch (error) {
  //     setErrors({ submit: "Erro ao reservar convite: " + error.message })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  async function handleSubmit(e) {
  e.preventDefault()
  setLoading(true)
  setSuccess(false)

  if (!validateForm()) {
    setLoading(false)
    return
  }

  try {
    const conviteRefDb = ref(dbRealtime, `convites/${evento?.id || "geral"}`)
    const newConviteRef = push(conviteRefDb)
    const conviteId = newConviteRef.key

    const conviteData = {
      comprador: { ...form },
      convidado: {
        nome: form.convidadoNome || null,
        sobrenome: form.convidadoSobrenome || null,
        telefone: form.convidadoTelefone || null,
        cpf: form.convidadoCPF || null,
      },
      evento: {
        nomeEvento: evento?.nomeEvento || "",
        dataEvento: evento?.dataEvento || "",
        localEvento: evento?.localEvento || "",
        imagemBase64: imagemBase64 || evento?.imagemBase64 || null,
        imagemURL: evento?.imagemURL || null,
      },
      status: "Convidado não presente",
      criadoEm: new Date().toISOString(),
    }

    await set(newConviteRef, conviteData)
    setQrCodeValue(conviteId)
    setSuccess(true)

    setTimeout(() => gerarPDF(conviteId, conviteData), 500)  // chama o PDF gerado
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
      telefone: "",
      cpf: "",
      convidadoNome: "",
      convidadoSobrenome: "",
      convidadoTelefone: "",
      convidadoCPF: "",
    })
    setImagemBase64(null)
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
  }

  function copyQRCodeId() {
    if (qrCodeValue) navigator.clipboard.writeText(qrCodeValue)
  }

async function gerarPDF(conviteId, conviteData) {
  if (!conviteId) return alert("Convite não gerado ainda!");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Fundo azul escuro #003885
  doc.setFillColor("#003885");
  doc.rect(0, 0, 210, 297, "F");

  // Função para formatar data (exemplo simples)
  function formatarData(dataStr) {
    if (!dataStr) return "Data não definida";
    const d = new Date(dataStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  }

  // Adiciona imagem do evento, se houver imagemBase64 ou URL
  if (conviteData.evento.imagemBase64 || conviteData.evento.imagemURL) {
    // Se tiver base64, usa ele, senão carrega via URL
    const imgSrc = conviteData.evento.imagemBase64 || await getImageDataUrl(conviteData.evento.imagemURL);
    if (imgSrc) {
      // Ajusta altura 90mm, largura 180mm
      doc.addImage(imgSrc, "JPEG", 15, 15, 180, 90);
    }
  }

  // Gera QR Codes usando biblioteca 'qrcode' dinamicamente importada
  const QRCodeLib = await import("qrcode");
  const qrComprador = await QRCodeLib.toDataURL(`comprador-${conviteId}`, { width: 150 });

  let qrConvidado = null;
  const temConvidado = !!(conviteData.convidado?.nome?.trim());
  if (temConvidado) {
    qrConvidado = await QRCodeLib.toDataURL(`convidado-${conviteId}`, { width: 150 });
  }

  // Função para desenhar QR Code com borda branca
  function drawQrCode(x, y, size, img) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.rect(x, y, size, size);
    doc.addImage(img, "PNG", x + 2, y + 2, size - 4, size - 4);
  }

  const leftX = 25;
  const rightX = 130;
  const qrSize = 40;
  const startY = 110;

  // --- QR Comprador e informações ---
  drawQrCode(leftX, startY, qrSize, qrComprador);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Comprador:", leftX, startY + qrSize + 10);

  doc.setFontSize(14);
  doc.text(conviteData.comprador.nome || "", leftX, startY + qrSize + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`CPF: ${conviteData.comprador.cpf || ""}`, leftX, startY + qrSize + 26);
  doc.text(`Código: ${conviteId}`, leftX, startY + qrSize + 34);

  doc.setFontSize(12);
  doc.setTextColor(temConvidado ? "#FF99CC" : "#CCCCCC");
  doc.text(temConvidado ? "Com convidado" : "Sem convidado", leftX, startY + qrSize + 42);

  // --- QR Convidado e informações (se existir) ---
  if (temConvidado && qrConvidado) {
    drawQrCode(rightX, startY, qrSize, qrConvidado);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Convidado:", rightX, startY + qrSize + 10);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(conviteData.convidado.nome || "", rightX, startY + qrSize + 18);

    doc.setFontSize(12);
    doc.text(`CPF: ${conviteData.convidado.cpf || "N/A"}`, rightX, startY + qrSize + 26);
  }

  // Informações centrais do evento
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#FFCCFF");
  doc.text(formatarData(conviteData.evento?.dataEvento), 105, 220, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("às 19h", 105, 235, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#FF99CC");
  doc.text(`Local: ${conviteData.evento?.localEvento || "A definir"}`, 105, 255, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Av. Alcides Sangirardi, S/N - Cidade Jardim, São Paulo/SP", 105, 270, { align: "center" });

  // Rodapé
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(15, 285, 195, 285);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text("Agradecemos sua presença! Esperamos você no evento.", 105, 292, { align: "center" });

  // Salvar PDF
  doc.save(`Convite - ${conviteData.comprador.nome} ${conviteData.comprador.sobrenome}.pdf`);
}

// Auxiliar para carregar imagem via URL e converter em base64 (para usar no jsPDF)
async function getImageDataUrl(url) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

  function downloadQRCode() {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return

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

    img.onerror = () => alert("Erro ao gerar imagem do QR Code")
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {!success && (
          <>
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Ticket className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    Reserva de Convite
                  </CardTitle>
                </div>
                <p className="text-gray-600">Preencha os dados para gerar seu convite</p>
              </CardHeader>
            </Card>

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
                      WhatsApp *
                    </Label>
                    <Input
                      id="telefone"
                      name="tel"
                      type="tel"
                      placeholder="Informe seu WhatsApp"
                      value={form.telefone}
                      onChange={handleChange}
                      className={errors.telefone ? "border-red-500" : ""}
                    />
                    {errors.telefone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.telefone}
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
                      maxLength={11}
                      placeholder="Digite seu CPF (somente números)"
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

              {/* Dados do Convidado (Opcional) */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                    Dados do Convidado (Opcional)
                  </CardTitle>
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
                        className={errors.convidadoNome ? "border-red-500" : ""}
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
                        className={errors.convidadoSobrenome ? "border-red-500" : ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="convidadoTelefone" className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Telefone
                    </Label>
                    <Input
                      id="convidadoTelefone"
                      name="convidadoTelefone"
                      type="tel"
                      placeholder="Informe seu WhatsApp do convidado"
                      value={form.convidadoTelefone}
                      onChange={handleChange}
                      className={errors.convidadoTelefone ? "border-red-500" : ""}
                    />
                    {errors.convidadoTelefone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.convidadoTelefone}
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
                      maxLength={11}
                      placeholder="CPF do convidado"
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

              {/* Upload da Imagem do Evento */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                    Imagem do Evento (opcional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagemChange}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {(imagemBase64 || evento?.imagemURL) && (
                    <img
                      src={imagemBase64 || evento?.imagemURL}
                      alt="Banner do Evento"
                      className="mt-4 rounded-lg max-h-40 mx-auto object-contain"
                    />
                  )}
                </CardContent>
              </Card>

              {errors.submit && (
                <p className="text-center text-red-700 font-semibold">{errors.submit}</p>
              )}

              {/* Botões */}
              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Ticket className="h-5 w-5" />}
                  Reservar Convite
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Limpar
                </Button>
              </div>
            </form>
          </>
        )}

        {/* Sucesso e QRCode */}
        {success && qrCodeValue && (
          <div className="bg-white p-6 rounded-xl shadow-xl space-y-6 text-center">
            <Card className="border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-green-800">
                  Convite Reservado!
                </CardTitle>
              </CardHeader>
            </Card>

            {(imagemBase64 || evento?.imagemURL) && (
              <img
                src={imagemBase64 || evento?.imagemURL}
                alt="Banner do Evento"
                className="rounded-lg mx-auto max-h-64 object-contain"
              />
            )}

            <p>
              <strong>Evento:</strong> {evento?.nome}
            </p>
            <p>
              <strong>Data:</strong> {evento?.data}
            </p>
            <p>
              <strong>Local:</strong> {evento?.local}
            </p>

            <div className="flex justify-center" ref={qrRef}>
            <QRCodeCanvas id="qr-code-svg" value={qrCodeValue} size={200} />
            </div>

            <p className="text-sm text-gray-600">
              Apresente este QR Code no evento para validar sua entrada
            </p>

            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <Button onClick={copyQRCodeId} variant="outline" size="sm" className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                Copiar ID
              </Button>
              <Button onClick={downloadQRCode} variant="outline" size="sm" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Baixar QR Code
              </Button>
              <Button onClick={resetForm} variant="outline" size="sm" className="flex items-center gap-1">
                <RotateCcw className="h-4 w-4" />
                Nova Reserva
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
