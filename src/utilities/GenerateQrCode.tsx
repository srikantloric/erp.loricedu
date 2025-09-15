import React, { useEffect, useState } from "react";
import { generateQRCodeBase64 } from "./UtilitiesFunctions";

const QRCodeGenerator: React.FC = () => {
  const [qrCodeBase64, setQRCodeBase64] = useState<string | null>(null);
  const text = "Hello, QR Code!";


  const handleGenerateQRCode = async () => {
    try {
      const base64Image = await generateQRCodeBase64(text);
      setQRCodeBase64(base64Image);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };
  useEffect(() => {
    handleGenerateQRCode();
  }, []);
  return (
    <>
      <button onClick={handleGenerateQRCode}>Generate QR Code</button>
      {qrCodeBase64 && (
        <div>
          <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code" />
        </div>
      )}
    </>
  
  );
};

export default QRCodeGenerator;
