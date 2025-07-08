import { useEffect, useState } from "react"
import { getDownloadURL, ref as storageRef } from "firebase/storage"
import { dbRealtime, storage } from "../../firebase"
import { ref, onValue } from "firebase/database"
import QRCode from "qrcode.react" // ou "react-qr-code" se for o outro

const QRConvite = ({ idEvento, idConvite }) => {
  const [convite, setConvite] = useState(null)

  useEffect(() => {
    if (!idEvento || !idConvite) return

    const conviteRef = ref(dbRealtime, `convites/${idEvento}/${idConvite}`)
    onValue(conviteRef, (snapshot) => {
      const dados = snapshot.val()
      if (dados) {
        setConvite({ id: idConvite, ...dados })
      }
    })
  }, [idEvento, idConvite])

  if (!convite) return <p>Carregando...</p>

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCode value={convite.id} size={200} />
      <p className="text-sm text-gray-500">Mostre este código na entrada do evento</p>
    </div>
  )
}

export default QRConvite
