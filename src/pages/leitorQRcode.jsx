import { useEffect, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import QRCode from "qrcode.react";
import { dbRealtime } from "../../firebase";

const QRConvite = ({ idEvento, idConvite }) => {
  const [convite, setConvite] = useState(null);

  useEffect(() => {
    if (!idEvento || !idConvite) return;

    const conviteRef = ref(dbRealtime, `convites/${idEvento}/${idConvite}`);

    const unsubscribe = onValue(conviteRef, (snapshot) => {
      const dados = snapshot.val();
      if (dados) {
        setConvite({ id: idConvite, ...dados });
      } else {
        setConvite(null);
      }
    });

    return () => unsubscribe();
  }, [idEvento, idConvite]);

  if (!convite) return <p>Carregando...</p>;

  return (
    <div className="flex flex-col items-center space-y-4">
      <QRCode value={convite.id} size={200} />
      <p className="text-sm text-gray-500">Mostre este código na entrada do evento</p>
    </div>
  );
};

export default QRConvite;
