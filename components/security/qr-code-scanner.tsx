"use client";

import { useState, useEffect } from "react";
import { QrReader } from "react-qr-reader";
import { Button } from "@/components/ui/button";
import { Scan } from "lucide-react";

interface QRCodeScannerProps {
  onScan: (data: string) => void;
}

export function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResult = (result: any) => {
    if (!result) return;

    try {
      const text = result.toString();
      if (text && text.trim().length > 0) {
        setIsScanning(false);
        onScan(text);
      }
    } catch (err) {
      console.error("Error processing QR code:", err);
      setError("Error al procesar el código QR");
    }
  };

  const handleError = (error: Error) => {
    console.error("QR Scanner error:", error);
    setError(
      "Error al acceder a la cámara. Por favor:\n\n" +
        "1. Asegúrate de estar usando Safari\n" +
        "2. Toca 'Permitir' cuando se solicite acceso a la cámara\n" +
        "3. Si no ves el mensaje de permisos, ve a Ajustes > Safari > Cámara y activa el permiso",
    );
  };

  if (!isClient) {
    return (
      <div className="border-border bg-muted/50 flex aspect-square w-full items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando escáner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {error ? (
        <div className="text-destructive text-center">
          <p className="whitespace-pre-line">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setError(null);
              setIsScanning(true);
            }}
          >
            <Scan className="mr-2 size-4" />
            Intentar de nuevo
          </Button>
        </div>
      ) : isScanning ? (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
            <div className="absolute inset-0">
              <QrReader
                onResult={(result) => {
                  if (result) {
                    handleResult(result);
                  }
                }}
                constraints={{ facingMode: "environment" }}
                scanDelay={500}
                videoId="qr-video"
                videoStyle={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                containerStyle={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              />
            </div>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="border-primary size-64 rounded-lg border-2" />
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsScanning(false)}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Presiona el botón para comenzar a escanear el código QR
          </p>
          <Button onClick={() => setIsScanning(true)}>
            <Scan className="mr-2 size-4" />
            Comenzar Escaneo
          </Button>
        </div>
      )}
    </div>
  );
}
