import { useState, useRef } from "react"
import { dbRealtime } from "../../firebase"
import { ref, push, set } from "firebase/database"
import QRCodeReact from "react-qr-code"   // componente React para renderizar QR no DOM
import QRCode from "qrcode"                // biblioteca para gerar QR base64 para PDF
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import {
  Ticket, User, Mail, CreditCard, UserPlus, Download,
  CheckCircle, AlertCircle, Loader2, QrCode,
  Copy, RotateCcw, ImageIcon, Share2
} from "lucide-react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function ReservaConvite() {
  const [form, setForm] = useState({
    nome: "", sobrenome: "", email: "", cpf: "",
    convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
  })
  const [eventoInfo, setEventoInfo] = useState({
    nomeEvento: "", dataEvento: "", localEvento: "", imagem: null, imagemURL: "",
  })
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const conviteRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  function handleImagemChange(e) {
    const file = e.target.files[0]
    if (file) {
      setEventoInfo((prev) => ({ ...prev, imagem: file, imagemURL: URL.createObjectURL(file) }))
    }
  }

  function validateForm() {
    const newErrors = {}
    if (!form.nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (!form.sobrenome.trim()) newErrors.sobrenome = "Sobrenome é obrigatório"
    if (!form.email.trim()) newErrors.email = "E-mail é obrigatório"
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "E-mail inválido"
    if (!form.cpf.trim()) newErrors.cpf = "CPF é obrigatório"
    else if (!/^\d{11}$/.test(form.cpf.replace(/\D/g, ""))) newErrors.cpf = "CPF deve ter 11 dígitos"
    if (form.convidadoEmail && !/\S+@\S+\.\S+/.test(form.convidadoEmail)) newErrors.convidadoEmail = "E-mail do convidado inválido"
    if (form.convidadoCPF && !/^\d{11}$/.test(form.convidadoCPF.replace(/\D/g, ""))) newErrors.convidadoCPF = "CPF do convidado deve ter 11 dígitos"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    if (!validateForm()) { setLoading(false); return }

    try {
      const conviteRefDb = ref(dbRealtime, "convites")
      const newConviteRef = push(conviteRefDb)
      const conviteId = newConviteRef.key

      const conviteData = {
        comprador: { ...form },
        convidado: {
          nome: form.convidadoNome || null,
          sobrenome: form.convidadoSobrenome || null,
          email: form.convidadoEmail || null,
          cpf: form.convidadoCPF || null
        },
        evento: { ...eventoInfo, imagem: null },
        status: "Convidado Pendente",
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
    setForm({ nome: "", sobrenome: "", email: "", cpf: "", convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "" })
    setEventoInfo({ nomeEvento: "", dataEvento: "", localEvento: "", imagem: null, imagemURL: "" })
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
  }

  function copyQRCodeId() {
    if (qrCodeValue) navigator.clipboard.writeText(qrCodeValue)
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



// Função utilitária para carregar imagem base64 a partir de URL local
async function getImageDataUrl(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Função para formatar a data no formato "07 de Julho de 2025"
function formatarData(dataStr) {
  if (!dataStr) return "Data não definida";

  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const data = new Date(dataStr);
  if (isNaN(data)) return dataStr; // caso não consiga converter, retorna original

  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();

  return `${dia.toString().padStart(2, '0')} de ${mes} de ${ano}`;
}

async function gerarPDF() {
  if (!qrCodeValue) return alert("Convite não gerado ainda!");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Fundo azul escuro #003885
  doc.setFillColor("#003885");
  doc.rect(0, 0, 210, 297, "F");

  // Imagem topo, se houver
  if (eventoInfo.imagemURL) {
    const imgData = await getImageDataUrl(eventoInfo.imagemURL);
    if (imgData) {
      doc.addImage(imgData, "JPEG", 15, 15, 180, 90);

    }
  }

  // Gerar QR Codes
  const qrComprador = await QRCode.toDataURL(`comprador-${qrCodeValue}`, { width: 150 });
  let qrConvidado = null;
  const temConvidado = !!form.convidadoNome?.trim();
  if (temConvidado) {
    qrConvidado = await QRCode.toDataURL(`convidado-${qrCodeValue}`, { width: 150 });
  }

  // Função para desenhar QR Code com borda branca
  function drawQrCode(x, y, size, img) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1);
    doc.rect(x, y, size, size);
    doc.addImage(img, "PNG", x + 2, y + 2, size - 4, size - 4);
  }

  // Espaçamento e alinhamento para informações do QR Code
  const leftX = 25;
  const rightX = 130;
  const qrSize = 40;       // tamanho menor do QR Code
  const startY = 110;      // nova posição vertical (descida)

  // --- QR Comprador e suas informações ---
  drawQrCode(leftX, startY, qrSize, qrComprador);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Comprador:", leftX, startY + qrSize + 10);

  doc.setFontSize(14);
  doc.text(form.nome, leftX, startY + qrSize + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`CPF: ${form.cpf}`, leftX, startY + qrSize + 26);
  doc.text(`Código: ${qrCodeValue}`, leftX, startY + qrSize + 34);

  doc.setFontSize(12);
  doc.setTextColor(temConvidado ? '#FF99CC' : '#CCCCCC');
  doc.text(temConvidado ? "Com convidado" : "Sem convidado", leftX, startY + qrSize + 42);

  // --- QR Convidado e suas informações (se houver) ---
  if (temConvidado && qrConvidado) {
    drawQrCode(rightX, startY, qrSize, qrConvidado);

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Convidado:", rightX, startY + qrSize + 10);

    doc.setFontSize(14);
    doc.text(form.convidadoNome, rightX, startY + qrSize + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`CPF: ${form.convidadoCPF || "N/A"}`, rightX, startY + qrSize + 26);
  }

  // Informações centrais do evento (descidas para y maiores)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor("#FFCCFF"); // cor clara para contraste com fundo azul escuro
  doc.text(formatarData(eventoInfo.dataEvento), 105, 220, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text("às 19h", 105, 235, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor("#FF99CC");
  doc.text(`Local: ${eventoInfo.localEvento || "A definir"}`, 105, 255, { align: "center" });

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
  doc.save(`Convite - ${form.nome} ${form.sobrenome}.pdf`);
}




  if (success && qrCodeValue) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div ref={conviteRef} className="bg-white p-4 rounded-xl shadow-xl space-y-6" style={{ backgroundColor: "#ffffff" }}>
            <Card className="border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-green-800">Convite Reservado!</CardTitle>
              </CardHeader>
            </Card>
            {eventoInfo.imagemURL && (
              <img src={eventoInfo.imagemURL} alt="Banner" className="rounded-lg mx-auto max-h-64 object-contain" />
            )}
            <div className="text-center text-gray-800">
              <p><strong>Evento:</strong> {eventoInfo.nomeEvento}</p>
              <p><strong>Data:</strong> {eventoInfo.dataEvento}</p>
              <p><strong>Local:</strong> {eventoInfo.localEvento}</p>
            </div>
            <div className="flex justify-center">
              <QRCodeReact id="qr-code-svg" value={qrCodeValue} size={200} />
            </div>
            <p className="text-sm text-center text-gray-600">Apresente este QR Code no evento para validar sua entrada</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={copyQRCodeId} variant="outline" size="sm"><Copy className="h-4 w-4 mr-2" />Copiar ID</Button>
            <Button onClick={downloadQRCode} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Baixar QR Code</Button>
            <Button onClick={gerarPDF} variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Baixar PDF do Convite</Button>
            <Button onClick={resetForm} variant="outline" size="sm"><RotateCcw className="h-4 w-4 mr-2" />Nova Reserva</Button>
          </div>
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

          {/* Dados do Evento */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ImageIcon className="h-5 w-5 text-indigo-600" />
                Informações do Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeEvento">Nome do Evento</Label>
                <Input
                  id="nomeEvento"
                  name="nomeEvento"
                  type="text"
                  placeholder="Nome do evento"
                  value={eventoInfo.nomeEvento}
                  onChange={(e) => setEventoInfo((prev) => ({ ...prev, nomeEvento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataEvento">Data do Evento</Label>
                <Input
                  id="dataEvento"
                  name="dataEvento"
                  type="date"
                  value={eventoInfo.dataEvento}
                  onChange={(e) => setEventoInfo((prev) => ({ ...prev, dataEvento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localEvento">Local do Evento</Label>
                <Input
                  id="localEvento"
                  name="localEvento"
                  type="text"
                  placeholder="Local do evento"
                  value={eventoInfo.localEvento}
                  onChange={(e) => setEventoInfo((prev) => ({ ...prev, localEvento: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imagemEvento">Imagem do Evento</Label>
                <input
                  id="imagemEvento"
                  name="imagemEvento"
                  type="file"
                  accept="image/*"
                  onChange={handleImagemChange}
                />
              </div>
            </CardContent>
          </Card>

          {errors.submit && (
            <p className="text-red-600 text-center font-semibold">{errors.submit}</p>
          )}

          <div className="text-center">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Ticket className="mr-2 h-4 w-4" />}
              Reservar Convite
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
