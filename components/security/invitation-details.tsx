"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Invitation {
  id: string;
  residentName: string;
  guestName: string;
  guestCount: number;
  date: string;
  status: "pending" | "approved" | "declined";
}

interface InvitationDetailsProps {
  invitationId: string | null;
}

export function InvitationDetails({ invitationId }: InvitationDetailsProps) {
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to fetch invitation details
  const fetchInvitationDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      setInvitation({
        id,
        residentName: "John Doe",
        guestName: "Jane Smith",
        guestCount: 2,
        date: "2024-03-20",
        status: "pending",
      });
    } catch (err) {
      setError("Failed to fetch invitation details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (invitationId) {
      fetchInvitationDetails(invitationId);
    } else {
      setInvitation(null);
    }
  }, [invitationId]);

  if (!invitationId) {
    return (
      <div className="text-muted-foreground text-center">
        Escanea un código QR para ver los detalles de la invitación
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-center">
        Cargando detalles de la invitación...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!invitation) {
    return (
      <div className="text-muted-foreground text-center">
        No se encontraron detalles de la invitación
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <div className="font-medium">Residente:</div>
          <div>{invitation.residentName}</div>
        </div>
        <div className="grid gap-2">
          <div className="font-medium">Invitado:</div>
          <div>{invitation.guestName}</div>
        </div>
        <div className="grid gap-2">
          <div className="font-medium">Número de Invitados:</div>
          <div>{invitation.guestCount}</div>
        </div>
        <div className="grid gap-2">
          <div className="font-medium">Fecha:</div>
          <div>{new Date(invitation.date).toLocaleDateString()}</div>
        </div>
        <div className="grid gap-2">
          <div className="font-medium">Estado:</div>
          <div className="capitalize">{invitation.status}</div>
        </div>
      </CardContent>
    </Card>
  );
}
