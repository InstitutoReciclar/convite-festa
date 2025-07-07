import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  PartyPopper,
  Calendar,
  Eye,
  Ticket,
  Users,
  Plus,
  QrCode,
  Sparkles,
  Music,
  MapPin,
  TrendingUp,
  Zap,
  ArrowRight,
  Gift,
  Star,
  User
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { ref, get, child } from "firebase/database"
import { dbRealtime } from "../../firebase"
import logo from '../../public/Reciclar_30anos_Blocado_Positivo.png'

export default function Home() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedCard, setSelectedCard] = useState(null)

  const [eventsCount, setEventsCount] = useState(0)
  const [invitesCount, setInvitesCount] = useState(0)
  const [participantsCount, setParticipantsCount] = useState(0)
  const [presenceRate, setPresenceRate] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    async function fetchStats() {
      const dbRef = ref(dbRealtime)

      // Buscar eventos e filtrar futuros (ativos)
      const eventosSnap = await get(child(dbRef, "eventos"))
      const eventos = eventosSnap.exists() ? eventosSnap.val() : {}
      const hoje = new Date()
      const eventosAtivos = Object.values(eventos).filter(evento => {
        const dataEvento = new Date(evento.data)
        return dataEvento >= hoje
      })
      setEventsCount(eventosAtivos.length)

      // Buscar convites
      const convitesSnap = await get(child(dbRef, "convites"))
      const convites = convitesSnap.exists() ? convitesSnap.val() : {}
      const convitesArray = Object.values(convites)
      setInvitesCount(convitesArray.length)

      // Contar participantes presentes (convites com status "presente")
      const presentes = convitesArray.filter(c => c.status === "presente").length
      setParticipantsCount(presentes)

      // Calcular taxa de presença
      setPresenceRate(Math.round((presentes / (convitesArray.length || 1)) * 100))
    }

    fetchStats()
  }, [])
  const navigate = useNavigate()

  const quickStats = [
    { label: "Eventos Ativos", value: eventsCount, icon: Calendar, color: "text-blue-600" },
    { label: "Convites Gerados", value: invitesCount, icon: Ticket, color: "text-green-600" },
    { label: "Participantes", value: participantsCount, icon: Users, color: "text-purple-600" },
    { label: "Taxa de Presença", value: `${presenceRate}%`, icon: TrendingUp, color: "text-orange-600" },
  ]

  const menuOptions = [
    {
      id: "criar-evento",
      title: "Criar Evento",
      description: "Organize festas, reuniões e celebrações",
      icon: PartyPopper,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconColor: "text-purple-600",
      features: ["Tipos variados de evento", "Localização automática", "Gestão completa"],
      action: () => navigate("/CriarEvento"),
    },
    {
      id: "visualizar-eventos",
      title: "Visualizar Eventos",
      description: "Gerencie todos os seus eventos cadastrados",
      icon: Eye,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-50",
      iconColor: "text-blue-600",
      features: ["Lista completa", "Filtros avançados", "Status em tempo real"],
      action: () => navigate("/ConsultarEvento"),
    },
    {
      id: "criar-convites",
      title: "Criar Convites",
      description: "Gere convites com QR Code para seus eventos",
      icon: Ticket,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-50",
      iconColor: "text-green-600",
      features: ["QR Code automático", "Dados do convidado", "Validação digital"],
      action: () => navigate("/CriarConvites"),
    },
    {
      id: "visualizar-convites",
      title: "Visualizar Convites",
      description: "Acompanhe todos os convites gerados",
      icon: QrCode,
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-gradient-to-br from-orange-50 to-yellow-50",
      iconColor: "text-orange-600",
      features: ["Scanner QR Code", "Lista de convidados", "Estatísticas"],
      action: () => navigate("/ListaConvidados"),
    },
        {
      id: "register-user",
      title: "Cadastre Usuários",
      description: "Cadastre usuários para facilitar o trabalho",
      icon: User,
      color: "from-orange-700 to-yellow-700",
      bgColor: "bg-gradient-to-br from-orange-30 to-yellow-40",
      iconColor: "text-orange-600",
      features: ["Acessos com Google", "E-mail e Senha", "Foto de Perfil"],
      action: () => navigate("/register-user"),
    },
  ]

  const formatTime = (date) => date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const formatDate = (date) => date.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-0 shadow-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <CardHeader className="relative z-10 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                  <CardTitle className="text-4xl font-bold">{getGreeting()}! 👋</CardTitle>
                  <Music className="h-8 w-8 animate-bounce" />
                </div>
                <p className="text-xl text-indigo-100">Bem-vindo a plataforma de eventos Instituto Reciclar</p>
                <p className="text-indigo-200">{formatDate(currentTime)} • {formatTime(currentTime)}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-indigo-200">Plataforma de Eventos</p>
                  <p className="text-lg font-semibold">Instituto Reciclar</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  <img src={logo} alt="Logo Instituto Reciclar" className="w-12 h-12 object-contain" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="h-6 w-6 text-yellow-500" />O que você gostaria de fazer?
                </CardTitle>
                <p className="text-gray-600">Escolha uma das opções abaixo para começar</p>
              </CardHeader>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuOptions.map((option) => (
                <Card
                  key={option.id}
                  className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${selectedCard === option.id ? "ring-4 ring-purple-300" : ""} ${option.bgColor}`}
                  onMouseEnter={() => setSelectedCard(option.id)}
                  onMouseLeave={() => setSelectedCard(null)}
                  onClick={option.action}
                >
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className={`p-4 rounded-2xl bg-white shadow-md ${option.iconColor}`}>
                        <option.icon className="h-8 w-8" />
                      </div>
                      <Badge variant="secondary" className="bg-white bg-opacity-70">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-800">{option.title}</h3>
                      <p className="text-gray-600 text-lg">{option.description}</p>
                    </div>
                    <div className="space-y-2">
                      {option.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button className={`w-full h-12 text-lg font-semibold bg-gradient-to-r ${option.color} hover:shadow-lg transition-all duration-300`}>
                      Acessar
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Evento Rápido
                </Button>
                <Button onClick={() => navigate("/ConsultaConvidado")} variant="outline" className="w-full justify-start bg-transparent">
                  <QrCode className="h-4 w-4 mr-2" />
                  Escanear QR Code
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => navigate("/ListaConvidados")}>
                  <Users className="h-4 w-4 mr-2" />
                  Lista de Convidados
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Próximos Eventos
                </Button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Gift className="h-5 w-5" />
                  Dica do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 mb-3">
                  💡 Use o sistema de QR Code para facilitar o check-in dos seus convidados no evento!
                </p>
                <Button size="sm" variant="outline" className="bg-white bg-opacity-50" onClick={() => navigate("/ConsultaConvidado")}>
                  Saiba Mais
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <PartyPopper className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Instituto Reciclar</p>
                  <p className="text-sm text-gray-300">Uma plataforma completa de eventos</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Brasil</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
