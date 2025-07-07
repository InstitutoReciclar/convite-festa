"use client"

import { useState } from "react"
import { ref, push } from "firebase/database"
import { dbRealtime } from "../../firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar, PartyPopper, Save } from "lucide-react"

export default function CadastroEvento() {
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

  const tiposEvento = [
    { value: "festa", label: "Festa 🎉" },
    { value: "casamento", label: "Casamento 💒" },
    { value: "aniversario", label: "Aniversário 🎂" },
    { value: "corporativo", label: "Corporativo 🏢" },
    { value: "formatura", label: "Formatura 🎓" },
    { value: "infantil", label: "Infantil 🎈" },
    { value: "outro", label: "Outro 🎵" },
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setEvento((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <PartyPopper className="h-6 w-6" />
              Cadastro de Evento
            </CardTitle>
            <p className="text-gray-500">Preencha os dados abaixo para criar um novo evento</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Dados principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome do Evento</Label>
                  <Input name="nomeEvento" value={evento.nomeEvento} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <select
                    name="tipoEvento"
                    value={evento.tipoEvento}
                    onChange={handleChange}
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
                  <Input type="date" name="data" value={evento.data} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Hora Início</Label>
                  <Input type="time" name="horaInicio" value={evento.horaInicio} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Hora Fim</Label>
                  <Input type="time" name="horaFim" value={evento.horaFim} onChange={handleChange} required />
                </div>
              </div>

              {/* Localização */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Local</Label>
                  <Input name="local" value={evento.local} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Endereço</Label>
                  <Input name="endereco" value={evento.endereco} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Número</Label>
                  <Input name="numero" value={evento.numero} onChange={handleChange} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CEP</Label>
                  <Input name="cep" value={evento.cep} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Capacidade</Label>
                  <Input name="capacidade" type="number" value={evento.capacidade} onChange={handleChange} />
                </div>
              </div>

              {/* Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Responsável</Label>
                  <Input name="responsavel" value={evento.responsavel} onChange={handleChange} required />
                </div>
                <div>
                  <Label>Telefone</Label>
                  <Input name="telefone" value={evento.telefone} onChange={handleChange} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input name="email" type="email" value={evento.email} onChange={handleChange} />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <Label>Descrição</Label>
                <Textarea name="descricao" value={evento.descricao} onChange={handleChange} rows={3} />
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
      </div>
    </div>
  )
}
