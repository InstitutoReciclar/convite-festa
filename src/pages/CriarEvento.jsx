// "use client"

// import { useState } from "react"
// import { ref, push } from "firebase/database"
// import { dbRealtime } from "../../firebase"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Calendar, PartyPopper, Save } from "lucide-react"

// export default function CadastroEvento() {
//   const [evento, setEvento] = useState({
//     nomeEvento: "",
//     tipoEvento: "festa",
//     data: "",
//     horaInicio: "",
//     horaFim: "",
//     local: "",
//     endereco: "",
//     numero: "",
//     cep: "",
//     responsavel: "",
//     telefone: "",
//     email: "",
//     capacidade: "",
//     descricao: "",
//   })
//   const [salvando, setSalvando] = useState(false)
//   const [mensagem, setMensagem] = useState("")

//   const tiposEvento = [
//     { value: "festa", label: "Festa 🎉" },
//     { value: "casamento", label: "Casamento 💒" },
//     { value: "aniversario", label: "Aniversário 🎂" },
//     { value: "corporativo", label: "Corporativo 🏢" },
//     { value: "formatura", label: "Formatura 🎓" },
//     { value: "infantil", label: "Infantil 🎈" },
//     { value: "outro", label: "Outro 🎵" },
//   ]

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setEvento((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSalvando(true)
//     setMensagem("")

//     try {
//       const eventosRef = ref(dbRealtime, "eventos")
//       await push(eventosRef, {
//         ...evento,
//         criadoEm: Date.now(),
//       })
//       setMensagem("✅ Evento cadastrado com sucesso!")
//       setEvento({
//         nomeEvento: "",
//         tipoEvento: "festa",
//         data: "",
//         horaInicio: "",
//         horaFim: "",
//         local: "",
//         endereco: "",
//         numero: "",
//         cep: "",
//         responsavel: "",
//         telefone: "",
//         email: "",
//         capacidade: "",
//         descricao: "",
//       })
//     } catch (error) {
//       console.error("Erro ao salvar evento:", error)
//       setMensagem("❌ Erro ao salvar evento.")
//     } finally {
//       setSalvando(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
//       <div className="max-w-3xl mx-auto">
//         <Card className="border-0 shadow-lg">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//               <PartyPopper className="h-6 w-6" />
//               Cadastro de Evento
//             </CardTitle>
//             <p className="text-gray-500">Preencha os dados abaixo para criar um novo evento</p>
//           </CardHeader>
//           <CardContent>
//             <form className="space-y-4" onSubmit={handleSubmit}>
//               {/* Dados principais */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label>Nome do Evento</Label>
//                   <Input name="nomeEvento" value={evento.nomeEvento} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Tipo</Label>
//                   <select
//                     name="tipoEvento"
//                     value={evento.tipoEvento}
//                     onChange={handleChange}
//                     className="w-full border rounded-md px-3 py-2 text-sm"
//                   >
//                     {tiposEvento.map((tipo) => (
//                       <option key={tipo.value} value={tipo.value}>
//                         {tipo.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>

//               {/* Datas e horários */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label>Data</Label>
//                   <Input type="date" name="data" value={evento.data} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Hora Início</Label>
//                   <Input type="time" name="horaInicio" value={evento.horaInicio} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Hora Fim</Label>
//                   <Input type="time" name="horaFim" value={evento.horaFim} onChange={handleChange} required />
//                 </div>
//               </div>

//               {/* Localização */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label>Local</Label>
//                   <Input name="local" value={evento.local} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Endereço</Label>
//                   <Input name="endereco" value={evento.endereco} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Número</Label>
//                   <Input name="numero" value={evento.numero} onChange={handleChange} required />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <Label>CEP</Label>
//                   <Input name="cep" value={evento.cep} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Capacidade</Label>
//                   <Input name="capacidade" type="number" value={evento.capacidade} onChange={handleChange} />
//                 </div>
//               </div>

//               {/* Responsável */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <Label>Responsável</Label>
//                   <Input name="responsavel" value={evento.responsavel} onChange={handleChange} required />
//                 </div>
//                 <div>
//                   <Label>Telefone</Label>
//                   <Input name="telefone" value={evento.telefone} onChange={handleChange} />
//                 </div>
//                 <div>
//                   <Label>Email</Label>
//                   <Input name="email" type="email" value={evento.email} onChange={handleChange} />
//                 </div>
//               </div>

//               {/* Descrição */}
//               <div>
//                 <Label>Descrição</Label>
//                 <Textarea name="descricao" value={evento.descricao} onChange={handleChange} rows={3} />
//               </div>

//               {/* Botão */}
//               <div className="pt-4 flex justify-end">
//                 <Button type="submit" disabled={salvando} className="bg-purple-600 hover:bg-purple-700">
//                   <Save className="h-4 w-4 mr-2" />
//                   {salvando ? "Salvando..." : "Salvar Evento"}
//                 </Button>
//               </div>

//               {/* Mensagem */}
//               {mensagem && (
//                 <p className={`text-sm ${mensagem.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
//                   {mensagem}
//                 </p>
//               )}
//             </form>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect, useRef } from "react"
import { ref, push, set, onValue } from "firebase/database"
import { dbRealtime } from "../../firebase"
import QRCodeReact from "react-qr-code"
import QRCode from "qrcode"
import { jsPDF } from "jspdf"

import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Calendar, PartyPopper, Save,
  Ticket, User, UserPlus, Download, Copy, RotateCcw,
  AlertCircle, Loader2,
} from "lucide-react"

export default function EventoEConvite() {
  // Estado cadastro evento
  const [evento, setEvento] = useState({
    nomeEvento: "",
    tipoEvento: "festa",
    data: "",
    horaInicio: "",
    horaFim: "",
    local: "",
    endereco: "",
    numero: "",
    cep: "",
    responsavel: "",
    telefone: "",
    email: "",
    capacidade: "",
    descricao: "",
  })
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState("")

  // Lista de eventos carregada do Firebase
  const [eventosLista, setEventosLista] = useState({})
  const [eventoSelecionado, setEventoSelecionado] = useState(null)

  // Formulario convite
  const [form, setForm] = useState({
    nome: "", sobrenome: "", email: "", cpf: "",
    convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
  })
  const [eventoInfo, setEventoInfo] = useState({
    idEvento: "",
    nomeEvento: "",
    dataEvento: "",
    localEvento: "",
    imagem: null,
    imagemURL: "",
  })
  const [qrCodeValue, setQrCodeValue] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const conviteRef = useRef(null)

  // Tipos de evento para select cadastro
  const tiposEvento = [
    { value: "festa", label: "Festa 🎉" },
    { value: "casamento", label: "Casamento 💒" },
    { value: "aniversario", label: "Aniversário 🎂" },
    { value: "corporativo", label: "Corporativo 🏢" },
    { value: "formatura", label: "Formatura 🎓" },
    { value: "infantil", label: "Infantil 🎈" },
    { value: "outro", label: "Outro 🎵" },
  ]

  // Funções cadastro evento
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
      await push(eventosRef, {
        ...evento,
        criadoEm: Date.now(),
      })
      setMensagem("✅ Evento cadastrado com sucesso!")
      setEvento({
        nomeEvento: "",
        tipoEvento: "festa",
        data: "",
        horaInicio: "",
        horaFim: "",
        local: "",
        endereco: "",
        numero: "",
        cep: "",
        responsavel: "",
        telefone: "",
        email: "",
        capacidade: "",
        descricao: "",
      })
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      setMensagem("❌ Erro ao salvar evento.")
    } finally {
      setSalvando(false)
    }
  }

  // Carregar eventos do Firebase em tempo real
  useEffect(() => {
    const eventosRef = ref(dbRealtime, "eventos")
    return onValue(eventosRef, (snapshot) => {
      const data = snapshot.val() || {}
      setEventosLista(data)
    })
  }, [])

  // Selecionar evento para abrir formulário convite
  function selecionarEventoParaConvite(id, eventoDados) {
    setEventoSelecionado({ id, ...eventoDados })

    setEventoInfo({
      idEvento: id,
      nomeEvento: eventoDados.nomeEvento || "",
      dataEvento: eventoDados.data || eventoDados.dataEvento || "",
      localEvento: eventoDados.local || eventoDados.localEvento || "",
      imagem: null,
      imagemURL: "",
    })

    setForm({
      nome: "", sobrenome: "", email: "", cpf: "",
      convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
    })
    setQrCodeValue(null)
    setErrors({})
    setSuccess(false)
    setLoading(false)
  }

  // Form convite handlers (igual ao código que te passei antes)
  function handleChangeConvite(e) {
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
    if (!validateForm()) { setLoading(false); return }

    try {
      const conviteRefDb = ref(dbRealtime, `convites/${eventoInfo.idEvento}`)
      const newConviteRef = push(conviteRefDb)
      const conviteId = newConviteRef.key

      const conviteData = {
        comprador: { ...form },
        convidado: {
          nome: form.convidadoNome || null,
          sobrenome: form.convidadoSobrenome || null,
          email: form.convidadoEmail || null,
          cpf: form.convidadoCPF || null,
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
    setForm({
      nome: "", sobrenome: "", email: "", cpf: "",
      convidadoNome: "", convidadoSobrenome: "", convidadoEmail: "", convidadoCPF: "",
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
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ]
    const data = new Date(dataStr)
    if (isNaN(data)) return dataStr
    const dia = data.getDate()
    const mes = meses[data.getMonth()]
    const ano = data.getFullYear()
    return `${dia.toString().padStart(2, "0")} de ${mes} de ${ano}`
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

  async function gerarPDF() {
    if (!qrCodeValue) return alert("Convite não gerado ainda!")

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    doc.setFillColor("#003885")
    doc.rect(0, 0, 210, 297, "F")

    if (eventoInfo.imagemURL) {
      const imgData = await getImageDataUrl(eventoInfo.imagemURL)
      if (imgData) {
        doc.addImage(imgData, "JPEG", 15, 15, 180, 90)
      }
    }

    const qrComprador = await QRCode.toDataURL(`comprador-${qrCodeValue}`, { width: 150 })
    let qrConvidado = null
    const temConvidado = !!form.convidadoNome?.trim()
    if (temConvidado) {
      qrConvidado = await QRCode.toDataURL(`convidado-${qrCodeValue}`, { width: 150 })
    }

    function drawQrCode(x, y, size, img) {
      doc.setDrawColor(255, 255, 255)
      doc.setLineWidth(1)
      doc.rect(x, y, size, size)
      doc.addImage(img, "PNG", x + 2, y + 2, size - 4, size - 4)
    }

    const leftX = 25
    const rightX = 130
    const qrSize = 40
    const startY = 110

    drawQrCode(leftX, startY, qrSize, qrComprador)

    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.text("Comprador:", leftX, startY + qrSize + 10)

    doc.setFontSize(14)
    doc.text(form.nome, leftX, startY + qrSize + 18)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.text(`CPF: ${form.cpf}`, leftX, startY + qrSize + 26)
    doc.text(`Código: ${qrCodeValue}`, leftX, startY + qrSize + 34)

    doc.setFontSize(12)
    doc.setTextColor(temConvidado ? "#FF99CC" : "#CCCCCC")
    doc.text(temConvidado ? "Com convidado" : "Sem convidado", leftX, startY + qrSize + 42)

    if (temConvidado && qrConvidado) {
      drawQrCode(rightX, startY, qrSize, qrConvidado)

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("Convidado:", rightX, startY + qrSize + 10)

      doc.setFontSize(14)
      doc.text(form.convidadoNome, rightX, startY + qrSize + 18)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.text(`CPF: ${form.convidadoCPF || "N/A"}`, rightX, startY + qrSize + 26)
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor("#FFCCFF")
    doc.text(formatarData(eventoInfo.dataEvento), 105, 220, { align: "center" })

    doc.setFontSize(14)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(255, 255, 255)
    doc.text("às 19h", 105, 235, { align: "center" })

    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor("#FF99CC")
    doc.text(`Local: ${eventoInfo.localEvento || "A definir"}`, 105, 255, { align: "center" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(255, 255, 255)
    doc.text("Av. Alcides Sangirardi, S/N - Cidade Jardim, São Paulo/SP", 105, 270, { align: "center" })

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.5)
    doc.line(15, 285, 195, 285)

    doc.setFont("helvetica", "italic")
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.text("Agradecemos sua presença! Esperamos você no evento.", 105, 292, { align: "center" })

    doc.save(`Convite - ${form.nome} ${form.sobrenome}.pdf`)
  }

  // UI de lista de eventos
  if (!eventoSelecionado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Cadastro Evento */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <PartyPopper className="h-6 w-6" />
                Cadastro de Evento
              </CardTitle>
              <p className="text-gray-500">Preencha os dados abaixo para criar um novo evento</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmitEvento}>
                {/* Dados principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Evento</Label>
                    <Input name="nomeEvento" value={evento.nomeEvento} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Tipo</Label>
                    <select
                      name="tipoEvento"
                      value={evento.tipoEvento}
                      onChange={handleChangeEvento}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {tiposEvento.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Datas e horários */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input type="date" name="data" value={evento.data} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Hora Início</Label>
                    <Input type="time" name="horaInicio" value={evento.horaInicio} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Hora Fim</Label>
                    <Input type="time" name="horaFim" value={evento.horaFim} onChange={handleChangeEvento} required />
                  </div>
                </div>

                {/* Localização */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Local</Label>
                    <Input name="local" value={evento.local} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input name="endereco" value={evento.endereco} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input name="numero" value={evento.numero} onChange={handleChangeEvento} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>CEP</Label>
                    <Input name="cep" value={evento.cep} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Capacidade</Label>
                    <Input name="capacidade" type="number" value={evento.capacidade} onChange={handleChangeEvento} />
                  </div>
                </div>

                {/* Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Responsável</Label>
                    <Input name="responsavel" value={evento.responsavel} onChange={handleChangeEvento} required />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input name="telefone" value={evento.telefone} onChange={handleChangeEvento} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input name="email" type="email" value={evento.email} onChange={handleChangeEvento} />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label>Descrição</Label>
                  <Textarea name="descricao" value={evento.descricao} onChange={handleChangeEvento} rows={3} />
                </div>

                {/* Botão */}
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={salvando} className="bg-purple-600 hover:bg-purple-700">
                    <Save className="h-4 w-4 mr-2" />
                    {salvando ? "Salvando..." : "Salvar Evento"}
                  </Button>
                </div>

                {/* Mensagem */}
                {mensagem && (
                  <p className={`text-sm ${mensagem.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
                    {mensagem}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Eventos Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(eventosLista).length === 0 && (
                <p className="text-gray-600">Nenhum evento cadastrado ainda.</p>
              )}
              <ul className="space-y-2">
                {Object.entries(eventosLista).map(([id, ev]) => (
                  <li
                    key={id}
                    className="cursor-pointer p-3 border rounded-md hover:bg-purple-100 flex justify-between items-center"
                    onClick={() => selecionarEventoParaConvite(id, ev)}
                  >
                    <div>
                      <p className="font-semibold">{ev.nomeEvento}</p>
                      <p className="text-sm text-gray-600">{formatarData(ev.data)}</p>
                    </div>
                    <Button variant="outline" size="sm">Selecionar</Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // UI formulário convite
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => setEventoSelecionado(null)} className="mb-4">
          <RotateCcw className="inline-block mr-2" />
          Voltar para Eventos
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Reservar Convite para {eventoInfo.nomeEvento}
            </CardTitle>
            <p className="text-gray-500">Preencha os dados para reservar um convite</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConvite} className="space-y-6">
              {/* Dados do comprador */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-blue-600" />
                    Dados do Comprador
                    <span className="text-xs text-gray-500">(obrigatório)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        name="nome"
                        type="text"
                        placeholder="Nome"
                        value={form.nome}
                        onChange={handleChangeConvite}
                        className={errors.nome ? "border-red-500" : ""}
                      />
                      {errors.nome && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.nome}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="sobrenome">Sobrenome *</Label>
                      <Input
                        id="sobrenome"
                        name="sobrenome"
                        type="text"
                        placeholder="Sobrenome"
                        value={form.sobrenome}
                        onChange={handleChangeConvite}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@exemplo.com"
                        value={form.email}
                        onChange={handleChangeConvite}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        type="text"
                        placeholder="Somente números"
                        maxLength={11}
                        value={form.cpf}
                        onChange={handleChangeConvite}
                        className={errors.cpf ? "border-red-500" : ""}
                      />
                      {errors.cpf && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.cpf}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do convidado */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Dados do Convidado
                    <span className="text-xs text-gray-500">(opcional)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="convidadoNome">Nome</Label>
                      <Input
                        id="convidadoNome"
                        name="convidadoNome"
                        type="text"
                        placeholder="Nome do convidado"
                        value={form.convidadoNome}
                        onChange={handleChangeConvite}
                      />
                    </div>
                    <div>
                      <Label htmlFor="convidadoSobrenome">Sobrenome</Label>
                      <Input
                        id="convidadoSobrenome"
                        name="convidadoSobrenome"
                        type="text"
                        placeholder="Sobrenome do convidado"
                        value={form.convidadoSobrenome}
                        onChange={handleChangeConvite}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="convidadoEmail">Email</Label>
                      <Input
                        id="convidadoEmail"
                        name="convidadoEmail"
                        type="email"
                        placeholder="Email do convidado"
                        value={form.convidadoEmail}
                        onChange={handleChangeConvite}
                        className={errors.convidadoEmail ? "border-red-500" : ""}
                      />
                      {errors.convidadoEmail && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.convidadoEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="convidadoCPF">CPF</Label>
                      <Input
                        id="convidadoCPF"
                        name="convidadoCPF"
                        type="text"
                        placeholder="CPF do convidado"
                        maxLength={11}
                        value={form.convidadoCPF}
                        onChange={handleChangeConvite}
                        className={errors.convidadoCPF ? "border-red-500" : ""}
                      />
                      {errors.convidadoCPF && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.convidadoCPF}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dados do Evento */}
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Ticket className="h-5 w-5 text-blue-600" />
                    Dados do Evento
                    <span className="text-xs text-red-600">(fixo para o convite)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="idEvento">ID do Evento *</Label>
                    <Input
                      id="idEvento"
                      name="idEvento"
                      type="text"
                      placeholder="ID único do evento"
                      value={eventoInfo.idEvento}
                      readOnly
                      className={errors.idEvento ? "border-red-500 bg-gray-100" : "bg-gray-100"}
                    />
                    {errors.idEvento && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.idEvento}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="nomeEvento">Nome do Evento *</Label>
                    <Input
                      id="nomeEvento"
                      name="nomeEvento"
                      type="text"
                      placeholder="Nome do evento"
                      value={eventoInfo.nomeEvento}
                      readOnly
                      className={errors.nomeEvento ? "border-red-500 bg-gray-100" : "bg-gray-100"}
                    />
                    {errors.nomeEvento && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.nomeEvento}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dataEvento">Data do Evento *</Label>
                    <Input
                      id="dataEvento"
                      name="dataEvento"
                      type="date"
                      placeholder="Data do evento"
                      value={eventoInfo.dataEvento}
                      readOnly
                      className={errors.dataEvento ? "border-red-500 bg-gray-100" : "bg-gray-100"}
                    />
                    {errors.dataEvento && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dataEvento}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="localEvento">Local do Evento *</Label>
                    <Input
                      id="localEvento"
                      name="localEvento"
                      type="text"
                      placeholder="Local do evento"
                      value={eventoInfo.localEvento}
                      readOnly
                      className={errors.localEvento ? "border-red-500 bg-gray-100" : "bg-gray-100"}
                    />
                    {errors.localEvento && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.localEvento}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="imagemEvento">Imagem do Evento</Label>
                    <input
                      id="imagemEvento"
                      type="file"
                      accept="image/*"
                      onChange={handleImagemChange}
                      disabled
                      className="cursor-not-allowed bg-gray-100"
                    />
                    {eventoInfo.imagemURL && (
                      <img
                        src={eventoInfo.imagemURL}
                        alt="Preview Imagem"
                        className="mt-2 rounded max-h-48 object-contain"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Erro submit */}
              {errors.submit && (
                <p className="text-red-600 text-center">{errors.submit}</p>
              )}

              {/* Botão enviar */}
              <div className="flex justify-center">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  ) : (
                    <Ticket className="mr-2 h-5 w-5" />
                  )}
                  {loading ? "Reservando..." : "Reservar Convite"}
                </Button>
              </div>
            </form>

            {/* Resultado sucesso */}
            {success && (
              <div className="mt-6 text-center">
                <h3 className="text-xl font-semibold mb-4">Convite Reservado com Sucesso!</h3>
                {qrCodeValue && (
                  <>
                    <div className="inline-block p-4 bg-white rounded-md shadow-lg">
                      <QRCodeReact id="qr-code-svg" value={qrCodeValue} size={150} />
                    </div>
                    <div className="mt-4 flex justify-center gap-4">
                      <Button onClick={copyQRCodeId} variant="outline" size="sm">
                        <Copy className="inline-block mr-1" />
                        Copiar ID
                      </Button>
                      <Button onClick={downloadQRCode} variant="outline" size="sm">
                        <Download className="inline-block mr-1" />
                        Baixar QR Code
                      </Button>
                      <Button onClick={gerarPDF} variant="outline" size="sm" className="text-purple-700">
                        <Save className="inline-block mr-1" />
                        Baixar Convite (PDF)
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
