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

interface Invite {
  id: string;
  name: string;
  visits: number;
  title: string;
  description: string;
  createdAt: string;
}

interface InviteFormProps {
  onInviteCreated: (invite: Invite) => void;
}

export function InviteForm({ onInviteCreated }: InviteFormProps) {
  const [name, setName] = useState("");
  const [visits, setVisits] = useState("1");
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !visits) return;

    const newInvite: Invite = {
      id: generateUniqueId(),
      name,
      visits: Number.parseInt(visits),
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
      setVisits("1");
      setGeneratedInvite(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 auto-rows-fr">
      {/* Form Card - Fixed height */}
      <Card className="h-[650px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Crear Nueva Invitación</CardTitle>
          <CardDescription>
            Complete el formulario para generar un código QR de invitación
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col pb-0">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="space-y-4 flex-grow">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Invitado</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingrese el nombre"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visits">Número de Visitas Permitidas</Label>
                <Input
                  id="visits"
                  type="number"
                  min="1"
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="pt-6 pb-6">
              <Button type="submit" className="w-full">
                Generar Código QR
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-shrink-0 invisible">
          {/* Invisible footer to match structure with QR card */}
          <div className="flex justify-between w-full">
            <Button variant="outline">Cancelar</Button>
            <Button>Guardar</Button>
          </div>
        </CardFooter>
      </Card>

      {/* QR Code Card - Same fixed height */}
      <Card className="h-[650px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            {generatedInvite
              ? "Invitación Generada"
              : "Vista Previa del Código QR"}
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
              <Button onClick={handleSave}>Guardar invitación</Button>
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
