"use client"

import { useState, useEffect } from "react"
import { dbRealtime } from "../../firebase"
import { ref, onValue, remove } from "firebase/database"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  PartyPopper,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Music,
  Sparkles,
  Download,
  Plus,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import ReservaConvite from "./reserva" // ajuste o caminho conforme seu projeto

export default function VisualizarEventos() {
  const router = useNavigate()

  const [eventos, setEventos] = useState([])
  const [filteredEventos, setFilteredEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("todos")
  const [filterDate, setFilterDate] = useState("todos")
  const [sortBy, setSortBy] = useState("data")
  const [sortOrder, setSortOrder] = useState("asc")
  const [selectedEvento, setSelectedEvento] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [mostrarGeradorConvite, setMostrarGeradorConvite] = useState(false)

  const tiposEvento = [
    { value: "festa", label: "Festa", icon: "🎉", color: "bg-pink-100 text-pink-800 border-pink-200" },
    { value: "casamento", label: "Casamento", icon: "💒", color: "bg-rose-100 text-rose-800 border-rose-200" },
    { value: "aniversario", label: "Aniversário", icon: "🎂", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "corporativo", label: "Corporativo", icon: "🏢", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "formatura", label: "Formatura", icon: "🎓", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { value: "infantil", label: "Infantil", icon: "🎈", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "outro", label: "Outro", icon: "🎵", color: "bg-gray-100 text-gray-800 border-gray-200" },
  ]

  // Leitura do Firebase
  useEffect(() => {
    const eventosRef = ref(dbRealtime, "eventos")

    const listener = onValue(
      eventosRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const lista = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }))
          setEventos(lista)
          setFilteredEventos(lista)
        } else {
          setEventos([])
          setFilteredEventos([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Erro ao buscar eventos:", error)
        setLoading(false)
      },
    )

    return () => listener()
  }, [])

  // Filtragem e ordenação
  useEffect(() => {
    function filterEventos(lista) {
      return lista.filter((evento) => {
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          if (
            !(
              evento.nomeEvento?.toLowerCase().includes(searchLower) ||
              evento.responsavel?.toLowerCase().includes(searchLower) ||
              evento.local?.toLowerCase().includes(searchLower) ||
              evento.endereco?.toLowerCase().includes(searchLower)
            )
          ) {
            return false
          }
        }

        if (filterType !== "todos" && evento.tipoEvento !== filterType) {
          return false
        }

        if (filterDate !== "todos") {
          const hoje = new Date()
          const amanha = new Date(hoje)
          amanha.setDate(hoje.getDate() + 1)
          const proximaSemana = new Date(hoje)
          proximaSemana.setDate(hoje.getDate() + 7)
          const proximoMes = new Date(hoje)
          proximoMes.setMonth(hoje.getMonth() + 1)

          const dataEvento = new Date(evento.data)
          switch (filterDate) {
            case "hoje":
              if (dataEvento.toDateString() !== hoje.toDateString()) return false
              break
            case "amanha":
              if (dataEvento.toDateString() !== amanha.toDateString()) return false
              break
            case "semana":
              if (!(dataEvento >= hoje && dataEvento <= proximaSemana)) return false
              break
            case "mes":
              if (!(dataEvento >= hoje && dataEvento <= proximoMes)) return false
              break
            case "passados":
              if (dataEvento >= hoje) return false
              break
          }
        }

        return true
      })
    }

    function sortEventos(lista) {
      return lista.sort((a, b) => {
        let aValue, bValue

        switch (sortBy) {
          case "data":
            aValue = new Date(a.data + "T" + (a.horaInicio || "00:00"))
            bValue = new Date(b.data + "T" + (b.horaInicio || "00:00"))
            break
          case "nome":
            aValue = a.nomeEvento?.toLowerCase() || ""
            bValue = b.nomeEvento?.toLowerCase() || ""
            break
          case "tipo":
            aValue = a.tipoEvento || ""
            bValue = b.tipoEvento || ""
            break
          case "criacao":
            aValue = new Date(a.criadoEm || 0)
            bValue = new Date(b.criadoEm || 0)
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
        return 0
      })
    }

    const filtrados = filterEventos(eventos)
    const ordenados = sortEventos(filtrados)
    setFilteredEventos([...ordenados])
  }, [eventos, searchTerm, filterType, filterDate, sortBy, sortOrder])

  // Deletar evento
  async function handleDelete(eventoId) {
    try {
      await remove(ref(dbRealtime, `eventos/${eventoId}`))
      setShowDeleteConfirm(null)
      if (selectedEvento?.id === eventoId) setSelectedEvento(null)
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
    }
  }

  // Utils de formatação
  function formatDate(dateString) {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  function formatTime(timeString) {
    if (!timeString) return ""
    return timeString.substring(0, 5)
  }

  function getEventStatus(evento) {
    const hoje = new Date()
    const dataEvento = new Date(evento.data + "T" + (evento.horaFim || "23:59"))
    const dataInicio = new Date(evento.data + "T" + (evento.horaInicio || "00:00"))

    if (dataEvento < hoje) {
      return { status: "finalizado", color: "bg-gray-100 text-gray-800 border-gray-200", label: "Finalizado" }
    } else if (dataInicio <= hoje && dataEvento >= hoje) {
      return { status: "andamento", color: "bg-green-100 text-green-800 border-green-200", label: "Em Andamento" }
    } else {
      return { status: "agendado", color: "bg-blue-100 text-blue-800 border-blue-200", label: "Agendado" }
    }
  }

  function getEventStats() {
    const total = eventos.length
    const hoje = new Date()
    const agendados = eventos.filter((e) => new Date(e.data) >= hoje).length
    const finalizados = eventos.filter((e) => new Date(e.data) < hoje).length
    const esteMes = eventos.filter((e) => {
      const dataEvento = new Date(e.data)
      return dataEvento.getMonth() === hoje.getMonth() && dataEvento.getFullYear() === hoje.getFullYear()
    }).length

    return { total, agendados, finalizados, esteMes }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Carregando eventos...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = getEventStats()

  if (selectedEvento) {
    const tipoSelecionado = tiposEvento.find((t) => t.value === selectedEvento.tipoEvento)
    const statusEvento = getEventStatus(selectedEvento)

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setSelectedEvento(null)}>
                    ← Voltar
                  </Button>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">Detalhes do Evento</CardTitle>
                    <p className="text-gray-600">Informações completas</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/editarEvento/${selectedEvento.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Informações do Evento */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 space-y-6">
              {/* Header do Evento */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  {tipoSelecionado && <span className="text-4xl">{tipoSelecionado.icon}</span>}
                  <h1 className="text-4xl font-bold text-gray-800">{selectedEvento.nomeEvento}</h1>
                </div>

                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {tipoSelecionado && (
                    <Badge className={tipoSelecionado.color + " border"}>{tipoSelecionado.label}</Badge>
                  )}
                  <Badge className={statusEvento.color + " border"}>{statusEvento.label}</Badge>
                </div>

                {selectedEvento.descricao && (
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">{selectedEvento.descricao}</p>
                )}
              </div>

              <Separator />

              {/* Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Data e Horário</h3>
                      <p className="text-gray-600 text-lg">
                        {new Date(selectedEvento.data).toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-gray-600">
                        {formatTime(selectedEvento.horaInicio)} às {formatTime(selectedEvento.horaFim)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <User className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Responsável</h3>
                      <p className="text-gray-600 text-lg">{selectedEvento.responsavel}</p>
                      {selectedEvento.telefone && <p className="text-gray-500">{selectedEvento.telefone}</p>}
                      {selectedEvento.email && <p className="text-gray-500">{selectedEvento.email}</p>}
                    </div>
                  </div>

                  {selectedEvento.capacidade && (
                    <div className="flex items-start gap-4">
                      <Users className="h-6 w-6 text-green-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">Capacidade</h3>
                        <p className="text-gray-600 text-lg">{selectedEvento.capacidade} pessoas</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-red-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Localização</h3>
                      <div className="text-gray-600 space-y-1">
                        <p className="text-lg">
                          {selectedEvento.endereco}, {selectedEvento.numero}
                        </p>
                        <p>{selectedEvento.local}</p>
                        <p>CEP: {selectedEvento.cep}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">Criado em</h3>
                      <p className="text-gray-600">
                        {new Date(selectedEvento.criadoEm).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <Separator />
              <div className="flex justify-center gap-4">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <Users className="h-4 w-4 mr-2" />
                  Gerenciar Convidados
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMostrarGeradorConvite(!mostrarGeradorConvite)}
                >
                  <PartyPopper className="h-4 w-4 mr-2" />
                  {mostrarGeradorConvite ? "Fechar Convites" : "Gerar Convites"}
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 bg-transparent"
                  onClick={() => setShowDeleteConfirm(selectedEvento.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Evento
                </Button>
              </div>

              {/* Gerador de convites */}
              {mostrarGeradorConvite && (
                <div className="pt-6">
                  <ReservaConvite eventoSelecionado={selectedEvento} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Confirmar Exclusão
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDelete(showDeleteConfirm)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Estatísticas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Eventos Cadastrados</CardTitle>
            <p className="text-gray-600">Total: {stats.total}</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-blue-100 text-blue-800 rounded p-4 shadow">
              <p className="font-bold text-3xl">{stats.agendados}</p>
              <p>Agendados</p>
            </div>
            <div className="bg-green-100 text-green-800 rounded p-4 shadow">
              <p className="font-bold text-3xl">{stats.esteMes}</p>
              <p>Este Mês</p>
            </div>
            <div className="bg-gray-100 text-gray-800 rounded p-4 shadow">
              <p className="font-bold text-3xl">{stats.finalizados}</p>
              <p>Finalizados</p>
            </div>
          </CardContent>
        </Card>

        {/* Filtro e busca */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Input
            placeholder="Buscar por nome, local ou responsável"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow max-w-xl"
            spellCheck={false}
            autoComplete="off"
          />

          {/* Filtros */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1"
          >
            <option value="todos">Todos os Tipos</option>
            {tiposEvento.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>
                {tipo.label}
              </option>
            ))}
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1"
          >
            <option value="todos">Todas as Datas</option>
            <option value="hoje">Hoje</option>
            <option value="amanha">Amanhã</option>
            <option value="semana">Próxima Semana</option>
            <option value="mes">Próximo Mês</option>
            <option value="passados">Passados</option>
          </select>

          {/* Ordenação */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded border border-gray-300 px-3 py-1"
          >
            <option value="data">Ordenar por Data</option>
            <option value="nome">Ordenar por Nome</option>
            <option value="tipo">Ordenar por Tipo</option>
            <option value="criacao">Ordenar por Criação</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-1 border rounded border-gray-300"
            title={`Ordem: ${sortOrder === "asc" ? "Ascendente" : "Descendente"}`}
          >
            {sortOrder === "asc" ? <SortAsc className="inline-block w-5 h-5" /> : <SortDesc className="inline-block w-5 h-5" />}
          </button>
        </div>

        {/* Lista de Eventos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.length === 0 ? (
            <p className="text-center col-span-full text-gray-600 mt-12">Nenhum evento encontrado.</p>
          ) : (
            filteredEventos.map((evento) => {
              const tipo = tiposEvento.find((t) => t.value === evento.tipoEvento)
              const status = getEventStatus(evento)

              return (
                <Card
                  key={evento.id}
                  className="border-0 shadow cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedEvento(evento)}
                >
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg truncate">{evento.nomeEvento}</h3>
                      {tipo && <Badge className={tipo.color + " border"}>{tipo.label}</Badge>}
                    </div>
                    <p className="text-gray-600">{evento.local}</p>
                    <p className="text-gray-600 text-sm">{formatDate(evento.data)}</p>
                    <Badge className={status.color + " border self-start"}>{status.label}</Badge>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
