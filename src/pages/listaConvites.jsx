import React, { useEffect, useState } from "react"
import { db } from "../../firebase"
import { ref, onValue } from "firebase/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Users } from "lucide-react"

export default function ListaConvites() {
  const [convites, setConvites] = useState([])
  const [erro, setErro] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const convitesRef = ref(db, "convites")
    const unsubscribe = onValue(
      convitesRef,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          // transforma objeto em array com id
          const lista = Object.entries(data).map(([id, convite]) => ({
            id,
            ...convite,
          }))
          setConvites(lista)
        } else {
          setConvites([])
        }
        setLoading(false)
        setErro(null)
      },
      (error) => {
        setErro("Erro ao carregar convites: " + error.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  function badgeStatus(status) {
    switch (status) {
      case "Presente":
        return (
          <Badge className="bg-green-200 text-green-800" variant="outline">
            Presente
          </Badge>
        )
      case "Ausente":
        return (
          <Badge className="bg-red-200 text-red-800" variant="outline">
            Ausente
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-200 text-gray-600" variant="outline">
            Pendente
          </Badge>
        )
    }
  }

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 font-semibold">
        Carregando convites...
      </div>
    )

  if (erro)
    return (
      <div className="p-6 text-center text-red-600 font-semibold">{erro}</div>
    )

  if (convites.length === 0)
    return (
      <div className="p-6 text-center text-gray-600 font-semibold">
        Nenhum convite encontrado.
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Users className="h-5 w-5 text-blue-600" />
            Lista de Convites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-2 px-4">Nome</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {convites.map(({ id, comprador, convidado, status }) => {
                // Exibe nome do convidado, se houver, senão comprador
                const nomeCompleto =
                  convidado?.nome && convidado?.sobrenome
                    ? `${convidado.nome} ${convidado.sobrenome}`
                    : `${comprador.nome} ${comprador.sobrenome}`
                const email = convidado?.email || comprador.email

                return (
                  <tr
                    key={id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4">{nomeCompleto}</td>
                    <td className="py-3 px-4">{email}</td>
                    <td className="py-3 px-4">{badgeStatus(status)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
