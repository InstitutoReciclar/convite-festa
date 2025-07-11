import { useState, useEffect, useRef } from "react"
import { ref, push, set, onValue, remove } from "firebase/database"
import { dbRealtime } from "../../firebase"
import QRCodeReact from "react-qr-code"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar, PartyPopper, Save, Ticket, User, UserPlus, Download, Copy, AlertCircle, Loader2, MapPin, Clock, Users, CheckCircle2, Sparkles, Gift, Camera, QrCode,
} from "lucide-react"
import { toast } from "react-toastify"
import VisualizarEventos from "./ConsultaEvento"
import { v4 as uuidv4 } from "uuid"

export default function EventoEConvite() {
  // Estados
  const [evento, setEvento] = useState({
    nomeEvento: "", tipoEvento: "festa", data: "", horaInicio: "", horaFim: "", local: "", endereco: "", numero: "", cep: "", responsavel: "",
    telefone: "", email: "", capacidade: "", descricao: "",
  })
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")
  const [eventosLista, setEventosLista] = useState({})
  const [eventoSelecionado, setEventoSelecionado] = useState(null)
  const [form, setForm] = useState({
    nome: "", sobrenome: "", email: "", cpf: "", convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
  })
  const [eventoInfo, setEventoInfo] = useState({
    idEvento: "", nomeEvento: "", dataEvento: "", localEvento: "", imagem: null, imagemURL: "", imagemBase64: "",
  })
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [convitesEvento, setConvitesEvento] = useState({})
  const [visualizandoConvites, setVisualizandoConvites] = useState(false)

  // Tipos de evento
  const tiposEvento = [
    { value: "brunch", label: "Brunch", icon: "☕", color: "bg-pink-500" },
    { value: "corporativo", label: "Corporativo", icon: "🏢", color: "bg-blue-500" },
    { value: "formatura", label: "Formatura", icon: "🎓", color: "bg-purple-500" },
    { value: "outro", label: "Outro", icon: "🎵", color: "bg-gray-500" },
  ]

  // Cadastro evento
  const handleChangeEvento = (e) => {
    const { name, value } = e.target
    setEvento((prev) => ({ ...prev, [name]: value }))
  }
  const handleSubmitEvento = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem("")
    try {
      const eventosRef = ref(dbRealtime, "eventos")
      await push(eventosRef, { ...evento, criadoEm: Date.now() })
      setMensagem("✅ Evento cadastrado com sucesso!")
      setEvento({
        nomeEvento: "", tipoEvento: "festa", data: "", horaInicio: "", horaFim: "", local: "", endereco: "", numero: "", cep: "",
        responsavel: "", telefone: "", email: "", capacidade: "", descricao: "",
      })
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      setMensagem("❌ Erro ao salvar evento.")
    } finally {
      setSalvando(false)
    }
  }

  // Excluir convite
  function excluirConvite(conviteId) {
    if (window.confirm("Deseja realmente excluir este convite?")) {
      const conviteRef = ref(dbRealtime, `convites/${eventoSelecionado.id}/${conviteId}`)
      remove(conviteRef)
        .then(() => toast.success("Convite excluído com sucesso!"))
        .catch((err) => toast.error("Erro ao excluir convite: " + err.message))
    }
  }

  // Carregar convites do evento selecionado
  useEffect(() => {
    if (!eventoSelecionado) return
    const convitesRef = ref(dbRealtime, `convites/${eventoSelecionado.id}`)
    const unsubscribe = onValue(convitesRef, (snapshot) => {
      setConvitesEvento(snapshot.val() || {})
    })
    return () => unsubscribe()
  }, [eventoSelecionado])

  // Carregar eventos do Firebase
  useEffect(() => {
    const eventosRef = ref(dbRealtime, "eventos")
    return onValue(eventosRef, (snapshot) => {
      const data = snapshot.val() || {}
      setEventosLista(data)
    })
  }, [])

  // Selecionar evento para convite
  function selecionarEventoParaConvite(id, eventoDados) {
    setEventoSelecionado({ id, ...eventoDados })
    setEventoInfo({
      idEvento: id,
      nomeEvento: eventoDados.nomeEvento || "",
      dataEvento: eventoDados.data || eventoDados.dataEvento || "",
      localEvento: eventoDados.local || eventoDados.endereco || eventoDados.localEvento || "",
      imagem: null,
      imagemURL: "",
      imagemBase64: "",
    })
    setForm({
      nome: "", sobrenome: "", email: "", cpf: "", convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
    })
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
    setLoading(false)
  }

  // Form handlers
  function handleChangeConvite(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  function handleImagemChange(e) {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEventoInfo((prev) => ({
          ...prev,
          imagem: file,
          imagemURL: URL.createObjectURL(file),
          imagemBase64: reader.result,
        }))
      }
      reader.readAsDataURL(file)
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
    if (form.convidadoEmail && !/\S+@\S+\.\S+/.test(form.convidadoEmail))
      newErrors.convidadoEmail = "E-mail do convidado inválido"
    if (form.convidadoCPF && !/^\d{11}$/.test(form.convidadoCPF.replace(/\D/g, "")))
      newErrors.convidadoCPF = "CPF do convidado deve ter 11 dígitos"
    if (!eventoInfo.idEvento.trim()) newErrors.idEvento = "ID do evento é obrigatório"
    if (!eventoInfo.nomeEvento.trim()) newErrors.nomeEvento = "Nome do evento é obrigatório"
    if (!eventoInfo.dataEvento.trim()) newErrors.dataEvento = "Data do evento é obrigatória"
    if (!eventoInfo.localEvento.trim()) newErrors.localEvento = "Local do evento é obrigatório"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmitConvite(e) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    if (!validateForm()) {
      setLoading(false)
      return
    }
    try {
      const conviteRefDb = ref(dbRealtime, `convites/${eventoInfo.idEvento}`)
      const newConviteRef = push(conviteRefDb)
      const conviteId = newConviteRef.key
      const convidadoId = uuidv4()
      const conviteData = {
        comprador: { ...form },
        convidado: {
          id: convidadoId,
          nome: form.convidadoNome || null,
          sobrenome: form.convidadoSobrenome || null,
          email: form.convidadoEmail || null,
          cpf: form.convidadoCPF || null,
        },
        evento: {
          ...eventoInfo,
          imagem: null,
          imagemURL: eventoInfo.imagemBase64 || eventoInfo.imagemURL || "",
        },
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
    setForm({
      nome: "", sobrenome: "", email: "", cpf: "", convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
    })
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
    setLoading(false)
  }

  function copyQRCodeId() {
    if (qrCodeValue) navigator.clipboard.writeText(qrCodeValue)
  }

  function downloadQRCode() {
    const svg = document.getElementById("qr-code-svg")
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
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  function formatarData(dataStr) {
    if (!dataStr) return "Data não definida"
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    const data = new Date(dataStr)
    if (isNaN(data)) return dataStr
    const dia = data.getDate()
    const mes = meses[data.getMonth()]
    const ano = data.getFullYear()
    return `${dia.toString().padStart(2, "0")} de ${mes} de ${ano}`
  }

  function formatarHora(horaStr) {
    if (!horaStr) return "Horário a definir"
    const [hora, minuto] = horaStr.split(":")
    if (!hora) return "Horário a definir"
    return `às ${hora}h${minuto || ""}`
  }

  async function getImageDataUrl(url) {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  async function gerarPDFComprador() {
    if (!qrCodeValue) return alert("Convite não gerado ainda!")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    doc.setFillColor("#003885")
    doc.rect(0, 0, 210, 297, "F")
    if (eventoInfo.imagemURL) {
      const imgData = await getImageDataUrl(eventoInfo.imagemURL)
      if (imgData) doc.addImage(imgData, "JPEG", 15, 15, 180, 90)
    }
    const nomeCompletoComprador = `${form.nome} ${form.sobrenome}`
    const qrComprador = await QRCode.toDataURL(nomeCompletoComprador)
    function drawQrCode(x, y, size, img) {
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.rect(x, y, size, size)
      doc.addImage(img, "PNG", x + 2, y + 2, size - 4, size - 4)
    }
    const leftX = 25
    const qrSize = 40
    const startY = 110
    drawQrCode(leftX, startY, qrSize, qrComprador)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Comprador:", leftX, startY + qrSize + 10)
    doc.setFontSize(14)
    doc.text(nomeCompletoComprador, leftX, startY + qrSize + 18)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`CPF: ${form.cpf}`, leftX, startY + qrSize + 26)
    doc.text(`Código: ${qrCodeValue}`, leftX, startY + qrSize + 34)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor("#FFCCFF")
    doc.text(formatarData(eventoInfo.dataEvento), 105, 220, { align: "center" })
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(255, 255, 255)
    doc.text(formatarHora(eventoInfo.horaInicio), 105, 235, { align: "center" })
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor("#FF99CC")
    doc.text(`Local: ${eventoInfo.localEvento || "A definir"}`, 105, 255, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(evento.endereco || eventoInfo.localEvento || "", 105, 270, { align: "center" })
    doc.text("Agradecemos sua presença! Esperamos você no evento.", 105, 292, { align: "center" })
    doc.save(`Convite - ${nomeCompletoComprador}.pdf`)
  }

  async function gerarPDFConvidado() {
    if (!qrCodeValue) return alert("Convite não gerado ainda!")
    if (!form.convidadoNome?.trim()) return alert("Nenhum convidado foi informado!")
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
    doc.setFillColor("#003885")
    doc.rect(0, 0, 210, 297, "F")
    if (eventoInfo.imagemURL) {
      const imgData = await getImageDataUrl(eventoInfo.imagemURL)
      if (imgData) doc.addImage(imgData, "JPEG", 15, 15, 180, 90)
    }
    const nomeCompletoConvidado = `${form.convidadoNome} ${form.convidadoSobrenome}`
    const qrConvidado = await QRCode.toDataURL(nomeCompletoConvidado)
    function drawQrCode(x, y, size, img) {
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.rect(x, y, size, size)
      doc.addImage(img, "PNG", x + 2, y + 2, size - 4, size - 4)
    }
    const leftX = 25
    const qrSize = 40
    const startY = 110
    drawQrCode(leftX, startY, qrSize, qrConvidado)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Convidado:", leftX, startY + qrSize + 10)
    doc.setFontSize(14)
    doc.text(nomeCompletoConvidado, leftX, startY + qrSize + 18)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`CPF: ${form.convidadoCPF || "N/A"}`, leftX, startY + qrSize + 26)
    doc.text(`Código: ${qrCodeValue}`, leftX, startY + qrSize + 34)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor("#FFCCFF")
    doc.text(formatarData(eventoInfo.dataEvento), 105, 220, { align: "center" })
    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(255, 255, 255)
    doc.text(formatarHora(eventoInfo.horaInicio), 105, 235, { align: "center" })
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor("#FF99CC")
    doc.text(`Local: ${eventoInfo.localEvento || "A definir"}`, 105, 255, { align: "center" })
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text(evento.endereco || eventoInfo.localEvento || "", 105, 270, { align: "center" })
    doc.text("Agradecemos sua presença! Esperamos você no evento.", 105, 292, { align: "center" })
    doc.save(`Convite - ${nomeCompletoConvidado}.pdf`)
  }

  // Renderização
  if (!eventoSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">Sistema de Eventos</h1>
            <p className="text-gray-600 text-lg">Crie eventos incríveis e gere convites personalizados</p>
          </div>
          {/* Cadastro Evento */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <PartyPopper className="h-7 w-7" />
                Cadastro de Evento
              </CardTitle>
              <p className="text-purple-100">Preencha os dados abaixo para criar um novo evento</p>
            </CardHeader>
            <CardContent className="p-8">
              <form className="space-y-8" onSubmit={handleSubmitEvento}>
                {/* Informações Básicas */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Informações Básicas</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Nome do Evento</Label>
                      <Input name="nomeEvento" value={evento.nomeEvento} onChange={handleChangeEvento} required className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" placeholder="Ex: Festa de Aniversário da Maria" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Tipo do Evento</Label>
                      <select name="tipoEvento" value={evento.tipoEvento} onChange={handleChangeEvento} className="w-full h-12 border-2 border-gray-200 rounded-md px-4 text-sm focus:border-purple-500 transition-colors">
                        {tiposEvento.map((tipo) => (<option key={tipo.value} value={tipo.value}>{tipo.icon} {tipo.label}</option>))}
                      </select>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Data e Horário</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Data</Label>
                      <Input type="date" name="data" value={evento.data} onChange={handleChangeEvento} required
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Hora Início</Label>
                      <Input type="time" name="horaInicio" value={evento.horaInicio} onChange={handleChangeEvento} required
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Hora Fim</Label>
                      <Input type="time" name="horaFim" value={evento.horaFim} onChange={handleChangeEvento} required
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Localização</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Local</Label>
                      <Input name="local" value={evento.local} onChange={handleChangeEvento} required placeholder="Ex: Salão de Festas"
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Endereço</Label>
                      <Input name="endereco" value={evento.endereco} onChange={handleChangeEvento} placeholder="Ex: Rua das Flores" required 
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Número</Label>
                      <Input name="numero" value={evento.numero} onChange={handleChangeEvento} required placeholder="123"
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">CEP</Label>
                      <Input name="cep" value={evento.cep} onChange={handleChangeEvento} placeholder="00000-000" required
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Capacidade</Label>
                      <Input name="capacidade" type="number" placeholder="Ex: 100 pessoas" value={evento.capacidade} onChange={handleChangeEvento}
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Responsável</h3>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Nome</Label>
                      <Input name="responsavel" value={evento.responsavel} onChange={handleChangeEvento} placeholder="Nome do responsável" required
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Telefone</Label>
                      <Input name="telefone" value={evento.telefone} placeholder="(11) 99999-9999" onChange={handleChangeEvento} 
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email</Label>
                      <Input placeholder="email@exemplo.com" name="email" type="email" value={evento.email} onChange={handleChangeEvento}
                        className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                  <Textarea name="descricao" value={evento.descricao} onChange={handleChangeEvento} rows={4} placeholder="Descreva os detalhes do seu evento..."
                    className="border-2 border-gray-200 focus:border-purple-500 transition-colors resize-none" />
                </div>
                <div className="pt-6 flex justify-end">
                  <Button type="submit" disabled={salvando}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 h-auto text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    {salvando ? (<><Loader2 className="h-5 w-5 mr-2 animate-spin" />Salvando...</>) : (<><Save className="h-5 w-5 mr-2" />Salvar Evento</>)}
                  </Button>
                </div>
                {mensagem && (
                  <div className={`p-4 rounded-lg border-l-4 ${mensagem.startsWith("✅") ? "bg-green-50 border-green-500 text-green-700" : "bg-red-50 border-red-500 text-red-700"}`}>
                    <div className="flex items-center">
                      {mensagem.startsWith("✅") ? (<CheckCircle2 className="h-5 w-5 mr-2" />) : (<AlertCircle className="h-5 w-5 mr-2" />)}{mensagem}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl font-bold flex items-center gap-3"><Calendar className="h-6 w-6" />Eventos Cadastrados</CardTitle>
              <p className="text-blue-100">Selecione um evento para gerar convites</p>
            </CardHeader>
            <CardContent className="p-6">
              {Object.keys(eventosLista).length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Nenhum evento cadastrado ainda</p>
                  <p className="text-gray-400">Cadastre seu primeiro evento acima!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(eventosLista).map(([id, ev]) => {
                    const tipoInfo = tiposEvento.find((t) => t.value === ev.tipoEvento) || tiposEvento[0]
                    return (
                      <Card key={id} className="cursor-pointer border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 group"
                        onClick={() => selecionarEventoParaConvite(id, ev)}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 ${tipoInfo.color} rounded-full flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}>{tipoInfo.icon}</div>
                            <Badge variant="secondary" className="text-xs">{tipoInfo.label}</Badge>
                          </div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{ev.nomeEvento}</h3>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{formatarData(ev.data)}</div>
                            <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{ev.horaInicio} - {ev.horaFim}</div>
                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{ev.local}</div>
                            {ev.capacidade && (<div className="flex items-center gap-2"><Users className="h-4 w-4" />{ev.capacidade} pessoas</div>)}
                          </div>
                          <Button variant="outline" size="sm" className="w-full group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200 bg-transparent">
                            <Ticket className="h-4 w-4 mr-2" />Gerar Convites</Button>
                            <Button
                              variant="outline"
                              className="mt-6 border-purple-600 text-purple-600 hover:bg-purple-50"
                              onClick={() => setVisualizandoConvites(true)}
                            >
                              📋 Gerenciar Convites
                            </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (visualizandoConvites && eventoInfo.idEvento) {
    return (<VisualizarEventos idEvento={eventoInfo.idEvento} onVoltar={() => setVisualizandoConvites(false)} />)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setEventoSelecionado(null)} className="mb-6 hover:bg-white/50 transition-colors">Voltar para Eventos</Button>
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Ticket className="h-7 w-7" />Reservar Convite
            </CardTitle>
            <div className="bg-white/20 rounded-lg p-3 mt-3">
              <p className="text-purple-100 font-medium">{eventoInfo.nomeEvento}</p>
              <p className="text-purple-200 text-sm">{formatarData(eventoInfo.dataEvento)} • {eventoInfo.localEvento}</p>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmitConvite} className="space-y-8">
              {/* Dados do comprador */}
              <Card className="border-2 border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-blue-800">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"><User className="h-5 w-5 text-white" /></div>
                      Dados do Comprador
                    <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm font-medium text-gray-700"> Nome *</Label>
                      <Input id="nome" name="nome" type="text" placeholder="Seu nome" value={form.nome} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.nome ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
                      {errors.nome && (<p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{errors.nome} </p>)}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sobrenome" className="text-sm font-medium text-gray-700">Sobrenome *</Label>
                      <Input id="sobrenome" name="sobrenome" type="text" placeholder="Seu sobrenome" value={form.sobrenome} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.sobrenome ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
                      {errors.sobrenome && (<p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{errors.sobrenome}</p>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input id="email" name="email" type="email" placeholder="seu@email.com" value={form.email} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.email ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
                      {errors.email && (<p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{errors.email}</p>)}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-sm font-medium text-gray-700">CPF * </Label>
                      <Input id="cpf" name="cpf" type="text"  placeholder="Somente números" maxLength={11} value={form.cpf} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.cpf ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}`} />
                      {errors.cpf && (<p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{errors.cpf}</p> )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do convidado */}
              <Card className="border-2 border-green-200 bg-green-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-green-800">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"> <UserPlus className="h-5 w-5 text-white" /></div>
                      Dados do Convidado
                    <Badge variant="secondary" className="text-xs"> Opcional</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="convidadoNome" className="text-sm font-medium text-gray-700">Nome </Label>
                      <Input id="convidadoNome" name="convidadoNome"  type="text"  placeholder="Nome do convidado"  value={form.convidadoNome}  onChange={handleChangeConvite}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="convidadoSobrenome" className="text-sm font-medium text-gray-700">Sobrenome</Label>
                      <Input id="convidadoSobrenome" name="convidadoSobrenome"type="text" placeholder="Sobrenome do convidado" value={form.convidadoSobrenome} onChange={handleChangeConvite}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="convidadoEmail" className="text-sm font-medium text-gray-700"> Email </Label>
                      <Input id="convidadoEmail" name="convidadoEmail" type="email" placeholder="email@convidado.com" value={form.convidadoEmail} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.convidadoEmail ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`}/>
                      {errors.convidadoEmail && (<p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"> <AlertCircle className="h-3 w-3" /> {errors.convidadoEmail}</p>)}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="convidadoCPF" className="text-sm font-medium text-gray-700">CPF </Label>
                      <Input id="convidadoCPF" name="convidadoCPF" type="text" placeholder="CPF do convidado" maxLength={11} value={form.convidadoCPF} onChange={handleChangeConvite}
                        className={`h-12 border-2 transition-colors ${errors.convidadoCPF ? "border-red-500 focus:border-red-500" : "border-gray-200 focus:border-green-500"}`} />
                      {errors.convidadoCPF && ( <p className="text-sm text-red-600 flex items-center gap-1 animate-pulse"><AlertCircle className="h-3 w-3" />{errors.convidadoCPF}</p> )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Dados do Evento */}
              <Card className="border-2 border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-purple-800">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center"> <Ticket className="h-5 w-5 text-white" /></div>
                      Dados do Evento
                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-700"> Fixo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="idEvento" className="text-sm font-medium text-gray-700"> ID do Evento * </Label>
                      <Input id="idEvento" name="idEvento" type="text" placeholder="ID único do evento" value={eventoInfo.idEvento} readOnly
                        className="h-12 border-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nomeEvento" className="text-sm font-medium text-gray-700">Nome do Evento * </Label>
                      <Input id="nomeEvento"name="nomeEvento" type="text" placeholder="Nome do evento"  value={eventoInfo.nomeEvento} readOnly
                        className="h-12 border-2 bg-gray-100 text-gray-600 cursor-not-allowed"/>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dataEvento" className="text-sm font-medium text-gray-700"> Data do Evento *</Label>
                      <Input id="dataEvento" name="dataEvento" type="date" placeholder="Data do evento" value={eventoInfo.dataEvento} readOnly
                        className="h-12 border-2 bg-gray-100 text-gray-600 cursor-not-allowed"/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="localEvento" className="text-sm font-medium text-gray-700">Local do Evento * </Label>
                      <Input id="localEvento" name="localEvento" type="text" placeholder="Local do evento" value={eventoInfo.localEvento} readOnly
                        className="h-12 border-2 bg-gray-100 text-gray-600 cursor-not-allowed" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imagemEvento" className="text-sm font-medium text-gray-700 flex items-center gap-2"> <Camera className="h-4 w-4" /> Imagem do Evento</Label>
                    <Input id="imagemEvento" type="file" accept="image/*" onChange={handleImagemChange}
                      className="h-12 border-2 border-gray-200 focus:border-purple-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
                    {eventoInfo.imagemURL && (
                      <div className="mt-4 p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
                        <img src={eventoInfo.imagemURL || "/placeholder.svg"} alt="Preview Imagem" className="rounded-lg max-h-48 object-contain mx-auto shadow-md" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Erro submit */}
              {errors.submit && (<div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500"><div className="flex items-center"><AlertCircle className="h-5 w-5 text-red-500 mr-2" /> <p className="text-red-700">{errors.submit}</p></div>
                </div>)}
              {/* Botão enviar */}
              <div className="flex justify-center pt-6">
                <Button type="submit"disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 h-auto text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50" >
                  {loading ? (<> <Loader2 className="animate-spin mr-3 h-6 w-6" /> Reservando... </>) : ( <><Ticket className="mr-3 h-6 w-6" /> Reservar Convite </> )}
                </Button>
              </div>
            </form>
            {/* Resultado sucesso */}
            {success && (
              <div className="mt-8 text-center animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6"><CheckCircle2 className="h-8 w-8 text-white" /> </div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Convite Reservado com Sucesso!</h3>
                  <p className="text-green-600 mb-6">Seu convite foi gerado e está pronto para uso</p>
                  {qrCodeValue && (
                    <>
                      <div className="inline-block p-6 bg-white rounded-2xl shadow-lg border-2 border-green-200 mb-6">
                        <QRCodeReact id="qr-code-svg" value={qrCodeValue} size={180} />
                        <p className="text-sm text-gray-600 mt-3 font-mono">ID: {qrCodeValue}</p>
                      </div>

                      <div className="flex flex-wrap justify-center gap-4">
                        <Button onClick={copyQRCodeId} variant="outline"
                          className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors bg-transparent">
                          <Copy className="inline-block mr-2 h-4 w-4" /> Copiar ID
                        </Button>
                        <Button onClick={downloadQRCode}variant="outline"
                          className="border-2 border-green-300 text-green-700 hover:bg-green-50 transition-colors bg-transparent">
                          <QrCode className="inline-block mr-2 h-4 w-4" />Baixar QR Code
                        </Button>
                       <Button onClick={gerarPDFComprador} className="..."><Download className="inline-block mr-2 h-4 w-4" />Baixar PDF do Comprador</Button>
                      <Button onClick={gerarPDFConvidado} className="..."><Download className="inline-block mr-2 h-4 w-4" />Baixar PDF do Convidado</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        {/* Lista de convites */}
        {Object.keys(convitesEvento).length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2"><Users className="h-5 w-5" /> Convites Criados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(convitesEvento).map(([id, convite]) => (
                <Card key={id} className="p-4 border border-gray-200 bg-white shadow-sm">
                  <p className="text-sm text-gray-600">ID: <span className="font-mono">{id}</span></p>
                  <p className="text-md font-semibold text-gray-800 mt-2">{convite.comprador?.nome} {convite.comprador?.sobrenome}</p>
                  <p className="text-sm text-gray-500">{convite.comprador?.email}</p>
                  {convite.convidado?.nome && (<p className="text-sm text-gray-700 mt-1">+ Convidado: {convite.convidado.nome}</p>)}
                  <p className="text-xs text-gray-400 mt-2">Status: {convite.status}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => excluirConvite(id)}>Excluir</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}