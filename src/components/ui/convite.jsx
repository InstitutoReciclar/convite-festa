import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export default function ConviteConfirmado() {
  const { codigo } = useParams();
  const [convite, setConvite] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarConvite() {
      const ref = doc(db, "convites", codigo);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setErro("Convite não encontrado");
        return;
      }

      const dados = snap.data();

      if (dados.status === "usado") {
        setErro("Convite já utilizado");
        return;
      }

      await updateDoc(ref, { status: "usado" });
      setConvite(dados);
    }
    carregarConvite();
  }, [codigo]);

  if (erro) return <p style={{ color: "red" }}>{erro}</p>;
  if (!convite) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Convite Confirmado!</h1>
      <p>Nome: {convite.nome}</p>
      <p>Email: {convite.email}</p>
      <p>Evento: {convite.eventName}</p>
      <p>Local: {convite.location}</p>
      <p>Data: {convite.date}</p>
      <p>Horário: {convite.time}</p>
      <p>Status: {convite.status}</p>
    </div>
  );
}
