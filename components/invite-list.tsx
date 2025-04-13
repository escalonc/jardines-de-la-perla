"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { formatDistanceToNow } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface InviteListProps {
  invites: Invite[];
  onDelete: (id: string) => void;
}

export function InviteList({ invites, onDelete }: InviteListProps) {
  if (invites.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium">No active invites</h3>
        <p className="text-muted-foreground">Create an invite to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="truncate">{invite.title}</CardTitle>
                <CardDescription>
                  Created {formatDistanceToNow(new Date(invite.createdAt))} ago
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                onClick={() => onDelete(invite.id)}
                title="Delete invite"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <QRCodeDisplay invite={invite} compact size={180} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
