"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { generateUniqueId } from "@/lib/utils";

// Fixed values as per requirements
const FIXED_TITLE = "Jardines de La Perla";
const FIXED_DESCRIPTION = "código de invitación";

interface InviteFormProps {
  onInviteCreated: (invite: Invite) => void;
}

export function InviteForm({ onInviteCreated }: InviteFormProps) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(0);
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) return;

    const newInvite: Invite = {
      id: generateUniqueId(),
      name,
      guests,
      title: FIXED_TITLE,
      description: FIXED_DESCRIPTION,
      createdAt: new Date().toISOString(),
    };

    setGeneratedInvite(newInvite);
  };

  const handleSave = () => {
    if (generatedInvite) {
      onInviteCreated(generatedInvite);
      // Reset form
      setName("");
      setGuests(0);
      setGeneratedInvite(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 auto-rows-fr">
      {/* Form Card - Fixed height */}
      <Card className="h-[650px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Crear nueva invitación</CardTitle>
          <CardDescription>
            Complete el formulario para generar un código QR de invitación
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col pb-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="space-y-4 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la persona invitada</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingrese el nombre de la persona invitada"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">
                  Número de acompañantes permitidos
                </Label>
                <Input
                  id="guests"
                  type="number"
                  min={0}
                  max={10}
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" className="w-full">
                Generar Código QR
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR Code Card - Same fixed height */}
      <Card className="h-[650px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            {generatedInvite
              ? "Invitación generada"
              : "Vista previa del código QR"}
          </CardTitle>
          <CardDescription>
            {generatedInvite
              ? `Código QR para ${generatedInvite.name}`
              : "Complete el formulario para generar una invitación"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center py-8">
          {generatedInvite ? (
            <QRCodeDisplay invite={generatedInvite} />
          ) : (
            <div className="w-full max-w-xs h-[400px] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20">
              <p className="text-muted-foreground text-center px-4">
                Su código QR aparecerá aquí después de generarlo
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-shrink-0">
          {generatedInvite ? (
            <div className="flex justify-between w-full">
              <Button
                variant="outline"
                onClick={() => setGeneratedInvite(null)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave}>Guardar</Button>
            </div>
          ) : (
            <div className="w-full text-center text-sm text-muted-foreground">
              Genera un código QR para habilitar las opciones de compartir
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
