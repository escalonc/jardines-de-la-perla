"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { QRCodeDisplay } from "@/components/qr-code-display";
import { generateUniqueId } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Share, Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
// Fixed values as per requirements
const FIXED_TITLE = "Jardines de La Perla";
const FIXED_DESCRIPTION = "código de invitación";

interface InviteFormProps {
  onInviteCreated: (invite: Invite) => void;
}

const inviteFormSchema = z.object({
  name: z
    .string({
      required_error: "El nombre es requerido",
    })
    .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
    .max(50, { message: "El nombre no puede tener más de 50 caracteres" }),
  guests: z
    .number({
      required_error: "El número de acompañantes es requerido",
    })
    .min(0, { message: "El número de acompañantes no puede ser negativo" })
    .max(10, { message: "No se permiten más de 10 acompañantes" }),
  isFrequent: z.boolean(),
});

export function InviteForm({ onInviteCreated }: InviteFormProps) {
  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      name: "",
      guests: 0,
      isFrequent: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [shareSupported, setShareSupported] = useState(false);

  function clearForm() {
    form.reset();
    setGeneratedInvite(null);
    setImageBlob(null);
    setShareSupported(false);
    form.setFocus("name");
  }

  useEffect(() => {
    clearForm();
  }, []);

  // Memoized share support check
  const checkShareSupport = useCallback(async () => {
    try {
      const supported =
        typeof navigator !== "undefined" &&
        !!navigator.share &&
        !!navigator.canShare;

      if (supported) {
        const dummyFile = new File([new Blob()], "test.png", {
          type: "image/png",
        });
        const canShareFiles = await navigator.canShare({
          files: [dummyFile],
        });
        setShareSupported(canShareFiles);
      } else {
        setShareSupported(false);
      }
    } catch (error) {
      console.error("Error checking share support:", error);
      setShareSupported(false);
    }
  }, []);

  useEffect(() => {
    checkShareSupport();
  }, [checkShareSupport]);

  async function onSubmit(values: z.infer<typeof inviteFormSchema>) {
    try {
      setIsGenerating(true);
      const newInvite: Invite = {
        id: generateUniqueId(),
        name: values.name,
        guests: values.guests,
        title: FIXED_TITLE,
        description: FIXED_DESCRIPTION,
        createdAt: new Date().toISOString(),
      };

      setGeneratedInvite(newInvite);
      setIsSheetOpen(true);
      onInviteCreated(newInvite);
    } catch (error) {
      toast.error(
        "Error al generar la invitación. Por favor, intente nuevamente.",
      );
      console.error("Error generating invite:", error);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleShare = async () => {
    if (!imageBlob || !shareSupported) return;

    try {
      setIsLoading(true);
      const file = new File(
        [imageBlob],
        `invitacion-${generatedInvite?.name}.png`,
        { type: "image/png" },
      );
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invitación para ${generatedInvite?.name}`,
          text: `Invitación para ${generatedInvite?.name} con ${generatedInvite?.guests} acompañantes`,
        });
        toast.success("Invitación compartida exitosamente");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.name !== "AbortError" &&
        !(error instanceof DOMException && error.name === "NotAllowedError")
      ) {
        console.error("Error sharing:", error);
        toast.error(
          "No se pudo compartir la invitación. Por favor, intente nuevamente.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!imageBlob) return;

    try {
      setIsLoading(true);
      await navigator.clipboard.write([
        new ClipboardItem({
          [imageBlob.type]: imageBlob,
        }),
      ]);
      toast.success("Imagen copiada al portapapeles");
    } catch (error) {
      console.error("Error copying:", error);
      toast.error(
        "No se pudo copiar la imagen. Por favor, intente nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageBlob) return;

    try {
      const url = URL.createObjectURL(imageBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invitacion-${generatedInvite?.name}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Imagen descargada exitosamente");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error(
        "No se pudo descargar la imagen. Por favor, intente nuevamente.",
      );
    }
  };

  return (
    <div className="grid auto-rows-fr gap-6">
      {/* Form Card */}
      <Card className="flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Crear nueva invitación</CardTitle>
          <CardDescription>
            Complete el formulario para generar un código QR de invitación
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-grow flex-col pb-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingrese el nombre"
                        {...field}
                        aria-label="Nombre del invitado"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de acompañantes</FormLabel>
                    <FormControl>
                      <Input
                        type="string"
                        placeholder="Ingrese el número de acompañantes"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          return field.onChange(isNaN(value) ? 0 : value);
                        }}
                        aria-label="Número de acompañantes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isFrequent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitante frecuente</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Visitante frecuente"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    "Generar QR"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={clearForm}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* QR Code Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="flex h-[85vh] flex-col p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Invitación generada</SheetTitle>
          </SheetHeader>
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            {generatedInvite ? (
              <QRCodeDisplay
                invite={generatedInvite}
                onImageBlobGenerated={setImageBlob}
                onShareSupported={setShareSupported}
              />
            ) : (
              <div className="bg-muted/20 flex h-48 w-full max-w-xs items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground px-4 text-center">
                  Su código QR aparecerá aquí después de generarlo
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center space-y-4 border-t px-4 py-6">
            <div className="flex items-center justify-center gap-4">
              {shareSupported && (
                <Button
                  onClick={handleShare}
                  className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                  variant="outline"
                  title="Compartir invitación"
                  disabled={isLoading}
                  aria-label="Compartir invitación"
                >
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Share className="h-6 w-6" />
                  )}
                </Button>
              )}
              <Button
                onClick={handleCopy}
                className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                variant="outline"
                title="Copiar al portapapeles"
                disabled={isLoading}
                aria-label="Copiar al portapapeles"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Copy className="h-6 w-6" />
                )}
              </Button>
              <Button
                onClick={handleDownload}
                className="h-14 w-14 rounded-full bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800"
                variant="outline"
                title="Descargar imagen"
                disabled={isLoading}
                aria-label="Descargar imagen"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
