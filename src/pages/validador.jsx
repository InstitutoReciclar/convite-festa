import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

export default function Validador() {
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("scanner", { fps: 10, qrbox: 250 });

    scanner.render(text => {
      scanner.clear();

      // Extrai código do URL no QR code
      try {
        const codigo = new URL(text).searchParams.get("codigo");
        if (!codigo) throw new Error("Código inválido");

        navigate(`/convite/${codigo}`);
      } catch {
        alert("QR Code inválido");
      }
    });
  }, [navigate]);

  return <div id="scanner" style={{ width: 300, margin: "auto" }}></div>;
}
