"use client";

import { useState } from "react";
import { InviteForm } from "@/components/invite-form";
import { InviteList } from "@/components/invite-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function Home() {
  const [invites, setInvites] = useState<Invite[]>([]);

  const addInvite = (invite: Invite) => {
    setInvites((prev) => [...prev, invite]);
    toast("Invitación creada", {
      description: `Se ha creado la invitación para ${invite.name} exitosamente.`,
    });
  };

  const deleteInvite = (id: string) => {
    const inviteToDelete = invites.find((invite) => invite.id === id);
    setInvites((prev) => prev.filter((invite) => invite.id !== id));

    if (inviteToDelete) {
      toast("Invitación eliminada", {
        description: `Se ha eliminado la invitación para ${inviteToDelete.name}.`,
      });
    }
  };

  return (
    <main className="container mx-auto max-w-4xl p-4">
      <h1 className="my-6 text-center text-3xl font-bold">
        Registro de invitados
      </h1>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Crear invitación</TabsTrigger>
          <TabsTrigger value="active">
            Invitaciones activas ({invites.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="create" className="mt-6">
          <InviteForm onInviteCreated={addInvite} />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <InviteList invites={invites} onDelete={deleteInvite} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
