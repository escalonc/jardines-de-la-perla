"use client";

import { useState } from "react";
import { QRCodeScanner } from "@/components/security/qr-code-scanner";
import { InvitationDetails } from "@/components/security/invitation-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SecurityPage() {
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleScan = (data: string) => {
    setIsLoading(true);
    try {
      setScannedId(data);
      setIsSheetOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      // TODO: Implement accept logic
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Acceso aprobado", {
        description: "Se ha aprobado el acceso del invitado.",
      });
      setIsSheetOpen(false);
      setScannedId(null);
    } catch (error) {
      toast.error("Error al aprobar acceso", {
        description: "No se pudo aprobar el acceso del invitado.",
      });
    }
  };

  const handleDecline = async () => {
    try {
      // TODO: Implement decline logic
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.error("Acceso denegado", {
        description: "Se ha denegado el acceso del invitado.",
      });
      setIsSheetOpen(false);
      setScannedId(null);
    } catch (error) {
      toast.error("Error al denegar acceso", {
        description: "No se pudo denegar el acceso del invitado.",
      });
    }
  };

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="my-6 text-center text-3xl font-bold">
        Punto de Control de Seguridad
      </h1>

      <div className="flex flex-col gap-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Escanear Código QR</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="aspect-square w-full">
              <QRCodeScanner onScan={handleScan} />
            </div>
          </CardContent>
        </Card>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader className="px-4">
              <SheetTitle>Detalles de la Invitación</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col gap-6 p-4">
              <div className="flex-1">
                {isLoading ? (
                  <div className="text-muted-foreground text-center">
                    Cargando detalles de la invitación...
                  </div>
                ) : (
                  <InvitationDetails invitationId={scannedId} />
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDecline}
                  disabled={isLoading}
                >
                  Denegar Acceso
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAccept}
                  disabled={isLoading}
                >
                  Aprobar Acceso
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}
