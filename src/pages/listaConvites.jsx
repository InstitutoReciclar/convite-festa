import { useEffect, useState } from "react"
import { dbRealtime } from "../../firebase" 
import { ref, onValue } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Search, Calendar, Mail, CreditCard, User, Eye, Filter, Download, RefreshCw } from "lucide-react"

export default function ListaConvites() {
  const [convites, setConvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredConvites, setFilteredConvites] = useState([])
  const [selectedConvite, setSelectedConvite] = useState(null)

  useEffect(() => {
    const convitesRef = ref(dbRealtime, "convites")

    // Escuta dados em tempo real
    const unsubscribe = onValue(
      convitesRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          // Converte objeto para array
          const lista = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }))
          setConvites(lista)
          setFilteredConvites(lista)
        } else {
          setConvites([])
          setFilteredConvites([])
        }
        setLoading(false)
      },
      (error) => {
        console.error("Erro ao buscar convites:", error)
        setLoading(false)
      },
    )

    // Cleanup na desmontagem
    return () => unsubscribe()
  }, [])

  // Filtrar convites baseado no termo de busca
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConvites(convites)
    } else {
      const filtered = convites.filter((convite) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          convite.id.toLowerCase().includes(searchLower) ||
          convite.comprador?.nome?.toLowerCase().includes(searchLower) ||
          convite.comprador?.sobrenome?.toLowerCase().includes(searchLower) ||
          convite.comprador?.email?.toLowerCase().includes(searchLower) ||
          convite.comprador?.cpf?.includes(searchTerm) ||
          convite.convidado?.nome?.toLowerCase().includes(searchLower) ||
          convite.convidado?.sobrenome?.toLowerCase().includes(searchLower) ||
          convite.convidado?.email?.toLowerCase().includes(searchLower) ||
          convite.convidado?.cpf?.includes(searchTerm)
        )
      })
      setFilteredConvites(filtered)
    }
  }, [searchTerm, convites])

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getConviteStats = () => {
    const total = convites.length
    const comConvidado = convites.filter((c) => c.convidado?.nome).length
    const semConvidado = total - comConvidado
    return { total, comConvidado, semConvidado }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Carregando convites...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (convites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg text-gray-600">Nenhum convite encontrado</p>
                <p className="text-sm text-gray-500 mt-2">Os convites aparecerão aqui quando forem criados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const stats = getConviteStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                  <Users className="h-6 w-6 text-blue-600" />
                  Lista de Convites
                </CardTitle>
                <p className="text-gray-600 mt-1">Gerencie e visualize todos os convites</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Convites</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Com Convidado</p>
                  <p className="text-2xl font-bold text-green-600">{stats.comConvidado}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sem Convidado</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.semConvidado}</p>
                </div>
                <User className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email, CPF ou ID do convite..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Mostrando {filteredConvites.length} de {convites.length} convites
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabela Desktop */}
        <Card className="border-0 shadow-lg hidden lg:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Comprador</TableHead>
                  <TableHead className="font-semibold">Contato</TableHead>
                  <TableHead className="font-semibold">Convidado</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConvites.map((convite) => (
                  <TableRow key={convite.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs">{convite.id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {convite.comprador?.nome} {convite.comprador?.sobrenome}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {convite.comprador?.cpf}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {convite.comprador?.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {convite.convidado?.nome ? (
                        <div>
                          <p className="font-medium">
                            {convite.convidado.nome} {convite.convidado.sobrenome}
                          </p>
                          <p className="text-sm text-gray-500">{convite.convidado.email}</p>
                        </div>
                      ) : (
                        <Badge variant="secondary">Sem convidado</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(convite.criadoEm)}
                      </div>
                    </TableCell>
                         <TableCell>
                     {convite.status}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedConvite(convite)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards Mobile */}
        <div className="lg:hidden space-y-4">
          {filteredConvites.map((convite) => (
            <Card key={convite.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {convite.comprador?.nome} {convite.comprador?.sobrenome}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {convite.comprador?.email}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedConvite(convite)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">CPF</p>
                      <p className="font-medium">{convite.comprador?.cpf}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID</p>
                      <p className="font-mono text-xs">{convite.id.substring(0, 12)}...</p>
                    </div>
                  </div>

                  {convite.convidado?.nome ? (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Convidado</p>
                      <p className="text-sm text-blue-700">
                        {convite.convidado.nome} {convite.convidado.sobrenome}
                      </p>
                      <p className="text-xs text-blue-600">{convite.convidado.email}</p>
                    </div>
                  ) : (
                    <Badge variant="secondary">Sem convidado</Badge>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {formatDate(convite.criadoEm)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal de Detalhes (placeholder) */}
        {selectedConvite && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detalhes do Convite</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedConvite(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">ID do Convite</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedConvite.id}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Comprador</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nome:</strong> {selectedConvite.comprador?.nome} {selectedConvite.comprador?.sobrenome}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedConvite.comprador?.email}
                    </p>
                    <p>
                      <strong>CPF:</strong> {selectedConvite.comprador?.cpf}
                    </p>
                  </div>
                </div>

                {selectedConvite.convidado?.nome && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-2">Convidado</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Nome:</strong> {selectedConvite.convidado.nome} {selectedConvite.convidado.sobrenome}
                        </p>
                        <p>
                          <strong>Email:</strong> {selectedConvite.convidado.email}
                        </p>
                        <p>
                          <strong>CPF:</strong> {selectedConvite.convidado.cpf}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-sm text-gray-500">Data de Criação</p>
                  <p className="font-medium">{formatDate(selectedConvite.criadoEm)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
