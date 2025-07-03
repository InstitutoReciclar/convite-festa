import { useState } from "react";
import QRCode from "react-qr-code";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function GerarConvite() {
  const [codigo, setCodigo] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");

  async function gerar() {
    if (!nome || !email) {
      alert("Preencha nome e email");
      return;
    }
    try {
      const id = uuidv4();
      await setDoc(doc(db, "convites", id), {
        nome,
        email,
        status: "pendente",
        codigo: id,
        eventName: "Conferência Tech 2024",
        location: "Centro de Convenções São Paulo",
        date: "15 de Dezembro, 2024",
        time: "14:00 - 18:00",
        guests: [nome], // Exemplo simples, só o nome do comprador
      });
      setCodigo(id);
    } catch (err) {
      alert("Erro ao gerar convite");
      console.error(err);
    }
  }

  const url = codigo ? `${window.location.origin}/validador?codigo=${codigo}` : "";

  return (
    <div style={{ padding: 20 }}>
      <h1>Gerar Convite</h1>
      <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value)} />
      <br />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <br />
      <button onClick={gerar}>Gerar Convite</button>

      {codigo && (
        <div style={{ marginTop: 20 }}>
          <h2>Convite gerado para {nome}</h2>
          <QRCode value={url} size={256} />
          <p>URL: {url}</p>
        </div>
      )}
    </div>
  );
}
