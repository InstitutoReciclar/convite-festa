import { useEffect, useState } from "react"
import { ref, onValue } from "firebase/database"
import QRCode from "qrcode.react"
import { dbRealtime } from "../../firebase"

const QRConvite = ({ idEvento, idConvite }) => {
  const [convite, setConvite] = useState(null)

  useEffect(() => {
    if (!idEvento || !idConvite) return
    const conviteRef = ref(dbRealtime, `convites/${idEvento}/${idConvite}`)
    const unsubscribe = onValue(conviteRef, (snapshot) => {
      const dados = snapshot.val()
      setConvite(dados ? { id: idConvite, ...dados } : null)
    })
    return () => unsubscribe()
  }, [idEvento, idConvite])

  if (!convite) return <p>Carregando...</p>

  return (
    <div>
      <QRCode value={convite.id} size={200} />
    </div>
  )
}

export default QRConvite
